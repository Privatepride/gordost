import { tgCall } from "../tgApi.js";
import { createRow, listRows, listTableFields, patchRow, type BaserowRow } from "./client.js";
import type { BaserowRuntimeConfig } from "./config.js";

const MSK = "Europe/Moscow";
const TABLE_INVITE_LINKS = 842;
const FIELD_INVITE_CODE = 7798;
const FIELD_REG_TELEGRAM_LINK = 7869;

export function rowVal(r: BaserowRow | undefined, snake: string): string {
  if (!r || typeof r !== "object") return "";
  let v: unknown = (r as Record<string, unknown>)[snake];
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(displayCell).filter(Boolean).join("\n");
  if (typeof v === "boolean") return v ? "да" : "нет";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    if (o.value != null) return String(o.value);
    if (o.name != null) return String(o.name);
    if (typeof o.text === "string") return o.text;
    if (typeof o.label === "string") return o.label;
    return "";
  }
  return String(v);
}

function displayCell(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return typeof v === "boolean" ? (v ? "да" : "нет") : String(v);
  }
  if (Array.isArray(v)) return v.map(displayCell).filter(Boolean).join(", ");
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (o.value != null) return String(o.value);
    if (o.name != null) return String(o.name);
    if (typeof o.text === "string") return o.text;
    return "";
  }
  return String(v);
}

function linesFromMultiField(arr: unknown): string[] {
  if (!Array.isArray(arr) || !arr.length) return [];
  return arr.map(displayCell).filter((s) => String(s).trim() !== "");
}

export function boolDb(v: unknown): boolean {
  if (v === true || v === 1 || v === "1" || v === "true") return true;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (o.value === true || o.value === 1) return true;
  }
  return false;
}

export function isProfileCompleteRow(r: BaserowRow): boolean {
  return boolDb(r.profile_complete);
}

export function residentEligible(r: BaserowRow | null | undefined): boolean {
  if (!r) return false;
  if (!isProfileCompleteRow(r)) return false;
  if (process.env.BASEROW_RELAX_MEMBER_CHECK === "1") return true;
  return boolDb(r.is_member);
}

export function rowTelegramDigits(r: BaserowRow): string {
  const t = rowVal(r, "telegram_id");
  return t !== "" ? String(t).replace(/\D/g, "") : "";
}

function scoreResidentRow(r: BaserowRow): number {
  let score = 0;
  if (boolDb(r.is_member)) score += 100;
  if (boolDb(r.profile_complete)) score += 40;
  if (String(rowVal(r, "espo_contact_id") || "").trim()) score += 10;
  if (String(rowVal(r, "full_name") || "").trim()) score += 4;
  if (String(rowVal(r, "first_name") || "").trim()) score += 2;
  return score;
}

function pickCanonicalResident(rows: BaserowRow[]): BaserowRow | null {
  if (!rows.length) return null;
  const scored = rows
    .filter((r) => r && r.id != null)
    .map((r) => ({ row: r, score: scoreResidentRow(r), id: Number(r.id) || Number.MAX_SAFE_INTEGER }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id - b.id;
  });
  return scored[0]?.row || null;
}

export function fileUrlFromCell(v: unknown): string {
  if (!v) return "";
  const arr = Array.isArray(v) ? v : [v];
  if (!arr.length) return "";
  const item = arr[0] as Record<string, unknown>;
  const u =
    (typeof item.url === "string" && item.url) ||
    (typeof item.download_url === "string" && item.download_url) ||
    (typeof (item.thumbnails as Record<string, unknown> | undefined)?.small === "object" &&
    (item.thumbnails as Record<string, unknown>).small
      ? ((item.thumbnails as Record<string, unknown>).small as Record<string, unknown>).url
      : "") ||
    "";
  if (!u) return "";
  if (String(u).startsWith("http://") || String(u).startsWith("https://")) return String(u);
  if (String(u).startsWith("/")) return `https://base.gordost.club${u}`;
  return `https://base.gordost.club/${u}`;
}

export async function getResidentByTelegram(cfg: BaserowRuntimeConfig, tgUserId: number): Promise<BaserowRow | null> {
  const rows = await listRows(cfg, cfg.tableResidents, {
    [`filter__field_${cfg.fieldTelegramId}__equal`]: String(tgUserId),
    size: "200",
  });
  return pickCanonicalResident(rows);
}

export async function getResidentByUsername(cfg: BaserowRuntimeConfig, usernameRaw: string): Promise<BaserowRow | null> {
  const username = String(usernameRaw || "").trim().replace(/^@/, "");
  if (!username) return null;
  const rows = await listRows(cfg, cfg.tableResidents, {
    [`filter__field_${cfg.fieldUsername}__equal`]: username,
    size: "200",
  });
  return pickCanonicalResident(rows);
}

function escHtml(s: string) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatDateRu(raw: string) {
  const t = String(raw || "").trim();
  if (!t) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  return t;
}

function usefulForClubHeading(r: BaserowRow) {
  const g = String(rowVal(r, "gender") || "")
    .trim()
    .toUpperCase()
    .replace(/\./g, "");
  if (g === "Ж" || g === "F" || g.startsWith("ЖЕН") || g === "FEMALE" || g === "W") return "Чем я могу быть полезна клубу";
  if (g === "М" || g === "M" || g.startsWith("МУЖ") || g === "MALE") return "Чем я могу быть полезен клубу";
  return "Чем я могу быть полезен клубу";
}

export function formatMyProfileMessage(r: BaserowRow): string {
  const fio = rowVal(r, "full_name") || rowVal(r, "first_name") || "";
  const city = rowVal(r, "city");
  const b = formatDateRu(rowVal(r, "birthday"));
  const cap = rowVal(r, "capital");
  const inc = rowVal(r, "monthly_income");
  const reg = formatDateRu(rowVal(r, "registration_date"));

  const lines: string[] = [];
  lines.push(`ФИО: <code>${fio ? escHtml(fio) : "—"}</code>`);
  lines.push(`Город: <code>${city ? escHtml(city) : "не указано"}</code>`);
  lines.push(`День рождения: <code>${b ? escHtml(b) : "не указано"}</code>`);
  lines.push(`Капитал: <code>${cap !== "" ? escHtml(cap) : "не указано"}</code>`);
  lines.push(`Доход (мес.): <code>${inc !== "" ? escHtml(inc) : "не указано"}</code>`);
  lines.push(`Дата регистрации: <code>${reg ? escHtml(reg) : "не указано"}</code>`);

  const invests = linesFromMultiField(r.invests_in as unknown);
  lines.push(`\n<b>Во что инвестирую:</b>\n${invests.length ? invests.map((x) => `- ${escHtml(x)}`).join("\n") : "- <i>не указано</i>"}`);

  const wants = linesFromMultiField(r.wants_to_invest as unknown);
  lines.push(`\n<b>Во что хотелось бы инвестировать:</b>\n${wants.length ? wants.map((x) => `- ${escHtml(x)}`).join("\n") : "- <i>не указано</i>"}`);

  const occupation = rowVal(r, "occupation") || rowVal(r, "what_i_do");
  lines.push(`\n<b>Чем я занимаюсь:</b>\n${occupation ? escHtml(occupation) : "<i>не указано</i>"}`);

  const useful = rowVal(r, "useful_for_club");
  lines.push(`\n<b>${usefulForClubHeading(r)}:</b>\n${useful ? escHtml(useful) : "<i>не указано</i>"}`);

  const req = rowVal(r, "personal_requests");
  lines.push(`\n<b>Мой текущий запрос:</b>\n${req ? escHtml(req) : "<i>не указано</i>"}`);

  return lines.join("\n");
}

export async function listResidentsForDirectory(cfg: BaserowRuntimeConfig, viewerTgId: number): Promise<BaserowRow[]> {
  const raw = await listRows(cfg, cfg.tableResidents, {});
  const viewer = String(viewerTgId).replace(/\D/g, "");
  return raw
    .filter((r) => r.id != null)
    .filter(isProfileCompleteRow)
    .filter((r) => !viewer || rowTelegramDigits(r) !== viewer)
    .sort((a, b) => Number(a.id) - Number(b.id));
}

export function formatResidentCard(r: BaserowRow): string {
  const name = rowVal(r, "full_name") || rowVal(r, "first_name") || `id ${r.id}`;
  const lines = [`Резидент: <code>${escHtml(name)}</code>`];
  const city = rowVal(r, "city");
  if (city) lines.push(`Город: <code>${escHtml(city)}</code>`);
  const cap = rowVal(r, "capital");
  if (cap !== "") lines.push(`Капитал: <code>${escHtml(cap)}</code>`);
  const inc = rowVal(r, "monthly_income");
  if (inc !== "") lines.push(`Доход (мес.): <code>${escHtml(inc)}</code>`);
  const invests = linesFromMultiField(r.invests_in as unknown);
  if (invests.length) lines.push(`\n<b>Во что инвестирую:</b>\n${invests.map((x) => `- ${escHtml(x)}`).join("\n")}`);
  else lines.push(`\n<b>Во что инвестирую:</b>\n- <i>не указано</i>`);
  const wants = linesFromMultiField(r.wants_to_invest as unknown);
  if (wants.length) lines.push(`\n<b>Во что хотелось бы инвестировать:</b>\n${wants.map((x) => `- ${escHtml(x)}`).join("\n")}`);
  else lines.push(`\n<b>Во что хотелось бы инвестировать:</b>\n- <i>не указано</i>`);
  const occupation = rowVal(r, "occupation") || rowVal(r, "what_i_do");
  lines.push(`\n<b>Чем занимается:</b>\n${occupation ? escHtml(occupation) : "<i>не указано</i>"}`);

  const useful = rowVal(r, "useful_for_club");
  lines.push(`\n<b>${usefulForClubHeading(r)}:</b>\n${useful ? escHtml(useful) : "<i>не указано</i>"}`);
  const req = rowVal(r, "personal_requests");
  lines.push(`\n<b>Мой текущий запрос:</b>\n${req ? escHtml(req) : "<i>не указано</i>"}`);
  return lines.join("\n");
}

export function parseEventDateMs(ev: BaserowRow): number {
  const raw = rowVal(ev, "EventDate") || (ev.EventDate != null ? String(ev.EventDate) : "");
  if (!raw) return NaN;
  const t = new Date(raw).getTime();
  return t;
}

function todayStartMskMs(): number {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: MSK, year: "numeric", month: "2-digit", day: "2-digit" });
  const parts = f.formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const mo = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!y || !mo || !day) return Date.now();
  return new Date(`${y}-${mo}-${day}T00:00:00+03:00`).getTime();
}

export async function listUpcomingEvents(cfg: BaserowRuntimeConfig): Promise<BaserowRow[]> {
  const rows = await listRows(cfg, cfg.tableEvents, { size: "200" });
  const start = todayStartMskMs() - 86_400_000;
  return rows
    .filter((e) => {
      const t = parseEventDateMs(e);
      return Number.isFinite(t) && t >= start;
    })
    .sort((a, b) => parseEventDateMs(a) - parseEventDateMs(b));
}

export function normStatus(st: unknown): string {
  return String(st || "")
    .trim()
    .toLowerCase();
}

export function countsTowardCapacity(st: unknown): boolean {
  const s = normStatus(st);
  return s === "pending" || s === "approved";
}

export function occupiedSlots(regs: BaserowRow[]): number {
  return regs
    .filter((r) => {
      const row = r as Record<string, unknown>;
      return countsTowardCapacity(row.Status ?? row.status);
    })
    .length;
}

export function findUserRegForEvent(regs: BaserowRow[], tgId: number, eventRowId: number): BaserowRow | undefined {
  const uid = String(tgId);
  // Find LAST matching registration (highest id), not first, because users can re-register after cancelling
  const matches = regs.filter((r) => Number(r.EventID) === eventRowId && String(r.ResidentID ?? "") === uid);
  if (matches.length === 0) return undefined;
  matches.sort((a, b) => Number(b.id) - Number(a.id));
  return matches[0];
}

export function activeUserReg(reg: BaserowRow | undefined): BaserowRow | undefined {
  if (!reg) return undefined;
  const row = reg as Record<string, unknown>;
  const s = normStatus(row.Status ?? row.status ?? row["Статус"]);
  if (s === "rejected") return undefined;
  return reg;
}

export async function listRegsForEvent(cfg: BaserowRuntimeConfig, eventRowId: number): Promise<BaserowRow[]> {
  return listRows(cfg, cfg.tableRegistrations, {
    [`filter__field_${cfg.fieldRegEvent}__equal`]: String(eventRowId),
    size: "200",
  });
}

export async function listRegsForResident(cfg: BaserowRuntimeConfig, tgId: number): Promise<BaserowRow[]> {
  return listRows(cfg, cfg.tableRegistrations, {
    [`filter__field_${cfg.fieldRegResident}__equal`]: String(tgId),
    size: "200",
  });
}

export type RegisterResult = "ok" | "wait" | "exists" | "missing" | "ineligible";
export type CancelResult = "cancelled" | "missing";

export async function registerUserForEvent(
  cfg: BaserowRuntimeConfig,
  tgUserId: number,
  eventRow: BaserowRow,
  tgUsernameRaw?: string,
): Promise<RegisterResult> {
  const eventId = Number(eventRow.id);
  if (!Number.isFinite(eventId)) return "missing";
  let tgUsername = String(tgUsernameRaw || "").trim().replace(/^@/, "");
  if (!tgUsername) {
    const resident = await getResidentByTelegram(cfg, tgUserId);
    tgUsername = resident
      ? (
          rowVal(resident, "username") ||
          rowVal(resident, "telegram_username") ||
          rowVal(resident, "telegram_user") ||
          rowVal(resident, "tg_username")
        )
          .trim()
          .replace(/^@/, "")
      : "";
  }
  const telegramLinkValue = tgUsername ? `t.me/${tgUsername}` : "";
  const patchTelegramLinkIfPossible = async (rowIdRaw: unknown): Promise<void> => {
    if (!telegramLinkValue) return;
    const rowId = Number(rowIdRaw);
    if (!Number.isFinite(rowId)) return;
    const regFields = await listTableFields(cfg, cfg.tableRegistrations);
    const telegramLinkKey =
      rowKeyByFieldId(regFields, FIELD_REG_TELEGRAM_LINK) ||
      rowKeyByAliases(regFields, ["telegram_link", "telegram url", "telegram"]);
    if (!telegramLinkKey) return;
    await patchRow(cfg, cfg.tableRegistrations, rowId, { [telegramLinkKey]: telegramLinkValue });
  };
  const myRegs = await listRegsForResident(cfg, tgUserId);
  const existingRaw = findUserRegForEvent(myRegs, tgUserId, eventId);
  const existing = activeUserReg(existingRaw);
  if (existing) {
    await patchTelegramLinkIfPossible(existing.id);
    return "exists";
  }

  const regsEv = await listRegsForEvent(cfg, eventId);
  const taken = occupiedSlots(regsEv);
  const maxRaw = rowVal(eventRow, "MaxParticipants");
  const max = Math.max(0, Number.parseInt(maxRaw, 10) || 0) || 9999;
  const op = taken >= max ? "wait" : "ok";
  const status = op === "wait" ? "waitlist" : "approved";
  const title = rowVal(eventRow, "Title") || "Мероприятие";
  const regPayload: Record<string, unknown> = {
    EventID: eventId,
    ResidentID: Number(tgUserId),
    Status: status,
    Name: title,
  };
  if (telegramLinkValue) {
    const regFields = await listTableFields(cfg, cfg.tableRegistrations);
    const telegramLinkKey =
      rowKeyByFieldId(regFields, FIELD_REG_TELEGRAM_LINK) ||
      rowKeyByAliases(regFields, ["telegram_link", "telegram url", "telegram"]);
    if (telegramLinkKey) regPayload[telegramLinkKey] = telegramLinkValue;
  }
  await createRow(cfg, cfg.tableRegistrations, regPayload);
  // Send notification to user
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    console.log(`[NOTIFY] register tgUserId=${tgUserId} event="${title}" result=${op}`);
    const eventDate = rowVal(eventRow, "Date") || rowVal(eventRow, "date") || "";
    const dateStr = eventDate ? new Date(eventDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "";
    const timeStr = eventDate ? new Date(eventDate).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
    const whenStr = dateStr ? (timeStr !== "00:00" ? dateStr + " в " + timeStr : dateStr) : "";
    const notifyText = op === "wait"
      ? "\uD83E\uDD81 Вы в листе ожидания на мероприятие \u00AB" + title + "\u00BB" + (whenStr ? " (" + whenStr + ")" : "") + ". Мы сообщим, если появится место."
      : "\uD83E\uDD81 Вы записаны на мероприятие \u00AB" + title + "\u00BB" + (whenStr ? " (" + whenStr + ")" : "") + ". Ждём вас!";
    tgCall(botToken, "sendMessage", {
      chat_id: tgUserId,
      text: notifyText,
      parse_mode: "HTML",
    })
      .then((resp) => {
        if ("ok" in resp && resp.ok) console.log("[NOTIFY] ЛС OK tgUserId=" + tgUserId);
        else console.warn("[NOTIFY] ЛС FAIL:", JSON.stringify(resp));
      })
      .catch((e) => console.warn("[NOTIFY] ЛС network error:", e instanceof Error ? e.message : String(e)));

    // Notify work chat (use dedicated bot token if available, same as website forms)
    const notifyBotToken = process.env.TELEGRAM_NOTIFY_BOT_TOKEN || botToken;
    const workChatId = process.env.TELEGRAM_NOTIFY_CHAT || "-1002792397691";
    const workThreadId = Number(process.env.TELEGRAM_NOTIFY_THREAD || "3776");
    const resident = await getResidentByTelegram(cfg, tgUserId);
    const userName = resident
      ? (rowVal(resident, "full_name") || rowVal(resident, "first_name") || "tg:" + tgUserId)
      : "tg:" + tgUserId;
    const workText = [
      "\uD83D\uDCE6 " + (op === "wait" ? "\uD83D\uDD35 Лист ожидания" : "\uD83D\uDFE2 Новая запись") + " \u2014 \u00AB" + title + "\u00BB",
      "\uD83D\uDC64 " + userName + (tgUsername ? " (@" + tgUsername + ")" : ""),
      whenStr ? "\uD83D\uDCC5 " + whenStr : "",
      op === "wait" ? "\u2139\uFE0F Мест нет, добавлен в лист ожидания" : "\u2705 Подтверждено",
    ].filter(Boolean).join("\n");
    tgCall(notifyBotToken, "sendMessage", {
      chat_id: workChatId,
      message_thread_id: workThreadId,
      text: workText,
      parse_mode: "HTML",
    })
      .then((resp) => {
        if ("ok" in resp && resp.ok) console.log("[NOTIFY] группа OK chatId=" + workChatId);
        else console.warn("[NOTIFY] группа FAIL:", JSON.stringify(resp));
      })
      .catch((e) => console.warn("[NOTIFY] группа network error:", e instanceof Error ? e.message : String(e)));
  }
  return op;
}

export async function cancelUserRegistrationForEvent(
  cfg: BaserowRuntimeConfig,
  tgUserId: number,
  eventRow: BaserowRow,
  tgUsernameRaw?: string,
): Promise<CancelResult> {
  const eventRowId = Number(eventRow.id);
  if (!Number.isFinite(eventRowId)) return "missing";
  const myRegs = await listRegsForResident(cfg, tgUserId);
  const existingRaw = findUserRegForEvent(myRegs, tgUserId, eventRowId);
  const existing = activeUserReg(existingRaw);
  const rowId = Number(existing?.id);
  if (!Number.isFinite(rowId)) return "missing";
  await patchRow(cfg, cfg.tableRegistrations, rowId, { Status: "rejected" });

  // Send cancellation notifications (ЛС пользователю + рабочая группа).
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    let tgUsername = String(tgUsernameRaw || "").trim().replace(/^@/, "");
    if (!tgUsername) {
      const resident = await getResidentByTelegram(cfg, tgUserId);
      tgUsername = resident
        ? (
            rowVal(resident, "username") ||
            rowVal(resident, "telegram_username") ||
            rowVal(resident, "telegram_user") ||
            rowVal(resident, "tg_username")
          )
            .trim()
            .replace(/^@/, "")
        : "";
    }
    const title = rowVal(eventRow, "Title") || rowVal(eventRow, "Name") || "Мероприятие";
    const eventDate = rowVal(eventRow, "Date") || rowVal(eventRow, "date") || "";
    const dateStr = eventDate ? new Date(eventDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "";
    const timeStr = eventDate ? new Date(eventDate).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
    const whenStr = dateStr ? (timeStr !== "00:00" ? dateStr + " в " + timeStr : dateStr) : "";
    console.log(`[NOTIFY] cancel tgUserId=${tgUserId} event="${title}"`);

    const notifyText =
      "\u274C Вы отменили запись на мероприятие \u00AB" + title + "\u00BB" + (whenStr ? " (" + whenStr + ")" : "") + ".";
    tgCall(botToken, "sendMessage", {
      chat_id: tgUserId,
      text: notifyText,
      parse_mode: "HTML",
    })
      .then((resp) => {
        if ("ok" in resp && resp.ok) console.log("[NOTIFY] cancel ЛС OK tgUserId=" + tgUserId);
        else console.warn("[NOTIFY] cancel ЛС FAIL:", JSON.stringify(resp));
      })
      .catch((e) => console.warn("[NOTIFY] cancel ЛС network error:", e instanceof Error ? e.message : String(e)));

    // Notify work chat (use dedicated bot token if available, same as website forms)
    const notifyBotToken = process.env.TELEGRAM_NOTIFY_BOT_TOKEN || botToken;
    const workChatId = process.env.TELEGRAM_NOTIFY_CHAT || "-1002792397691";
    const workThreadId = Number(process.env.TELEGRAM_NOTIFY_THREAD || "3776");
    const resident = await getResidentByTelegram(cfg, tgUserId);
    const userName = resident
      ? (rowVal(resident, "full_name") || rowVal(resident, "first_name") || "tg:" + tgUserId)
      : "tg:" + tgUserId;
    const workText = [
      "\uD83D\uDCE6 \u26D4 Отмена записи \u2014 \u00AB" + title + "\u00BB",
      "\uD83D\uDC64 " + userName + (tgUsername ? " (@" + tgUsername + ")" : ""),
      whenStr ? "\uD83D\uDCC5 " + whenStr : "",
      "\u274C Запись отменена",
    ].filter(Boolean).join("\n");
    tgCall(notifyBotToken, "sendMessage", {
      chat_id: workChatId,
      message_thread_id: workThreadId,
      text: workText,
      parse_mode: "HTML",
    })
      .then((resp) => {
        if ("ok" in resp && resp.ok) console.log("[NOTIFY] cancel группа OK chatId=" + workChatId);
        else console.warn("[NOTIFY] cancel группа FAIL:", JSON.stringify(resp));
      })
      .catch((e) => console.warn("[NOTIFY] cancel группа network error:", e instanceof Error ? e.message : String(e)));
  }
  return "cancelled";
}

export async function updateResidentFields(cfg: BaserowRuntimeConfig, rowId: number, patch: Record<string, unknown>) {
  await patchRow(cfg, cfg.tableResidents, rowId, patch);
}

export async function ensureReferralEntryFields(
  cfg: BaserowRuntimeConfig,
  tgUserId: number,
  usernameRaw: string,
  referralCodeRaw: string,
): Promise<void> {
  const username = String(usernameRaw || "").trim().replace(/^@/, "");
  const referralCode = String(referralCodeRaw || "").trim();
  const me = (await getResidentByTelegram(cfg, tgUserId)) || (await getResidentByUsername(cfg, username));
  if (me?.id) {
    const patch: Record<string, unknown> = {};
    const currentTg = rowVal(me, "telegram_id").replace(/\D/g, "");
    if (currentTg !== String(tgUserId)) patch.telegram_id = Number(tgUserId);
    if (username) patch.username = username;
    const regDate = rowVal(me, "registration_date");
    if (!regDate) patch.registration_date = todayYmdMsk();
    const rowObj = me as Record<string, unknown>;
    for (const alias of ["telegram_link", "telegram_url", "tg_link", "telegram"]) {
      if (!(alias in rowObj)) continue;
      if (username) patch[alias] = `https://t.me/${username}`;
      else patch[alias] = `tg://user?id=${tgUserId}`;
    }
    if (Object.keys(patch).length) await updateResidentFields(cfg, Number(me.id), patch);
  }

  if (!referralCode) return;
  const links = await listRows(cfg, 842, {
    filter__field_7798__equal: referralCode,
    size: "1",
  });
  const invite = links[0];
  if (!invite?.id) return;
  const invitePatch: Record<string, unknown> = {
    UsedByTelegramID: String(tgUserId),
    UsedAt: todayYmdMsk(),
  };
  if (!boolDb(invite.IsUsed)) invitePatch.IsUsed = true;
  await patchRow(cfg, 842, Number(invite.id), invitePatch);
}

function normalizeKey(input: string): string {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function rowKeyByAliases(fields: Record<string, unknown>[], aliases: string[]): string | null {
  const want = new Set(aliases.map(normalizeKey));
  for (const f of fields) {
    const name = String(f.name || "").trim();
    const db = String(f.db_column ?? "").trim();
    if (want.has(normalizeKey(name)) || (db && want.has(normalizeKey(db)))) return name || db;
  }
  return null;
}

function rowKeyByFieldId(fields: Record<string, unknown>[], fieldId: number): string | null {
  for (const f of fields) {
    if (Number((f as { id?: unknown }).id) !== fieldId) continue;
    const name = String(f.name || "").trim();
    if (name) return name;
  }
  return null;
}

function todayYmdMsk(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MSK, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function residentRowIdFromInviteNotes(notesRaw: unknown): number {
  const notes = String(notesRaw || "");
  const m = /resident_row_id\s*:\s*(\d+)/i.exec(notes);
  const id = Number(m?.[1] || 0);
  return Number.isFinite(id) && id > 0 ? id : 0;
}

export async function bindResidentByInviteCode(
  cfg: BaserowRuntimeConfig,
  tgUserId: number,
  usernameRaw: string,
  inviteCodeRaw: string,
): Promise<"bound" | "skip_missing_code" | "skip_not_found" | "skip_used_other"> {
  const inviteCode = String(inviteCodeRaw || "").trim();
  if (!inviteCode) return "skip_missing_code";
  const username = String(usernameRaw || "").trim().replace(/^@/, "");

  const inviteRows = await listRows(cfg, TABLE_INVITE_LINKS, {
    [`filter__field_${FIELD_INVITE_CODE}__equal`]: inviteCode,
    size: "1",
  });
  const invite = inviteRows[0] as Record<string, unknown> | undefined;
  if (!invite?.id) return "skip_not_found";

  const usedBy = String(invite.UsedByTelegramID || "").replace(/\D/g, "");
  const isUsed = boolDb(invite.IsUsed);
  if ((isUsed || usedBy) && usedBy && usedBy !== String(tgUserId)) return "skip_used_other";
  if (isUsed && !usedBy) return "skip_used_other";

  const residentId = residentRowIdFromInviteNotes(invite.Notes);
  if (!residentId) return "skip_not_found";
  const residentRows = await listRows(cfg, cfg.tableResidents, { filter__id__equal: String(residentId), size: "1" });
  const resident = residentRows[0] as Record<string, unknown> | undefined;
  if (!resident) return "skip_not_found";

  const residentFields = await listTableFields(cfg, cfg.tableResidents);
  const tgIdKey = rowKeyByAliases(residentFields, ["telegram_id", "tg_id"]) || "telegram_id";
  const usernameKey = rowKeyByAliases(residentFields, ["username", "telegram_username", "tg_username"]) || "username";
  const regDateKey = rowKeyByAliases(residentFields, ["registration_date", "дата регистрации"]) || "registration_date";
  const tgLinkKey = rowKeyByAliases(residentFields, ["telegram_link", "telegram_url", "tg_link", "telegram"]);
  const patch: Record<string, unknown> = {
    [tgIdKey]: Number(tgUserId),
    [regDateKey]: rowVal(resident as BaserowRow, "registration_date") || todayYmdMsk(),
  };
  if (username) {
    patch[usernameKey] = username;
    if (tgLinkKey) patch[tgLinkKey] = `https://t.me/${username}`;
  } else if (tgLinkKey) {
    patch[tgLinkKey] = `tg://user?id=${tgUserId}`;
  }
  await updateResidentFields(cfg, residentId, patch);
  await patchRow(cfg, TABLE_INVITE_LINKS, Number(invite.id), {
    IsUsed: true,
    UsedByTelegramID: String(tgUserId),
    UsedAt: todayYmdMsk(),
  });
  return "bound";
}

/** Write EspoCRM contact id into the resident row when the field is still empty (any common column name). */
export async function setResidentEspoContactIdIfEmpty(
  cfg: BaserowRuntimeConfig,
  residentRowId: number,
  espoContactId: string,
): Promise<void> {
  const id = String(espoContactId || "").trim();
  if (!id || !Number.isFinite(residentRowId)) return;
  const rows = await listRows(cfg, cfg.tableResidents, { filter__id__equal: String(residentRowId), size: "1" });
  const me = rows[0] as Record<string, unknown> | undefined;
  if (!me) return;
  const fields = await listTableFields(cfg, cfg.tableResidents);
  const key =
    rowKeyByAliases(fields as Record<string, unknown>[], [
      "espo_contact_id",
      "espocrm_contact_id",
      "contact_id",
      "espo_contact",
    ]) || "espo_contact_id";
  const cur = String(me[key] ?? "").trim();
  if (cur) return;
  await updateResidentFields(cfg, residentRowId, { [key]: id });
}

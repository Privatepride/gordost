import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createRow, listRows, listTableFields, patchRow, uploadUserFile, type BaserowRow } from "./baserow/client.js";
import { scanFileForThreats } from "./virusScan.js";
import { loadBaserowConfig } from "./baserow/config.js";
import {
  activeUserReg,
  bindResidentByInviteCode,
  boolDb,
  cancelUserRegistrationForEvent,
  fileUrlFromCell,
  findUserRegForEvent,
  getResidentByTelegram,
  getResidentByUsername,
  listRegsForEvent,
  listRegsForResident,
  listResidentsForDirectory,
  listUpcomingEvents,
  occupiedSlots,
  parseEventDateMs,
  registerUserForEvent,
  rowVal,
  updateResidentFields,
} from "./baserow/service.js";
import { startTelegramBot } from "./botPoll.js";
import {
  getMeetingsState,
  joinMeetings,
  leaveWaitingMeetings,
  markPartnerUnreachable,
  submitMeetingFeedback,
} from "./meetings.js";
import { parseUserFromInitData, verifyTelegramInitData } from "./telegramInitData.js";
import { loadDb, profileFor, registerForEvent, setProfileField, unregisterForEvent } from "./store.js";
import { tgCall } from "./tgApi.js";
import { resolveEspoContactDuplicateId, resolveEspoContactIdFallback } from "./espoApi.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 8787);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_BOT_USERNAME = (process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "");
const N8N_PROFILE_SYNC_URL = String(process.env.N8N_PROFILE_SYNC_URL || "").trim();
const N8N_PROFILE_SYNC_SECRET = String(process.env.N8N_PROFILE_SYNC_SECRET || "").trim();
const ENABLE_PROFILE_REVERSE_SYNC = String(process.env.ENABLE_PROFILE_REVERSE_SYNC || "").trim() === "1";
const COMMUNITY_CHAT_LINK = "https://t.me/+9h87ONiKUMo5ZGQy";
const baserow = loadBaserowConfig();
const TABLE_USER_SESSIONS = 837;
const FIELD_SESSION_RESIDENT = 7783;
const TABLE_BROADCAST_SUMMARIES = 847;
const FIELD_SUMMARY_TITLE = 7858;
const FIELD_SUMMARY_FILE = 7859;
const FIELD_SUMMARY_ACTIVE = 7860;
const FIELD_SUMMARY_TEXT = 7861;
const FIELD_EVENT_EXTERNAL = 7866;
const FIELD_EVENT_EXTERNAL_PRICE = 7868;
const FIELD_RESIDENT_INVEST_BANYA = 7873;
const FIELD_RESIDENT_GORDOST = 7874;
const FIELD_PROJECT_DESCRIPTION = 7876;
const FIELD_PROJECT_TG_LINK = 7878;
const FIELD_PROJECT_TG_ID = 7879;
const FIELD_PROJECT_PITCH_FILE = 7880;
const FIELD_PROJECT_FINMODEL_FILE = 7881;
const FIELD_PROJECT_VIDEO_PITCH = 7882;
const FIELD_PROJECT_TITLE = 7884;
const FIELD_PROJECT_HARDEST_DECISION = 7889;
const FIELD_PROJECT_FAILURE_SIGNAL = 7890;
const FIELD_PROJECT_TIME_COMMITMENT = 7893;
const FIELD_PROJECT_PAST_FAILURES = 7887;
const FIELD_PROJECT_OTHER_PROJECTS = 7894;
const FIELD_PROJECT_PERSONAL_INVESTMENT = 7895;
const FIELD_PROJECT_KEY_PERSONS = 7896;
const FIELD_PROJECT_EXIT_PLAN = 7897;
const FIELD_PROJECT_BIGGEST_RISK = 7900;
const FIELD_PROJECT_COMPETITORS_ADVANTAGE = 7901;
const FIELD_PROJECT_CLIENT_REFERENCES = 7902;
const FIELD_PROJECT_STAGE = 7905;
const FIELD_PROJECT_FUNDING_ASK = 7906;
const FIELD_PROJECT_VALUATION = 7907;
const FIELD_PROJECT_UNIT_ECONOMICS = 7919;
const FIELD_PROJECT_LEGAL_STRUCTURE = 7922;
const FIELD_PROJECT_ACTIVE_LITIGATION = 7923;
const FIELD_PROJECT_LICENSES = 7924;
const FIELD_PROJECT_WEBSITE = 7943;
const FIELD_PROJECT_TG = 7944;
const FIELD_PROJECT_FOUNDER_OTHER_SOCIALS = 7945;
const FIELD_PROJECT_INVESTMENT_TYPE = 7946;
const FIELD_PROJECT_COFOUNDERS = 7962;
const FIELD_PROJECT_FOUNDER_ABSENCE_PLAN = 7964;
const FIELD_PROJECT_VISION_3_5_YEARS = 7965;
const FIELD_PROJECT_INN = 7966;
const FIELD_PROJECT_WHAT_ELSE = 7967;
const FIELD_PROJECT_MIN_BILL = 7968;
const FIELD_RESIDENT_PHONE = 7958;
const FIELD_RESIDENT_EMAIL = 7959;
const FIELD_RESIDENT_INVEST_EXPERIENCE = 7960;
const FIELD_RESIDENT_ADDITIONAL = 7969;
const FIELD_RESIDENT_SOCIAL_NETWORKS = 7970;
const FIELD_RESIDENT_CONSENT = 7814;
const INVESTS_FIELD_ALIASES = ["invests_in", "invests", "во что инвестирует", "инвестирует", "инвестиции"];
const WANTS_TO_INVEST_FIELD_ALIASES = [
  "wants_to_invest",
  "wants_to_invest_in",
  "во что хочет инвестировать",
  "хочет инвестировать",
  "интересующие инвестиции",
];
const TELEGRAM_ID_ALIASES = ["telegram_id", "tg_id", "telegramid", "telegram id", "телеграм id", "id telegram"];
const USERNAME_ALIASES = ["username", "telegram_username", "telegram_user", "tg_username", "telegram", "логин telegram"];
const PHONE_ALIASES = ["phone", "phone_number", "телефон", "номер телефона", "mobile", "телефонный номер"];
const EMAIL_ALIASES = ["email", "e-mail", "почта", "email_address", "emailaddress", "электронная почта"];
const INVEST_EXPERIENCE_ALIASES = ["invest_experience", "investment_experience", "опыт инвестиций", "опыт_инвестиций"];

const PROJECT_PITCH_MAX_BYTES = 20 * 1024 * 1024;
const PROJECT_FINMODEL_MAX_BYTES = 20 * 1024 * 1024;
const PROJECT_MAX_FILES_PER_FIELD = 5;
const PROJECT_APPLY_BODY_LIMIT = "150mb";

const app = express();
app.use(express.json({ limit: PROJECT_APPLY_BODY_LIMIT }));

// Безопасная обёртка для async-обработчиков Express 4.
// В Express 4 брошенный в async-обработчике reject НЕ ловится express'ом
// и убивает весь процесс. Эта обёртка ловит ошибку и возвращает понятный ответ:
// 503 при сбое базы/сети (чтобы мини-апп не падал и пользователь видел сообщение,
// а не вечную загрузку), либо 500 для прочих ошибок.
type AsyncHandler = (req: express.Request, res: express.Response) => Promise<void>;
function safeAsync(handler: AsyncHandler) {
  return async (req: express.Request, res: express.Response) => {
    try {
      await handler(req, res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isBaserowErr = /Baserow|fetch failed|ECONNRESET|timeout|не JSON|HTTP 5\d\d/i.test(msg);
      if (isBaserowErr) {
        console.error("[safeAsync] transient backend error:", msg);
        if (!res.headersSent) {
          res
            .status(503)
            .json({ error: "База данных временно недоступна. Попробуйте через минуту." });
        }
      } else {
        console.error("[safeAsync] handler error:", msg);
        if (!res.headersSent) {
          res.status(500).json({ error: "Внутренняя ошибка сервера." });
        }
      }
    }
  };
}

app.get("/api/meta", (_req, res) => {
  res.json({
    botUsername: TELEGRAM_BOT_USERNAME,
    baserowConfigured: Boolean((process.env.BASEROW_API_TOKEN || "").trim()),
  });
});

function authMiniappUser(initData: string): { id: number; username?: string } | null {
  if (!TELEGRAM_BOT_TOKEN) return null;
  if (!verifyTelegramInitData(initData, TELEGRAM_BOT_TOKEN)) return null;
  return parseUserFromInitData(initData);
}

function pickRowKey(row: Record<string, unknown>, aliases: string[]): string | null {
  const keys = new Set(Object.keys(row));
  for (const alias of aliases) {
    if (keys.has(alias)) return alias;
  }
  return null;
}

function fieldDbColumn(f: Record<string, unknown>): string {
  return String(f.db_column ?? (f as { dbColumn?: string }).dbColumn ?? "").trim();
}

function normalizeFieldKey(input: string): string {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function findFieldByAliases(
  fields: Record<string, unknown>[],
  aliases: string[],
  opts?: { typeMatches?: (t: string) => boolean },
): Record<string, unknown> | null {
  const want = new Set(aliases.map((a) => normalizeFieldKey(a)));
  for (const f of fields) {
    const name = String(f.name || "").trim();
    const nameNorm = normalizeFieldKey(name);
    const dbColNorm = normalizeFieldKey(fieldDbColumn(f));
    if (!want.has(nameNorm) && !(dbColNorm && want.has(dbColNorm))) continue;
    const type = String(f.type || "").toLowerCase();
    if (opts?.typeMatches && !opts.typeMatches(type)) continue;
    return f;
  }
  return null;
}

function rowKeyForFieldAliases(
  fields: Record<string, unknown>[],
  aliases: string[],
  opts?: { typeMatches?: (t: string) => boolean },
): string | null {
  const f = findFieldByAliases(fields, aliases, opts);
  if (!f) return null;
  const name = String(f.name || "").trim();
  return name || null;
}

function rowKeyForFieldId(fields: Record<string, unknown>[], fieldId: number): string | null {
  for (const f of fields) {
    if (Number((f as { id?: unknown }).id) !== fieldId) continue;
    const name = String(f.name || "").trim();
    if (name) return name;
  }
  return null;
}

function hasAnyValue(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as Record<string, unknown>).length > 0;
  return false;
}

function registrationStatus(reg: BaserowRow | undefined): string {
  if (!reg) return "";
  const row = reg as Record<string, unknown>;
  return String(row.Status ?? row.status ?? row["Статус"] ?? "").trim();
}

function extractNumericIds(v: unknown): string[] {
  const out = new Set<string>();
  const walk = (x: unknown) => {
    if (x == null) return;
    if (typeof x === "number" && Number.isFinite(x)) {
      const d = String(Math.trunc(x));
      if (d) out.add(d);
      return;
    }
    if (typeof x === "string") {
      const d = x.replace(/\D/g, "");
      if (d) out.add(d);
      return;
    }
    if (Array.isArray(x)) {
      for (const item of x) walk(item);
      return;
    }
    if (typeof x === "object") {
      const o = x as Record<string, unknown>;
      walk(o.id);
      walk(o.value);
      walk(o.name);
      walk(o.row_id);
      walk(o.rowId);
    }
  };
  walk(v);
  return Array.from(out);
}

function collectResidentIdCandidatesForUser(
  rows: BaserowRow[],
  fields: Record<string, unknown>[],
  user: { id: number; username?: string },
): Set<string> {
  const wantTg = String(user.id).replace(/\D/g, "");
  const wantUsername = String(user.username || "").trim().replace(/^@/, "").toLowerCase();
  const out = new Set<string>();
  for (const r of rows) {
    const row = r as Record<string, unknown>;
    const rowTg = cellFromRow(row, fields, TELEGRAM_ID_ALIASES).replace(/\D/g, "");
    const rowUsername = cellFromRow(row, fields, USERNAME_ALIASES).trim().replace(/^@/, "").toLowerCase();
    if ((wantTg && rowTg === wantTg) || (wantUsername && rowUsername === wantUsername)) {
      const idDigits = String(r.id ?? "").replace(/\D/g, "");
      if (idDigits) out.add(idDigits);
    }
  }
  return out;
}

function isRegistrationForUser(
  reg: BaserowRow,
  myTgId: string,
  myUsername: string,
  residentIdCandidates: Set<string>,
): boolean {
  const rr = reg as Record<string, unknown>;
  const residentIds = extractNumericIds(rr.ResidentID ?? rr.residentid ?? rr["Resident ID"]);
  if (myTgId && residentIds.includes(myTgId)) return true;
  if (residentIds.some((id) => residentIdCandidates.has(id))) return true;
  const link = String(rr.Telegram_link ?? rr.telegram_link ?? rr.TelegramLink ?? "").trim().toLowerCase();
  if (myUsername && link.includes(`t.me/${myUsername}`)) return true;
  if (myTgId && link.includes(`tg://user?id=${myTgId}`)) return true;
  return false;
}

function hasPhotoInResidentRow(row: Record<string, unknown>, fields: Record<string, unknown>[]): boolean {
  const photoFileKey = rowKeyForFieldAliases(
    fields,
    ["photo", "avatar", "image", "profile_photo"],
    { typeMatches: (t) => t.includes("file") },
  );
  const photoTextKey = rowKeyForFieldAliases(fields, ["photo_url", "photo_link", "avatar_url"]);
  const candidates = [
    photoFileKey ? row[photoFileKey] : undefined,
    photoTextKey ? row[photoTextKey] : undefined,
    row.photo,
    row.avatar,
    row.image,
    row.profile_photo,
    row.photo_url,
    row.photo_link,
    row.avatar_url,
  ];
  return candidates.some(hasAnyValue);
}

function isResidentMemberRow(row: Record<string, unknown>, fields: Record<string, unknown>[]): boolean {
  const memberKey = rowKeyForFieldAliases(
    fields,
    ["is_member", "member", "resident", "is_resident", "резидент", "участник клуба"],
    { typeMatches: (t) => t.includes("boolean") || t.includes("checkbox") },
  );
  if (memberKey) return boolDb(row[memberKey]);
  return boolDb(row.is_member ?? row.member ?? row.resident ?? row.is_resident);
}

function formatScalarCell(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(formatScalarCell).filter(Boolean).join("\n");
  if (typeof v === "boolean") return v ? "да" : "нет";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (o.value != null) return String(o.value).trim();
    if (o.name != null) return String(o.name).trim();
    if (typeof o.text === "string") return o.text;
    return "";
  }
  return String(v).trim();
}

function cellFromRow(
  row: Record<string, unknown>,
  fields: Record<string, unknown>[],
  aliases: string[],
  opts?: { typeMatches?: (t: string) => boolean },
): string {
  const key = rowKeyForFieldAliases(fields, aliases, opts);
  if (key && key in row) {
    const s = formatScalarCell(row[key]);
    if (s) return s;
  }
  for (const a of aliases) {
    if (a in row) {
      const s = formatScalarCell(row[a]);
      if (s) return s;
    }
  }
  return "";
}

function isMultipleSelectType(t: string): boolean {
  return t === "multiple_select" || t.includes("multiple_select");
}

async function triggerProfileReverseSync(payload: Record<string, unknown>): Promise<void> {
  if (!ENABLE_PROFILE_REVERSE_SYNC || !N8N_PROFILE_SYNC_URL) return;
  const body = { ...payload, secret: N8N_PROFILE_SYNC_SECRET };
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 4000);
    const res = await fetch(N8N_PROFILE_SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ac.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn("n8n reverse sync non-200:", res.status, txt.slice(0, 300));
    }
  } catch (e) {
    console.warn("n8n reverse sync failed:", e instanceof Error ? e.message : String(e));
  }
}

async function persistResidentEspoContactIdIfMissing(
  cfg: NonNullable<typeof baserow>,
  residentFields: Record<string, unknown>[],
  residentRowId: number | undefined,
  currentEspoContactId: string,
  resolvedEspoContactId: string,
): Promise<void> {
  const rowId = Number(residentRowId);
  if (!Number.isFinite(rowId) || rowId <= 0) return;
  const current = String(currentEspoContactId || "").trim();
  const resolved = String(resolvedEspoContactId || "").trim();
  if (current || !resolved) return;
  const key =
    rowKeyForFieldId(residentFields, 7850) ||
    rowKeyForFieldAliases(residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id", "espo_contact"]) ||
    "espo_contact_id";
  await updateResidentFields(cfg, rowId, { [key]: resolved });
}

function splitFullName(raw: string): { firstName: string; lastName: string } {
  const parts = String(raw || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function parseMultiInput(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v
      .map((x) => {
        if (x == null) return "";
        if (typeof x === "string" || typeof x === "number" || typeof x === "boolean") return String(x).trim();
        if (typeof x === "object") {
          const o = x as Record<string, unknown>;
          return String(o.value ?? o.name ?? o.label ?? "").trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  const s = String(v || "").trim();
  if (!s) return [];
  return s
    .split(/\r?\n/)
    .map((x) => x.trim().replace(/^[•\-\*]\s*/, ""))
    .filter(Boolean);
}

function normalizeBirthDateInput(raw: unknown): string {
  const s = String(raw || "").trim();
  if (!s) return "";
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  const dmy = /^(\d{2})[./-](\d{2})[./-](\d{4})$/.exec(s);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const ts = Date.parse(s);
  if (Number.isFinite(ts)) {
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return s;
}

function normalizeBirthDateStrict(raw: unknown): string {
  const s = String(raw || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[./]/g, "-")
    .replace(/-+/g, "-");
  if (!s) return "";
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]);
    const d = Number(ymd[3]);
    const test = new Date(Date.UTC(y, m - 1, d));
    if (test.getUTCFullYear() === y && test.getUTCMonth() + 1 === m && test.getUTCDate() === d) {
      return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
    }
    return "";
  }
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (dmy) {
    const d = Number(dmy[1]);
    const m = Number(dmy[2]);
    const y = Number(dmy[3]);
    const test = new Date(Date.UTC(y, m - 1, d));
    if (test.getUTCFullYear() === y && test.getUTCMonth() + 1 === m && test.getUTCDate() === d) {
      return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    }
  }
  return "";
}

function normalizeNumberStrict(raw: unknown): string {
  const s = String(raw || "").trim().replace(/\s+/g, "").replace(",", ".");
  if (!s) return "";
  if (!/^-?\d+(\.\d+)?$/.test(s)) return "";
  return s;
}

function normalizeEmailStrict(raw: unknown): string {
  const email = String(raw || "").trim().toLowerCase();
  if (!email) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

function normalizePhoneStrict(raw: unknown): string {
  const phone = String(raw || "")
    .trim()
    .replace(/[^\d+]/g, "");
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "";
  return phone;
}

function startParamFromInitData(initData: string): string {
  const p = new URLSearchParams(initData);
  return String(p.get("start_param") || "").trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hydrateResidentFromInviteLink(
  cfg: NonNullable<typeof baserow>,
  startParam: string,
  user: { id: number; username?: string },
): Promise<BaserowRow | null> {
  const code = String(startParam || "").trim();
  if (!code) return null;
  const bindResult = await bindResidentByInviteCode(cfg, user.id, user.username || "", code);
  const uname = String(user.username || "").trim().replace(/^@/, "");
  const readResident = async () => (await getResidentByTelegram(cfg, user.id)) || (uname ? await getResidentByUsername(cfg, uname) : null);
  const firstHit = await readResident();
  if (firstHit) return firstHit;
  // Baserow can return stale reads right after invite binding.
  if (bindResult === "bound") {
    for (let i = 0; i < 4; i += 1) {
      await sleep(250);
      const hit = await readResident();
      if (hit) return hit;
    }
  }
  return null;
}

async function listActiveBroadcastSummaries(
  cfg: NonNullable<typeof baserow>,
): Promise<Array<{ id: number; title: string; fileUrl: string; text: string }>> {
  const fields = await listTableFields(cfg, TABLE_BROADCAST_SUMMARIES);
  const rows = await listRows(cfg, TABLE_BROADCAST_SUMMARIES, { size: "200" });
  const titleKey =
    rowKeyForFieldId(fields, FIELD_SUMMARY_TITLE) || rowKeyForFieldAliases(fields, ["заголовок", "title"]) || "Заголовок";
  const fileKey =
    rowKeyForFieldId(fields, FIELD_SUMMARY_FILE) ||
    rowKeyForFieldAliases(fields, ["файл с конспектом", "файл", "file"]) ||
    "Файл с конспектом";
  const activeKey =
    rowKeyForFieldId(fields, FIELD_SUMMARY_ACTIVE) || rowKeyForFieldAliases(fields, ["active", "активно"]) || "Active";
  const textKey =
    rowKeyForFieldId(fields, FIELD_SUMMARY_TEXT) ||
    rowKeyForFieldAliases(fields, ["текст конспекта", "текст", "summary_text"]) ||
    "Текст конспекта";
  return rows
    .filter((r) => {
      const row = r as Record<string, unknown>;
      return boolDb(row[activeKey] ?? row.Active ?? row.active);
    })
    .map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: Number(r.id) || 0,
        title: String(row[titleKey] ?? row["Заголовок"] ?? "").trim(),
        fileUrl: fileUrlFromCell(row[fileKey] ?? row["Файл с конспектом"]),
        text: String(row[textKey] ?? row["Текст конспекта"] ?? "").trim(),
      };
    })
    .filter((x) => Boolean(x.title || x.fileUrl || x.text))
    .sort((a, b) => b.id - a.id);
}

function pageToSessionNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(1, Math.trunc(v));
  const s = String(v || "").trim().toLowerCase();
  if (!s) return 1;
  if (/^\d+$/.test(s)) return Math.max(1, Number(s));
  if (s === "profile") return 1;
  if (s === "residents") return 2;
  if (s === "events") return 3;
  if (s === "meetings") return 4;
  if (s === "useful") return 5;
  return 1;
}

async function upsertUserSession(
  cfg: NonNullable<typeof baserow>,
  residentRowId: number,
  telegramId: number,
  input: { state?: string; currentPage?: unknown; lastBackState?: string; activeMatchId?: unknown; tempData?: unknown },
): Promise<void> {
  const state = String(input.state || "active").trim() || "active";
  const currentPage = pageToSessionNumber(input.currentPage);
  const lastBackState = String(input.lastBackState || "").trim();
  const activeMatchIdRaw = Number(input.activeMatchId);
  const activeMatchId = Number.isFinite(activeMatchIdRaw) ? Math.trunc(activeMatchIdRaw) : null;
  const tempData =
    typeof input.tempData === "string"
      ? input.tempData
      : input.tempData == null
        ? ""
        : JSON.stringify(input.tempData).slice(0, 10000);
  let rows = await listRows(cfg, TABLE_USER_SESSIONS, {
    [`filter__field_${FIELD_SESSION_RESIDENT}__equal`]: String(residentRowId),
    size: "1",
  });
  // Backward compatibility: old rows may contain telegram id in ResidentID.
  if (!rows.length) {
    rows = await listRows(cfg, TABLE_USER_SESSIONS, {
      [`filter__field_${FIELD_SESSION_RESIDENT}__equal`]: String(telegramId),
      size: "1",
    });
  }
  const patch: Record<string, unknown> = {
    ResidentID: residentRowId,
    State: state,
    TempData: tempData,
    CurrentPage: currentPage,
    LastBackState: lastBackState,
    ActiveMatchID: activeMatchId,
  };
  const existingId = Number(rows[0]?.id);
  if (Number.isFinite(existingId)) {
    await patchRow(cfg, TABLE_USER_SESSIONS, existingId, patch);
    return;
  }
  // Strict mode: do not create new rows in Baserow from miniapp session touches.
  // If a session row does not exist yet, we skip silently.
  return;
}

function parseImageDataUrl(raw: string): { bytes: Buffer; mimeType: string } | null {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/.exec(String(raw || "").trim());
  if (!m) return null;
  const bytes = Buffer.from(m[2], "base64");
  if (!bytes.length) return null;
  return { bytes, mimeType: m[1].toLowerCase() };
}

const MIME_TO_EXTENSION: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/zip": "zip",
  "text/plain": "txt",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function extensionFromFileName(fileName: string): string {
  const m = /\.([a-zA-Z0-9]{1,8})$/.exec(String(fileName || "").trim());
  return m ? m[1].toLowerCase() : "";
}

function mimeTypeFromFileName(fileName: string): string {
  const ext = extensionFromFileName(fileName);
  const byExt: Record<string, string> = {
    pdf: "application/pdf",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    zip: "application/zip",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  return byExt[ext] || "application/octet-stream";
}

function parseFileDataUrl(raw: string, fileName = ""): { bytes: Buffer; mimeType: string } | null {
  const text = String(raw || "").trim();
  const m = /^data:([^;,]*);base64,([a-zA-Z0-9+/=\s]+)$/.exec(text);
  if (!m) return null;
  const bytes = Buffer.from(m[2].replace(/\s+/g, ""), "base64");
  if (!bytes.length) return null;
  let mimeType = String(m[1] || "").trim().toLowerCase();
  if (!mimeType) mimeType = mimeTypeFromFileName(fileName);
  return { bytes, mimeType };
}

type ProjectFilePayload = { base64: string; name: string };

function parseProjectFilePayloads(raw: unknown, legacyBase64: string, legacyName: string): ProjectFilePayload[] {
  if (Array.isArray(raw)) {
    const out: ProjectFilePayload[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const base64 = String((item as Record<string, unknown>).base64 || "").trim();
      const name = String((item as Record<string, unknown>).name || "").trim();
      if (!base64) continue;
      out.push({ base64, name });
    }
    return out.slice(0, PROJECT_MAX_FILES_PER_FIELD);
  }
  const single = String(legacyBase64 || "").trim();
  if (!single) return [];
  return [{ base64: single, name: String(legacyName || "").trim() }];
}

async function uploadProjectFiles(
  payloads: ProjectFilePayload[],
  maxBytes: number,
  fallbackBase: string,
): Promise<Array<{ name: string }>> {
  const uploaded: Array<{ name: string }> = [];
  for (let i = 0; i < payloads.length; i += 1) {
    const payload = payloads[i];
    const parsed = parseFileDataUrl(payload.base64, payload.name);
    if (!parsed) {
      throw new Error(`Некорректный файл «${payload.name || `#${i + 1}`}».`);
    }
    if (parsed.bytes.byteLength > maxBytes) {
      throw new Error(`Файл «${payload.name || `#${i + 1}`}» слишком большой (макс. ${Math.round(maxBytes / (1024 * 1024))} МБ).`);
    }
    const uploadName = sanitizeUploadFileName(payload.name, `${fallbackBase}-${i + 1}`, parsed.mimeType);
    // Virus scan disabled
    const file = await uploadUserFile(baserow!, uploadName, parsed.bytes, parsed.mimeType);
    const name = String(file.name || "").trim();
    if (name) uploaded.push({ name });
  }
  return uploaded;
}

function sanitizeUploadFileName(originalName: string, fallbackBase: string, mimeType: string): string {
  const raw = String(originalName || "").trim();
  const clean =
    raw.replace(/[^\w.\-а-яА-ЯёЁ]+/g, "_").replace(/^_+/, "").slice(0, 120) ||
    fallbackBase.replace(/[^\w.\-а-яА-ЯёЁ]+/g, "_").replace(/^_+/, "").slice(0, 80) ||
    "file";
  if (/\.[a-zA-Z0-9]{1,8}$/.test(clean)) return clean;
  const ext = MIME_TO_EXTENSION[mimeType.toLowerCase()] || extensionFromFileName(clean) || "bin";
  return `${clean}.${ext}`;
}

function readMultiSelectOptions(fields: Record<string, unknown>[], aliases: string[]): string[] {
  const field = findFieldByAliases(fields, aliases, { typeMatches: isMultipleSelectType });
  if (!field) return [];
  const raw = (field.select_options ?? field.selectOptions ?? field.options) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((it) => {
      if (!it || typeof it !== "object") return "";
      const o = it as Record<string, unknown>;
      return String(o.value ?? o.name ?? "").trim();
    })
    .filter(Boolean);
}

function getMultiSelectField(
  fields: Record<string, unknown>[],
  aliases: string[],
): { name: string; options: Array<{ id: number; value: string }> } | null {
  const field = findFieldByAliases(fields, aliases, { typeMatches: isMultipleSelectType });
  if (!field) return null;
  const fieldName = String(field.name || "").trim();
  if (!fieldName) return null;
  const raw = (field.select_options ?? field.selectOptions ?? field.options) as unknown;
  const options = Array.isArray(raw)
    ? raw
        .map((it) => {
          if (!it || typeof it !== "object") return null;
          const o = it as Record<string, unknown>;
          const id = Number(o.id);
          const value = String(o.value ?? o.name ?? "").trim();
          if (!Number.isFinite(id) || !value) return null;
          return { id, value };
        })
        .filter((x): x is { id: number; value: string } => Boolean(x))
    : [];
  return { name: fieldName, options };
}

function mapValuesToSelectIds(values: string[], options: Array<{ id: number; value: string }>): number[] {
  if (!values.length || !options.length) return [];
  const byLower = new Map(options.map((o) => [o.value.toLowerCase(), o.id]));
  const picked = new Set<number>();
  for (const v of values) {
    const id = byLower.get(String(v || "").trim().toLowerCase());
    if (id) picked.add(id);
  }
  return Array.from(picked);
}

async function resolveResidentForUser(
  cfg: NonNullable<typeof baserow>,
  user: { id: number; username?: string },
  residentFields?: Record<string, unknown>[],
): Promise<BaserowRow | null> {
  const byDirect = (await getResidentByTelegram(cfg, user.id)) || (await getResidentByUsername(cfg, user.username || ""));
  if (byDirect) return byDirect;

  const fields = residentFields || (await listTableFields(cfg, cfg.tableResidents));
  const rows = await listRows(cfg, cfg.tableResidents, { size: "200" });
  const wantTg = String(user.id).replace(/\D/g, "");
  const wantUsername = String(user.username || "").trim().replace(/^@/, "").toLowerCase();
  let winner: BaserowRow | null = null;
  let winnerScore = -1;

  for (const r of rows) {
    const row = r as Record<string, unknown>;
    const rowTg = cellFromRow(row, fields, TELEGRAM_ID_ALIASES).replace(/\D/g, "");
    const rowUsername = cellFromRow(row, fields, USERNAME_ALIASES).trim().replace(/^@/, "").toLowerCase();
    let score = 0;
    if (wantTg && rowTg && rowTg === wantTg) score += 10;
    if (wantUsername && rowUsername && rowUsername === wantUsername) score += 6;
    if (!score) continue;
    if (boolDb(row.is_member)) score += 2;
    if (boolDb(row.profile_complete)) score += 1;
    if (score > winnerScore) {
      winner = r;
      winnerScore = score;
    }
  }

  return winner;
}

app.post("/api/app/bootstrap", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }

  if (baserow) {
    let me = (await getResidentByTelegram(baserow, user.id)) || (await getResidentByUsername(baserow, user.username || ""));
    if (!me) {
      try {
        const startParam = startParamFromInitData(initData);
        if (startParam) {
          me = await hydrateResidentFromInviteLink(baserow, startParam, user);
        }
      } catch (e) {
        console.warn("invite hydration failed:", e instanceof Error ? e.message : String(e));
      }
    }
    const residentFields = await listTableFields(baserow, baserow.tableResidents);
    const meIsMember = me ? isResidentMemberRow(me as Record<string, unknown>, residentFields) : false;
    if (!me || !meIsMember) {
      res.json({
        ok: true,
        mode: "baserow",
        accessDenied: true,
        accessMessage: "Вас нет в списке резидентов. Обратитесь к комьюнити менеджеру.",
        communityTelegram: COMMUNITY_CHAT_LINK,
        profile: {
          exists: false,
          fullName: "",
          city: "",
          birthDate: "",
          capital: "",
          monthlyIncome: "",
          telegramUsername: "",
          telegramId: "",
          personalRequests: "",
          photoUrl: "",
          role: "",
          occupation: "",
          hobbies: "",
          useful: "",
          invests: [],
          wantsToInvest: [],
        },
        investmentOptions: {
          invests: [],
          wantsToInvest: [],
        },
        residents: [],
        events: [],
        meetings: {
          mode: "idle",
          introTitle: "Умные связи",
          introText:
            "Это возможность для резидентов клуба встречаться с новыми людьми один на один. Нажмите «Хочу участвовать», чтобы мы подобрали вам партнера для встречи на этой неделе.",
          offlineEnabled: false,
          partner: null,
          feedbackPrompt: "",
        },
        broadcastSummaries: [],
      });
      return;
    }
    const residents = await listResidentsForDirectory(baserow, user.id);
    const events = await listUpcomingEvents(baserow);
    const myRegs = await listRegsForResident(baserow, user.id);
    const residentRowsForMatching = await listRows(baserow, baserow.tableResidents, { size: "200" });
    const meForMatching = await resolveResidentForUser(baserow, user, residentFields);
    const residentIdCandidates = collectResidentIdCandidatesForUser(residentRowsForMatching, residentFields, user);
    const meRowIdDigits = String(meForMatching?.id ?? "").replace(/\D/g, "");
    if (meRowIdDigits) residentIdCandidates.add(meRowIdDigits);
    const myTgId = String(user.id).replace(/\D/g, "");
    const myUsername = String(user.username || "").trim().replace(/^@/, "").toLowerCase();
    let broadcastSummaries: Array<{ id: number; title: string; fileUrl: string; text: string }> = [];
    try {
      broadcastSummaries = await listActiveBroadcastSummaries(baserow);
    } catch (e) {
      console.warn("broadcast summaries load failed:", e instanceof Error ? e.message : String(e));
    }
    try {
      await upsertUserSession(baserow, Number(me.id), user.id, {
        state: "active",
        currentPage: req.body?.currentPage,
        tempData: { source: "miniapp_bootstrap" },
      });
    } catch (e) {
      console.warn("user session touch failed:", e instanceof Error ? e.message : String(e));
    }
    const consentGiven = Boolean((me as Record<string, unknown>).consent_given);
    if (!consentGiven) {
      res.json({
        ok: true,
        mode: "baserow",
        needsConsent: true,
        residentId: Number(me.id),
        consentLinks: {
          marketing: "https://gordost.club/marketing",
          privacy: "https://gordost.club/privacy",
          personalData: "https://gordost.club/privacy",
        },
        profile: {
          exists: true,
          fullName: cellFromRow(me as Record<string, unknown>, residentFields, ["full_name", "fullname", "фио", "имя"]) || rowVal(me, "full_name") || "",
          city: "",
          birthDate: "",
          capital: "",
          monthlyIncome: "",
          telegramUsername: "",
          telegramId: "",
          personalRequests: "",
          photoUrl: "",
          role: "",
          occupation: "",
          hobbies: "",
          useful: "",
          invests: [],
          wantsToInvest: [],
        },
        investmentOptions: { invests: [], wantsToInvest: [] },
        residents: [],
        events: [],
        meetings: { mode: "idle" as const, introTitle: "", introText: "", offlineEnabled: false, partner: null, feedbackPrompt: "" },
        broadcastSummaries: [],
      });
      return;
    }
    const investsOptions = readMultiSelectOptions(residentFields, ["invests_in", "invests"]);
    const wantsToInvestOptions = readMultiSelectOptions(residentFields, ["wants_to_invest", "wants_to_invest_in"]);
    const investsField = getMultiSelectField(residentFields, ["invests_in", "invests"]);
    const wantsField = getMultiSelectField(residentFields, ["wants_to_invest", "wants_to_invest_in"]);
    const eventCards = await Promise.all(
      events.map(async (ev) => {
        const regs = await listRegsForEvent(baserow, Number(ev.id));
        const maxRaw = rowVal(ev, "MaxParticipants");
        const max = Math.max(0, Number.parseInt(maxRaw, 10) || 0);
        const byEventOnly = findUserRegForEvent(myRegs, user.id, Number(ev.id));
        // Берём ПОСЛЕДНЮЮ (с наибольшим id) регистрацию пользователя, а не первую.
        // regs.find() возвращал бы самую старую запись — например, отменённую (rejected),
        // из-за чего активная (approved) запись игнорировалась и в мини-аппе статус
        // не отображался (кнопка «Записаться» оставалась активной).
        const myMatches = regs
          .filter((r) => isRegistrationForUser(r, myTgId, myUsername, residentIdCandidates))
          .sort((a, b) => Number(b.id) - Number(a.id));
        const myFromEventRegs = myMatches[0];
        const my = activeUserReg((myFromEventRegs || byEventOnly) as BaserowRow | undefined);
        return {
          id: Number(ev.id),
          title: rowVal(ev, "Title") || rowVal(ev, "Name") || "Событие",
          description: rowVal(ev, "Description"),
          location: rowVal(ev, "Location"),
          link: rowVal(ev, "Link"),
          imageUrl: fileUrlFromCell((ev as Record<string, unknown>).Image || (ev as Record<string, unknown>).ScheduleImage),
          startsAt: parseEventDateMs(ev),
          occupied: occupiedSlots(regs),
          capacity: max > 0 ? max : null,
          myStatus: registrationStatus(my),
        };
      }),
    );
    const mapResident = (r: BaserowRow) => {
      const row = r as Record<string, unknown>;
      return {
        id: Number(r.id),
        name:
          cellFromRow(row, residentFields, ["full_name", "fullname", "фио", "имя"]) ||
          rowVal(r, "full_name") ||
          rowVal(r, "first_name") ||
          "Резидент",
        city: cellFromRow(row, residentFields, ["city", "город"]) || rowVal(r, "city"),
        birthDate:
          cellFromRow(row, residentFields, ["birthday", "birth_date", "date_of_birth", "день рождения", "дата рождения"]) ||
          rowVal(r, "birthday"),
        capital:
          cellFromRow(row, residentFields, ["capital", "инвестируемый капитал", "инвест. капитал", "инвесткапитал"]) ||
          rowVal(r, "capital"),
        monthlyIncome:
          cellFromRow(row, residentFields, [
            "monthly_income",
            "monthly income",
            "доход",
            "ежемесячный доход",
            "income",
            "зарплата",
          ]) || rowVal(r, "monthly_income"),
        telegramUsername:
          cellFromRow(row, residentFields, ["telegram_username", "tg_username", "telegram_user", "telegram"]) ||
          rowVal(r, "username") ||
          rowVal(r, "telegram_username") ||
          rowVal(r, "telegram_user") ||
          rowVal(r, "tg_username"),
        telegramId: cellFromRow(row, residentFields, ["telegram_id", "tg_id"]) || rowVal(r, "telegram_id"),
        occupation:
          cellFromRow(row, residentFields, ["occupation", "what_i_do", "activity", "чем я занимаюсь", "чем занимается", "деятельность"]) ||
          rowVal(r, "occupation") ||
          rowVal(r, "what_i_do"),
        hobbies:
          cellFromRow(row, residentFields, ["hobbies", "hobby", "interests", "интересы", "увлечения", "чем я увлекаюсь"]) ||
          rowVal(r, "hobbies") ||
          rowVal(r, "hobby") ||
          rowVal(r, "interests"),
        useful:
          cellFromRow(row, residentFields, ["useful_for_club", "useful", "чем полезен", "чем я могу быть полезен"]) ||
          rowVal(r, "useful_for_club"),
        role: cellFromRow(row, residentFields, ["role", "status", "роль"]) || rowVal(r, "role") || rowVal(r, "status"),
        requests:
          cellFromRow(row, residentFields, ["personal_requests", "requests", "запросы", "какие запросы", "какие у меня запросы в клубе"]) ||
          rowVal(r, "personal_requests"),
        photoUrl: fileUrlFromCell((r as Record<string, unknown>).photo),
        invests: parseMultiInput(investsField?.name ? row[investsField.name] : row.invests_in ?? rowVal(r, "invests_in")),
        wantsToInvest: parseMultiInput(wantsField?.name ? row[wantsField.name] : row.wants_to_invest ?? rowVal(r, "wants_to_invest")),
      };
    };
    const residentsUi = residents.slice(0, 100).map(mapResident);
    const meetingsState = await getMeetingsState(baserow, user.id);
    const meetingsPartner = meetingsState.partner?.row ? mapResident(meetingsState.partner.row) : null;

    res.json({
      ok: true,
      mode: "baserow",
      accessDenied: false,
      accessMessage: "",
      communityTelegram: COMMUNITY_CHAT_LINK,
      profile: me
        ? (() => {
            const row = me as Record<string, unknown>;
            const fullFromParts = [rowVal(me, "first_name"), rowVal(me, "last_name")].filter(Boolean).join(" ").trim();
            return {
              exists: true,
              fullName:
                cellFromRow(row, residentFields, ["full_name", "fullname", "фио", "имя"]) ||
                rowVal(me, "full_name") ||
                fullFromParts,
              city: cellFromRow(row, residentFields, ["city", "город"]) || rowVal(me, "city"),
              birthDate:
                cellFromRow(row, residentFields, [
                  "birthday",
                  "birth_date",
                  "date_of_birth",
                  "день рождения",
                  "дата рождения",
                ]) || rowVal(me, "birthday"),
              capital:
                cellFromRow(row, residentFields, ["capital", "инвестируемый капитал", "инвест. капитал", "инвесткапитал"]) ||
                rowVal(me, "capital"),
              monthlyIncome:
                cellFromRow(row, residentFields, [
                  "monthly_income",
                  "monthly income",
                  "доход",
                  "ежемесячный доход",
                  "income",
                  "зарплата",
                ]) || rowVal(me, "monthly_income"),
              telegramUsername:
                cellFromRow(row, residentFields, ["telegram_username", "tg_username", "telegram_user", "telegram"]) ||
                rowVal(me, "username") ||
                rowVal(me, "telegram_username") ||
                rowVal(me, "telegram_user") ||
                rowVal(me, "tg_username"),
              telegramId: cellFromRow(row, residentFields, ["telegram_id", "tg_id"]) || rowVal(me, "telegram_id"),
              personalRequests:
                cellFromRow(row, residentFields, ["personal_requests", "requests", "запросы", "какие запросы", "какие у меня запросы в клубе"]) ||
                rowVal(me, "personal_requests"),
              photoUrl: fileUrlFromCell((me as Record<string, unknown>).photo),
              role: cellFromRow(row, residentFields, ["role", "status", "роль"]) || rowVal(me, "role") || rowVal(me, "status"),
              occupation:
                cellFromRow(row, residentFields, ["occupation", "what_i_do", "activity", "чем я занимаюсь", "чем занимается", "деятельность"]) ||
                rowVal(me, "occupation") ||
                rowVal(me, "what_i_do"),
              hobbies:
                cellFromRow(row, residentFields, ["hobbies", "hobby", "interests", "интересы", "увлечения", "чем я увлекаюсь"]) ||
                rowVal(me, "hobbies") ||
                rowVal(me, "hobby") ||
                rowVal(me, "interests"),
              useful:
                cellFromRow(row, residentFields, ["useful_for_club", "useful", "чем полезен", "чем я могу быть полезен"]) ||
                rowVal(me, "useful_for_club"),
              invests: parseMultiInput(investsField?.name ? row[investsField.name] : row.invests_in ?? rowVal(me, "invests_in")),
              wantsToInvest: parseMultiInput(
                wantsField?.name ? row[wantsField.name] : row.wants_to_invest ?? rowVal(me, "wants_to_invest"),
              ),
            };
          })()
        : {
            exists: false,
            fullName: "",
            city: "",
            birthDate: "",
            capital: "",
            monthlyIncome: "",
            telegramUsername: "",
            telegramId: "",
            personalRequests: "",
            photoUrl: "",
            role: "",
            occupation: "",
            hobbies: "",
            useful: "",
            invests: [],
            wantsToInvest: [],
          },
      investmentOptions: {
        invests: investsOptions,
        wantsToInvest: wantsToInvestOptions,
      },
      residents: residentsUi,
      events: eventCards,
      meetings: {
        mode: meetingsState.mode,
        introTitle: "Умные связи",
        introText: meetingsState.introText,
        offlineEnabled: false,
        partner: meetingsPartner,
        feedbackPrompt: meetingsState.pendingFeedbackPrompt || "",
      },
      broadcastSummaries,
    });
    return;
  }

  const p = profileFor(user.id);
  const db = loadDb();
  res.json({
    ok: true,
    mode: "local",
    accessDenied: false,
    accessMessage: "",
    communityTelegram: COMMUNITY_CHAT_LINK,
    profile: {
      exists: true,
      fullName: p.displayName,
      city: "",
      birthDate: "",
      capital: "",
      monthlyIncome: "",
      telegramUsername: user.username || "",
      telegramId: "",
      personalRequests: p.notes,
      photoUrl: "",
      role: "",
      occupation: "",
      hobbies: "",
      useful: "",
      invests: [],
      wantsToInvest: [],
    },
    investmentOptions: {
      invests: [],
      wantsToInvest: [],
    },
    residents: db.residents.map((r) => ({
      id: Number(String(r.id).replace(/\D/g, "")) || 0,
      name: r.name,
      city: r.unit || "",
      birthDate: "",
      capital: "",
      monthlyIncome: "",
      telegramUsername: "",
      telegramId: "",
      occupation: "",
      hobbies: "",
      useful: r.note || "",
      role: "",
      requests: "",
      photoUrl: "",
      invests: [],
      wantsToInvest: [],
    })),
    events: db.events.map((e, idx) => ({
      id: idx + 1,
      title: e.title,
      description: e.description,
      location: "",
      link: "",
      imageUrl: "",
      startsAt: new Date(e.startsAt).getTime(),
      occupied: 0,
      capacity: e.capacity,
      myStatus: "",
    })),
    meetings: {
      mode: "idle",
      introTitle: "Умные связи",
      introText:
        "Это возможность для резидентов клуба встречаться с новыми людьми один на один. Нажмите «Хочу участвовать», чтобы мы подобрали вам партнера для встречи на этой неделе.",
      offlineEnabled: false,
      partner: null,
      feedbackPrompt: "",
    },
    broadcastSummaries: [],
  });
}));

// Запись согласий (consent_given)
app.post("/api/app/consent", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(500).json({ error: "Baserow не настроен." });
    return;
  }
  try {
    const me = (await getResidentByTelegram(baserow, user.id)) || (await getResidentByUsername(baserow, user.username || ""));
    if (!me) {
      res.status(404).json({ ok: false, error: "Резидент не найден." });
      return;
    }
    await patchRow(baserow, baserow.tableResidents, Number(me.id), { consent_given: true });
    res.json({ ok: true });
  } catch (e) {
    console.error("consent save failed:", e instanceof Error ? e.message : String(e));
    res.status(500).json({ ok: false, error: "Не удалось сохранить согласие." });
  }
}));

app.post("/api/app/external-events", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    const db = loadDb();
    res.json({
      ok: true,
      events: db.events.map((e, idx) => ({
        id: idx + 1,
        title: e.title,
        description: e.description,
        location: "",
        link: "",
        imageUrl: "",
        startsAt: new Date(e.startsAt).getTime(),
        occupied: 0,
        capacity: e.capacity,
        myStatus: "",
        externalPrice: "",
      })),
    });
    return;
  }
  try {
    const eventFields = await listTableFields(baserow, baserow.tableEvents);
    const externalKey = rowKeyForFieldId(eventFields, FIELD_EVENT_EXTERNAL) || rowKeyForFieldAliases(eventFields, ["external"]);
    const externalPriceKey =
      rowKeyForFieldId(eventFields, FIELD_EVENT_EXTERNAL_PRICE) || rowKeyForFieldAliases(eventFields, ["external_price", "цена", "стоимость"]);
    const events = await listUpcomingEvents(baserow);
    const filtered = externalKey ? events.filter((ev) => boolDb((ev as Record<string, unknown>)[externalKey])) : [];
    const myRegs = await listRegsForResident(baserow, user.id);
    const residentFields = await listTableFields(baserow, baserow.tableResidents);
    const residentRowsForMatching = await listRows(baserow, baserow.tableResidents, { size: "200" });
    const meForMatching = await resolveResidentForUser(baserow, user, residentFields);
    const residentIdCandidates = collectResidentIdCandidatesForUser(residentRowsForMatching, residentFields, user);
    const meRowIdDigits = String(meForMatching?.id ?? "").replace(/\D/g, "");
    if (meRowIdDigits) residentIdCandidates.add(meRowIdDigits);
    const myTgId = String(user.id).replace(/\D/g, "");
    const myUsername = String(user.username || "").trim().replace(/^@/, "").toLowerCase();
    const cards = await Promise.all(
      filtered.map(async (ev) => {
        const regs = await listRegsForEvent(baserow, Number(ev.id));
        const maxRaw = rowVal(ev, "MaxParticipants");
        const max = Math.max(0, Number.parseInt(maxRaw, 10) || 0);
        const byEventOnly = findUserRegForEvent(myRegs, user.id, Number(ev.id));
        // Берём ПОСЛЕДНЮЮ (с наибольшим id) регистрацию пользователя, а не первую.
        // regs.find() возвращал бы самую старую запись — например, отменённую (rejected),
        // из-за чего активная (approved) запись игнорировалась и в мини-аппе статус
        // не отображался (кнопка «Записаться» оставалась активной).
        const myMatches = regs
          .filter((r) => isRegistrationForUser(r, myTgId, myUsername, residentIdCandidates))
          .sort((a, b) => Number(b.id) - Number(a.id));
        const myFromEventRegs = myMatches[0];
        const my = activeUserReg((myFromEventRegs || byEventOnly) as BaserowRow | undefined);
        const row = ev as Record<string, unknown>;
        return {
          id: Number(ev.id),
          title: rowVal(ev, "Title") || rowVal(ev, "Name") || "Событие",
          description: rowVal(ev, "Description"),
          location: rowVal(ev, "Location"),
          link: rowVal(ev, "Link"),
          imageUrl: fileUrlFromCell(row.Image || row.ScheduleImage),
          startsAt: parseEventDateMs(ev),
          occupied: occupiedSlots(regs),
          capacity: max > 0 ? max : null,
          myStatus: registrationStatus(my),
          externalPrice: externalPriceKey ? formatScalarCell(row[externalPriceKey]) : "",
        };
      }),
    );
    res.json({ ok: true, events: cards });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Не удалось загрузить внешние события." });
  }
}));

app.post("/api/app/session/touch", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.json({ ok: true, skipped: "baserow_off" });
    return;
  }
  try {
    const me = await resolveResidentForUser(baserow, user);
    if (!me?.id) {
      res.json({ ok: true, skipped: "resident_not_found" });
      return;
    }
    await upsertUserSession(baserow, Number(me.id), user.id, {
      state: String(req.body?.state || "active"),
      currentPage: req.body?.currentPage,
      lastBackState: String(req.body?.lastBackState || ""),
      activeMatchId: req.body?.activeMatchId,
      tempData: req.body?.tempData,
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Ошибка обновления user session." });
  }
}));

app.post("/api/app/profile/update", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  const city = String(req.body?.city || "").trim();
  const birthDateRaw = String(req.body?.birthDate || "");
  const birthDate = normalizeBirthDateStrict(birthDateRaw);
  const capitalRaw = String(req.body?.capital || "").trim();
  const monthlyIncomeRaw = String(req.body?.monthlyIncome || "").trim();
  const capital = normalizeNumberStrict(capitalRaw);
  const monthlyIncome = normalizeNumberStrict(monthlyIncomeRaw);
  const photoUrl = String(req.body?.photoUrl || "").trim();
  const telegramUsername = String(req.body?.telegramUsername || "").trim().replace(/^@/, "");
  const hobbies = String(req.body?.hobbies || "").trim();
  const occupation = String(req.body?.occupation || "").trim();
  const phone = normalizePhoneStrict(req.body?.phone);
  const email = normalizeEmailStrict(req.body?.email);
  const investExperience = String(req.body?.investExperience || "").trim();
  const invests = parseMultiInput(req.body?.invests);
  const wantsToInvest = parseMultiInput(req.body?.wantsToInvest);
  const useful = String(req.body?.useful || "").trim();
  const personalRequests = String(req.body?.personalRequests || "").trim();
  const additional = String(req.body?.additional || "").trim();
  const socialNetworks = String(req.body?.socialNetworks || "").trim();
  if (baserow) {
    try {
      const me = (await getResidentByTelegram(baserow, user.id)) || (await getResidentByUsername(baserow, user.username || ""));
      if (!me?.id) {
        res.status(404).json({ error: "Профиль не найден в базе." });
        return;
      }
      const residentFields = await listTableFields(baserow, baserow.tableResidents);
      const meRow = me as Record<string, unknown>;
      const firstName = rowVal(me, "first_name");
      const lastName = rowVal(me, "last_name");
      const patch: Record<string, unknown> = {};
      const putField = (aliases: string[], value: unknown, fallbackKey: string) => {
        const k = rowKeyForFieldAliases(residentFields, aliases) || pickRowKey(meRow, aliases) || fallbackKey;
        patch[k] = value;
      };
      putField(["city", "город"], city, "city");
      putField(["birthday", "birth_date", "date_of_birth", "день рождения", "дата рождения"], birthDate, "birthday");
      putField(["capital", "инвестируемый капитал", "инвест. капитал", "инвесткапитал"], capital, "capital");
      putField(
        ["monthly_income", "monthly income", "доход", "ежемесячный доход", "income", "зарплата"],
        monthlyIncome,
        "monthly_income",
      );
      putField(
        ["occupation", "what_i_do", "activity", "чем я занимаюсь", "чем занимается", "деятельность"],
        occupation,
        "occupation",
      );
      putField(PHONE_ALIASES, phone, "phone");
      putField(EMAIL_ALIASES, email, "email");
      putField(INVEST_EXPERIENCE_ALIASES, investExperience, "invest_experience");
      putField(["useful_for_club", "useful", "чем полезен", "чем я могу быть полезен"], useful, "useful_for_club");
      putField(
        ["personal_requests", "requests", "запросы", "какие запросы", "какие у меня запросы в клубе"],
        personalRequests,
        "personal_requests",
      );
      const optionalPatchMap: Array<[aliases: string[], value: string, fallback: string]> = [
        [["username", "telegram_username", "telegram_user", "tg_username"], telegramUsername, "username"],
        [["hobbies", "hobby", "interests", "интересы", "увлечения", "чем я увлекаюсь", "чем_я_увлекаюсь"], hobbies, "hobbies"],
        [["photo_url", "photo_link", "avatar_url"], photoUrl, "photo_url"],
      ];
      for (const [aliases, value, fb] of optionalPatchMap) {
        putField(aliases, value, fb);
      }

      const investsField = getMultiSelectField(residentFields, ["invests_in", "invests"]);
      const wantsField = getMultiSelectField(residentFields, ["wants_to_invest", "wants_to_invest_in"]);
      if (investsField) {
        patch[investsField.name] = mapValuesToSelectIds(invests, investsField.options);
      }
      if (wantsField) {
        patch[wantsField.name] = mapValuesToSelectIds(wantsToInvest, wantsField.options);
      }
      const existingInvests = parseMultiInput(investsField?.name ? meRow[investsField.name] : meRow.invests_in ?? rowVal(me, "invests_in"));
      const existingWants = parseMultiInput(
        wantsField?.name ? meRow[wantsField.name] : meRow.wants_to_invest ?? rowVal(me, "wants_to_invest"),
      );
      const hasInvestmentsAfterSave = (invests.length || existingInvests.length || wantsToInvest.length || existingWants.length) > 0;
      const hasPhotoAfterSave = Boolean(photoUrl) || hasPhotoInResidentRow(meRow, residentFields);
      const profileCompleteField =
        rowKeyForFieldId(residentFields, 7816) ||
        rowKeyForFieldAliases(residentFields, ["profile_complete", "profile complete", "профиль заполнен"]) ||
        "profile_complete";
      patch[profileCompleteField] = hasPhotoAfterSave && hasInvestmentsAfterSave;

      await updateResidentFields(baserow, Number(me.id), patch);
      let espoContactId =
        cellFromRow(meRow, residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id", "espo_contact"]) ||
        rowVal(me, "espo_contact_id");
      if (!espoContactId) {
        espoContactId = await resolveEspoContactIdFallback(
          rowVal(me, "telegram_id"),
          telegramUsername || rowVal(me, "username"),
          firstName,
          lastName,
        );
        if (espoContactId) {
          const espoFieldKey = rowKeyForFieldAliases(residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id"]) || "espo_contact_id";
          await updateResidentFields(baserow, Number(me.id), { [espoFieldKey]: espoContactId });
        }
      }
      void triggerProfileReverseSync({
        espoContactId,
        baserowRowId: Number(me.id),
        telegramId: user.id,
        firstName,
        lastName,
        city,
        birthDate,
        capital,
        monthlyIncome,
        useful,
        occupation,
        personalRequests,
        interests: hobbies,
        investsIn: invests,
        wantsToInvest,
        phone,
        email,
        investExperience,
      });
      res.json({ ok: true });
      return;
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Ошибка сохранения профиля." });
      return;
    }
  }

  setProfileField(user.id, "phone", telegramUsername);
  setProfileField(user.id, "notes", personalRequests);
  res.json({ ok: true });
}));

app.post("/api/app/investbanya/form-data", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(400).json({ error: "Форма доступна только при подключённой базе." });
    return;
  }

  try {
    const residentFields = await listTableFields(baserow, baserow.tableResidents);
    const me = await resolveResidentForUser(baserow, user, residentFields);
    const investsOptionsRaw = readMultiSelectOptions(residentFields, INVESTS_FIELD_ALIASES);
    const wantsToInvestOptionsRaw = readMultiSelectOptions(residentFields, WANTS_TO_INVEST_FIELD_ALIASES);
    if (!me) {
      res.json({
        ok: true,
        exists: false,
        profile: {
          fullName: "",
          city: "",
          birthDate: "",
          phone: "",
          email: "",
          investExperience: "",
          occupation: "",
          useful: "",
          hobbies: "",
          personalRequests: "",
          capital: "",
          monthlyIncome: "",
          invests: [],
          wantsToInvest: [],
          additional: "",
          socialNetworks: "",
        },
        investmentOptions: {
          invests: investsOptionsRaw,
          wantsToInvest: wantsToInvestOptionsRaw,
        },
      });
      return;
    }

    const row = me as Record<string, unknown>;
    const investsField = getMultiSelectField(residentFields, INVESTS_FIELD_ALIASES);
    const wantsField = getMultiSelectField(residentFields, WANTS_TO_INVEST_FIELD_ALIASES);
    const profileInvests = parseMultiInput(investsField?.name ? row[investsField.name] : row.invests_in ?? rowVal(me, "invests_in"));
    const profileWants = parseMultiInput(wantsField?.name ? row[wantsField.name] : row.wants_to_invest ?? rowVal(me, "wants_to_invest"));
    const investsOptions = Array.from(new Set([...investsOptionsRaw, ...profileInvests]));
    const wantsToInvestOptions = Array.from(new Set([...wantsToInvestOptionsRaw, ...profileWants]));
    const fullFromParts = [rowVal(me, "first_name"), rowVal(me, "last_name")].filter(Boolean).join(" ").trim();
    res.json({
      ok: true,
      exists: true,
      profile: {
        fullName:
          cellFromRow(row, residentFields, ["full_name", "fullname", "фио", "имя"]) ||
          rowVal(me, "full_name") ||
          fullFromParts,
        city: cellFromRow(row, residentFields, ["city", "город"]) || rowVal(me, "city"),
        birthDate:
          cellFromRow(row, residentFields, ["birthday", "birth_date", "date_of_birth", "день рождения", "дата рождения"]) ||
          rowVal(me, "birthday"),
        phone: cellFromRow(row, residentFields, PHONE_ALIASES) || rowVal(me, "phone"),
        email: cellFromRow(row, residentFields, EMAIL_ALIASES) || rowVal(me, "email"),
        investExperience: cellFromRow(row, residentFields, INVEST_EXPERIENCE_ALIASES) || rowVal(me, "invest_experience"),
        occupation:
          cellFromRow(row, residentFields, ["occupation", "what_i_do", "activity", "чем я занимаюсь", "чем занимается", "деятельность"]) ||
          rowVal(me, "occupation") ||
          rowVal(me, "what_i_do"),
        useful:
          cellFromRow(row, residentFields, ["useful_for_club", "useful", "чем полезен", "чем я могу быть полезен"]) ||
          rowVal(me, "useful_for_club"),
        hobbies:
          cellFromRow(row, residentFields, ["hobbies", "hobby", "interests", "интересы", "увлечения", "чем я увлекаюсь"]) ||
          rowVal(me, "hobbies") ||
          rowVal(me, "hobby") ||
          rowVal(me, "interests"),
        personalRequests:
          cellFromRow(row, residentFields, ["personal_requests", "requests", "запросы", "какие запросы", "какие у меня запросы в клубе"]) ||
          rowVal(me, "personal_requests"),
        capital:
          cellFromRow(row, residentFields, ["capital", "инвестируемый капитал", "инвест. капитал", "инвесткапитал"]) ||
          rowVal(me, "capital"),
        monthlyIncome:
          cellFromRow(row, residentFields, [
            "monthly_income",
            "monthly income",
            "доход",
            "ежемесячный доход",
            "income",
            "зарплата",
          ]) || rowVal(me, "monthly_income"),
        invests: profileInvests,
        wantsToInvest: profileWants,
        additional: cellFromRow(row, residentFields, ["Additional", "additional", "дополнительно", "что еще"]) || rowVal(me, "Additional") || "",
        socialNetworks: cellFromRow(row, residentFields, ["Social_netwotks", "social_networks", "соцсети", "социальные сети"]) || rowVal(me, "Social_netwotks") || "",
      },
      investmentOptions: {
        invests: investsOptions,
        wantsToInvest: wantsToInvestOptions,
      },
    });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Не удалось загрузить анкету ИнвестБани." });
  }
}));

app.post("/api/app/investbanya/apply", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(400).json({ error: "Сохранение доступно только при подключённой базе." });
    return;
  }

  const fullName = String(req.body?.fullName || "").trim();
  const city = String(req.body?.city || "").trim();
  const birthDateRaw = String(req.body?.birthDate || "");
  const birthDate = normalizeBirthDateStrict(birthDateRaw);
  const occupation = String(req.body?.occupation || "").trim();
  const phone = normalizePhoneStrict(req.body?.phone);
  const email = normalizeEmailStrict(req.body?.email);
  const investExperience = String(req.body?.investExperience || "").trim();
  const hobbies = String(req.body?.hobbies || "").trim();
  const useful = String(req.body?.useful || "").trim();
  const personalRequests = String(req.body?.personalRequests || "").trim();
  const additional = String(req.body?.additional || "").trim();
  const socialNetworks = String(req.body?.socialNetworks || "").trim();
  const capitalRaw = String(req.body?.capital || "").trim();
  const monthlyIncomeRaw = String(req.body?.monthlyIncome || "").trim();
  const capital = normalizeNumberStrict(capitalRaw);
  const monthlyIncome = normalizeNumberStrict(monthlyIncomeRaw);
  const invests = parseMultiInput(req.body?.invests);
  const wantsToInvest = parseMultiInput(req.body?.wantsToInvest);
  const telegramUsername = String(user.username || "").trim().replace(/^@/, "");

  const requiredErrors: string[] = [];
  if (!fullName) requiredErrors.push("ФИО");
  if (!city) requiredErrors.push("Город");
  if (!birthDate) requiredErrors.push("День рождения");
  if (!phone) requiredErrors.push("Номер телефона");
  if (!email) requiredErrors.push("E-mail");
  if (!investExperience) requiredErrors.push("Опыт инвестиций");
  if (!capital) requiredErrors.push("Капитал");
  if (!monthlyIncome) requiredErrors.push("Доход");
  if (!occupation) requiredErrors.push("Чем я занимаюсь");
  if (!useful) requiredErrors.push("Чем я могу быть полезен");
  if (!hobbies) requiredErrors.push("Чем я увлекаюсь");
  if (!personalRequests) requiredErrors.push("Запрос в клубе");
  if (!invests.length) requiredErrors.push("Во что инвестирую");
  if (!wantsToInvest.length) requiredErrors.push("Во что хочу инвестировать");
  if (requiredErrors.length) {
    res.status(400).json({ error: `Заполните обязательные поля: ${requiredErrors.join(", ")}` });
    return;
  }
  if (!birthDate) {
    res.status(400).json({ error: "Неверный формат даты рождения. Используйте ДД/ММ/ГГГГ." });
    return;
  }
  if (!capital) {
    res.status(400).json({ error: "Неверный формат поля Капитал. Допустимы только цифры." });
    return;
  }
  if (!monthlyIncome) {
    res.status(400).json({ error: "Неверный формат поля Доход. Допустимы только цифры." });
    return;
  }
  if (!phone) {
    res.status(400).json({ error: "Неверный формат номера телефона." });
    return;
  }
  if (!email) {
    res.status(400).json({ error: "Неверный формат e-mail." });
    return;
  }
  if (!birthDate) {
    res.status(400).json({ error: "Неверный формат даты рождения. Используйте ДД/ММ/ГГГГ." });
    return;
  }
  if (!capital) {
    res.status(400).json({ error: "Неверный формат поля Капитал. Допустимы только цифры." });
    return;
  }
  if (!monthlyIncome) {
    res.status(400).json({ error: "Неверный формат поля Доход. Допустимы только цифры." });
    return;
  }

  try {
    const residentFields = await listTableFields(baserow, baserow.tableResidents);
    const me = (await getResidentByTelegram(baserow, user.id)) || (await getResidentByUsername(baserow, user.username || ""));
    const meRow = (me || {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    const putField = (aliases: string[], value: unknown, fallbackKey: string) => {
      const k = rowKeyForFieldAliases(residentFields, aliases) || pickRowKey(meRow, aliases) || fallbackKey;
      patch[k] = value;
    };

    putField(["full_name", "fullname", "фио", "имя"], fullName, "full_name");
    putField(["city", "город"], city, "city");
    if (birthDate) {
      putField(["birthday", "birth_date", "date_of_birth", "день рождения", "дата рождения"], birthDate, "birthday");
    }
    putField(
      ["occupation", "what_i_do", "activity", "чем я занимаюсь", "чем занимается", "деятельность"],
      occupation,
      "occupation",
    );
    putField(PHONE_ALIASES, phone, "phone");
    putField(EMAIL_ALIASES, email, "email");
    putField(INVEST_EXPERIENCE_ALIASES, investExperience, "invest_experience");
    putField(["hobbies", "hobby", "interests", "интересы", "увлечения", "чем я увлекаюсь"], hobbies, "hobbies");
    if (useful) putField(["useful_for_club", "useful", "чем полезен", "чем я могу быть полезен"], useful, "useful_for_club");
    if (personalRequests) {
      putField(
        ["personal_requests", "requests", "запросы", "какие запросы", "какие у меня запросы в клубе"],
        personalRequests,
        "personal_requests",
      );
    }
    putField(["capital", "инвестируемый капитал", "инвест. капитал", "инвесткапитал"], capital, "capital");
    putField(
      ["monthly_income", "monthly income", "доход", "ежемесячный доход", "income", "зарплата"],
      monthlyIncome,
      "monthly_income",
    );
    putField(["username", "telegram_username", "telegram_user", "tg_username"], telegramUsername, "username");
    putField(["telegram_id", "tg_id"], Number(user.id), "telegram_id");

    const investsField = getMultiSelectField(residentFields, INVESTS_FIELD_ALIASES);
    const wantsField = getMultiSelectField(residentFields, WANTS_TO_INVEST_FIELD_ALIASES);
    if (investsField && invests.length) patch[investsField.name] = mapValuesToSelectIds(invests, investsField.options);
    if (wantsField && wantsToInvest.length) patch[wantsField.name] = mapValuesToSelectIds(wantsToInvest, wantsField.options);

    if (additional) putField(["Additional", "additional", "дополнительно"], additional, "Additional");
    if (socialNetworks) putField(["Social_netwotks", "social_networks", "соцсети", "социальные сети"], socialNetworks, "Social_netwotks");
    const investBanyaKey =
      rowKeyForFieldId(residentFields, FIELD_RESIDENT_INVEST_BANYA) ||
      rowKeyForFieldAliases(residentFields, ["investbanya", "invest_banya", "invest banya", "инвестбаня"]) ||
      "InvestBanya";
    patch[investBanyaKey] = true;

    const nameParts = splitFullName(fullName);
    if (me?.id) {
      await updateResidentFields(baserow, Number(me.id), patch);
      const rowWithPatch = { ...meRow, ...patch };
      let espoContactId =
        cellFromRow(rowWithPatch, residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id", "espo_contact"]) ||
        rowVal(me, "espo_contact_id");
      if (!espoContactId) {
        espoContactId = await resolveEspoContactDuplicateId(
          String(user.id),
          telegramUsername,
          nameParts.firstName,
          nameParts.lastName,
        );
      }
      await persistResidentEspoContactIdIfMissing(baserow, residentFields, Number(me.id), rowVal(me, "espo_contact_id"), espoContactId);
      void triggerProfileReverseSync({
        espoContactId,
        baserowRowId: Number(me.id),
        telegramId: user.id,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        city,
        birthDate,
        capital,
        monthlyIncome,
        useful,
        occupation,
        personalRequests,
        interests: hobbies,
        investsIn: invests,
        wantsToInvest,
        phone,
        email,
        investExperience,
      });
      res.json({ ok: true, mode: "updated" });
      return;
    }
    const created = (await createRow(baserow, baserow.tableResidents, patch)) as BaserowRow;
    const createdRowId = Number(created?.id);
    const createdRowObj = created as Record<string, unknown>;
    let espoContactId =
      cellFromRow(createdRowObj, residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id", "espo_contact"]) ||
      rowVal(created, "espo_contact_id");
    if (!espoContactId) {
      espoContactId = await resolveEspoContactDuplicateId(
        String(user.id),
        telegramUsername,
        nameParts.firstName,
        nameParts.lastName,
      );
    }
    await persistResidentEspoContactIdIfMissing(baserow, residentFields, createdRowId, rowVal(created, "espo_contact_id"), espoContactId);
    void triggerProfileReverseSync({
      espoContactId,
      baserowRowId: Number.isFinite(createdRowId) ? createdRowId : undefined,
      telegramId: user.id,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      city,
      birthDate,
      capital,
      monthlyIncome,
      useful,
      occupation,
      personalRequests,
      interests: hobbies,
      investsIn: invests,
      wantsToInvest,
      phone,
      email,
      investExperience,
    });
    res.json({ ok: true, mode: "created" });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Не удалось отправить заявку в ИнвестБаню." });
  }
}));

app.post("/api/app/gordost/form-data", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(400).json({ error: "Форма доступна только при подключённой базе." });
    return;
  }

  try {
    const residentFields = await listTableFields(baserow, baserow.tableResidents);
    const me = await resolveResidentForUser(baserow, user, residentFields);
    const investsOptionsRaw = readMultiSelectOptions(residentFields, INVESTS_FIELD_ALIASES);
    const wantsToInvestOptionsRaw = readMultiSelectOptions(residentFields, WANTS_TO_INVEST_FIELD_ALIASES);
    if (!me) {
      res.json({
        ok: true,
        exists: false,
        profile: {
          fullName: "",
          city: "",
          birthDate: "",
          phone: "",
          email: "",
          investExperience: "",
          occupation: "",
          useful: "",
          hobbies: "",
          personalRequests: "",
          capital: "",
          monthlyIncome: "",
          invests: [],
          wantsToInvest: [],
          additional: "",
          socialNetworks: "",
        },
        investmentOptions: {
          invests: investsOptionsRaw,
          wantsToInvest: wantsToInvestOptionsRaw,
        },
      });
      return;
    }

    const row = me as Record<string, unknown>;
    const investsField = getMultiSelectField(residentFields, INVESTS_FIELD_ALIASES);
    const wantsField = getMultiSelectField(residentFields, WANTS_TO_INVEST_FIELD_ALIASES);
    const profileInvests = parseMultiInput(investsField?.name ? row[investsField.name] : row.invests_in ?? rowVal(me, "invests_in"));
    const profileWants = parseMultiInput(wantsField?.name ? row[wantsField.name] : row.wants_to_invest ?? rowVal(me, "wants_to_invest"));
    const investsOptions = Array.from(new Set([...investsOptionsRaw, ...profileInvests]));
    const wantsToInvestOptions = Array.from(new Set([...wantsToInvestOptionsRaw, ...profileWants]));
    const fullFromParts = [rowVal(me, "first_name"), rowVal(me, "last_name")].filter(Boolean).join(" ").trim();
    res.json({
      ok: true,
      exists: true,
      profile: {
        fullName:
          cellFromRow(row, residentFields, ["full_name", "fullname", "фио", "имя"]) ||
          rowVal(me, "full_name") ||
          fullFromParts,
        city: cellFromRow(row, residentFields, ["city", "город"]) || rowVal(me, "city"),
        birthDate:
          cellFromRow(row, residentFields, ["birthday", "birth_date", "date_of_birth", "день рождения", "дата рождения"]) ||
          rowVal(me, "birthday"),
        phone: cellFromRow(row, residentFields, PHONE_ALIASES) || rowVal(me, "phone"),
        email: cellFromRow(row, residentFields, EMAIL_ALIASES) || rowVal(me, "email"),
        investExperience: cellFromRow(row, residentFields, INVEST_EXPERIENCE_ALIASES) || rowVal(me, "invest_experience"),
        occupation:
          cellFromRow(row, residentFields, ["occupation", "what_i_do", "activity", "чем я занимаюсь", "чем занимается", "деятельность"]) ||
          rowVal(me, "occupation") ||
          rowVal(me, "what_i_do"),
        useful:
          cellFromRow(row, residentFields, ["useful_for_club", "useful", "чем полезен", "чем я могу быть полезен"]) ||
          rowVal(me, "useful_for_club"),
        hobbies:
          cellFromRow(row, residentFields, ["hobbies", "hobby", "interests", "интересы", "увлечения", "чем я увлекаюсь"]) ||
          rowVal(me, "hobbies") ||
          rowVal(me, "hobby") ||
          rowVal(me, "interests"),
        personalRequests:
          cellFromRow(row, residentFields, ["personal_requests", "requests", "запросы", "какие запросы", "какие у меня запросы в клубе"]) ||
          rowVal(me, "personal_requests"),
        capital:
          cellFromRow(row, residentFields, ["capital", "инвестируемый капитал", "инвест. капитал", "инвесткапитал"]) ||
          rowVal(me, "capital"),
        monthlyIncome:
          cellFromRow(row, residentFields, [
            "monthly_income",
            "monthly income",
            "доход",
            "ежемесячный доход",
            "income",
            "зарплата",
          ]) || rowVal(me, "monthly_income"),
        invests: profileInvests,
        wantsToInvest: profileWants,
        additional: cellFromRow(row, residentFields, ["Additional", "additional", "дополнительно", "что еще"]) || rowVal(me, "Additional") || "",
        socialNetworks: cellFromRow(row, residentFields, ["Social_netwotks", "social_networks", "соцсети", "социальные сети"]) || rowVal(me, "Social_netwotks") || "",
      },
      investmentOptions: {
        invests: investsOptions,
        wantsToInvest: wantsToInvestOptions,
      },
    });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Не удалось загрузить анкету клуба Гордость." });
  }
}));

app.post("/api/app/gordost/apply", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(400).json({ error: "Сохранение доступно только при подключённой базе." });
    return;
  }

  const fullName = String(req.body?.fullName || "").trim();
  const city = String(req.body?.city || "").trim();
  const birthDate = normalizeBirthDateInput(req.body?.birthDate);
  const occupation = String(req.body?.occupation || "").trim();
  const phone = normalizePhoneStrict(req.body?.phone);
  const email = normalizeEmailStrict(req.body?.email);
  const investExperience = String(req.body?.investExperience || "").trim();
  const hobbies = String(req.body?.hobbies || "").trim();
  const useful = String(req.body?.useful || "").trim();
  const personalRequests = String(req.body?.personalRequests || "").trim();
  const additional = String(req.body?.additional || "").trim();
  const socialNetworks = String(req.body?.socialNetworks || "").trim();
  const capital = String(req.body?.capital || "").trim();
  const monthlyIncome = String(req.body?.monthlyIncome || "").trim();
  const invests = parseMultiInput(req.body?.invests);
  const wantsToInvest = parseMultiInput(req.body?.wantsToInvest);
  const telegramUsername = String(user.username || "").trim().replace(/^@/, "");

  const requiredErrors: string[] = [];
  if (!fullName) requiredErrors.push("ФИО");
  if (!city) requiredErrors.push("Город");
  if (!birthDate) requiredErrors.push("День рождения");
  if (!phone) requiredErrors.push("Номер телефона");
  if (!email) requiredErrors.push("E-mail");
  if (!investExperience) requiredErrors.push("Опыт инвестиций");
  if (!capital) requiredErrors.push("Капитал");
  if (!monthlyIncome) requiredErrors.push("Доход");
  if (!occupation) requiredErrors.push("Чем я занимаюсь");
  if (!useful) requiredErrors.push("Чем я могу быть полезен");
  if (!hobbies) requiredErrors.push("Чем я увлекаюсь");
  if (!personalRequests) requiredErrors.push("Запрос в клубе");
  if (!invests.length) requiredErrors.push("Во что инвестирую");
  if (!wantsToInvest.length) requiredErrors.push("Во что хочу инвестировать");
  if (requiredErrors.length) {
    res.status(400).json({ error: `Заполните обязательные поля: ${requiredErrors.join(", ")}` });
    return;
  }

  try {
    const residentFields = await listTableFields(baserow, baserow.tableResidents);
    const me = await resolveResidentForUser(baserow, user, residentFields);
    const meRow = (me || {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    const putField = (aliases: string[], value: unknown, fallbackKey: string) => {
      const k = rowKeyForFieldAliases(residentFields, aliases) || pickRowKey(meRow, aliases) || fallbackKey;
      patch[k] = value;
    };

    putField(["full_name", "fullname", "фио", "имя"], fullName, "full_name");
    putField(["city", "город"], city, "city");
    putField(["birthday", "birth_date", "date_of_birth", "день рождения", "дата рождения"], birthDate, "birthday");
    putField(
      ["occupation", "what_i_do", "activity", "чем я занимаюсь", "чем занимается", "деятельность"],
      occupation,
      "occupation",
    );
    putField(PHONE_ALIASES, phone, "phone");
    putField(EMAIL_ALIASES, email, "email");
    putField(INVEST_EXPERIENCE_ALIASES, investExperience, "invest_experience");
    putField(["hobbies", "hobby", "interests", "интересы", "увлечения", "чем я увлекаюсь"], hobbies, "hobbies");
    putField(["useful_for_club", "useful", "чем полезен", "чем я могу быть полезен"], useful, "useful_for_club");
    putField(
      ["personal_requests", "requests", "запросы", "какие запросы", "какие у меня запросы в клубе"],
      personalRequests,
      "personal_requests",
    );
    putField(["capital", "инвестируемый капитал", "инвест. капитал", "инвесткапитал"], capital, "capital");
    putField(
      ["monthly_income", "monthly income", "доход", "ежемесячный доход", "income", "зарплата"],
      monthlyIncome,
      "monthly_income",
    );
    putField(["username", "telegram_username", "telegram_user", "tg_username"], telegramUsername, "username");
    putField(["telegram_id", "tg_id"], Number(user.id), "telegram_id");

    const investsField = getMultiSelectField(residentFields, INVESTS_FIELD_ALIASES);
    const wantsField = getMultiSelectField(residentFields, WANTS_TO_INVEST_FIELD_ALIASES);
    if (investsField) patch[investsField.name] = mapValuesToSelectIds(invests, investsField.options);
    if (wantsField) patch[wantsField.name] = mapValuesToSelectIds(wantsToInvest, wantsField.options);

    if (additional) putField(["Additional", "additional", "дополнительно"], additional, "Additional");
    if (socialNetworks) putField(["Social_netwotks", "social_networks", "соцсети", "социальные сети"], socialNetworks, "Social_netwotks");
    const gordostKey =
      rowKeyForFieldId(residentFields, FIELD_RESIDENT_GORDOST) ||
      rowKeyForFieldAliases(residentFields, ["gordost", "club_gordost", "club_gordost_member", "клуб гордость"]) ||
      "Gordost";
    patch[gordostKey] = true;

    const nameParts = splitFullName(fullName);
    if (me?.id) {
      await updateResidentFields(baserow, Number(me.id), patch);
      const rowWithPatch = { ...meRow, ...patch };
      let espoContactId =
        cellFromRow(rowWithPatch, residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id", "espo_contact"]) ||
        rowVal(me, "espo_contact_id");
      if (!espoContactId) {
        espoContactId = await resolveEspoContactDuplicateId(
          String(user.id),
          telegramUsername,
          nameParts.firstName,
          nameParts.lastName,
        );
      }
      await persistResidentEspoContactIdIfMissing(baserow, residentFields, Number(me.id), rowVal(me, "espo_contact_id"), espoContactId);
      void triggerProfileReverseSync({
        espoContactId,
        baserowRowId: Number(me.id),
        telegramId: user.id,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        city,
        birthDate,
        capital,
        monthlyIncome,
        useful,
        occupation,
        personalRequests,
        interests: hobbies,
        investsIn: invests,
        wantsToInvest,
        phone,
        email,
        investExperience,
      });
      res.json({ ok: true, mode: "updated" });
      return;
    }
    const created = (await createRow(baserow, baserow.tableResidents, patch)) as BaserowRow;
    const createdRowId = Number(created?.id);
    const createdRowObj = created as Record<string, unknown>;
    let espoContactId =
      cellFromRow(createdRowObj, residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id", "espo_contact"]) ||
      rowVal(created, "espo_contact_id");
    if (!espoContactId) {
      espoContactId = await resolveEspoContactDuplicateId(
        String(user.id),
        telegramUsername,
        nameParts.firstName,
        nameParts.lastName,
      );
    }
    await persistResidentEspoContactIdIfMissing(baserow, residentFields, createdRowId, rowVal(created, "espo_contact_id"), espoContactId);
    void triggerProfileReverseSync({
      espoContactId,
      baserowRowId: Number.isFinite(createdRowId) ? createdRowId : undefined,
      telegramId: user.id,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      city,
      birthDate,
      capital,
      monthlyIncome,
      useful,
      occupation,
      personalRequests,
      interests: hobbies,
      investsIn: invests,
      wantsToInvest,
      phone,
      email,
      investExperience,
    });
    res.json({ ok: true, mode: "created" });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Не удалось отправить заявку в Клуб Гордость." });
  }
}));

app.post("/api/app/project/apply", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(400).json({ error: "Сохранение доступно только при подключённой базе." });
    return;
  }

  const projectName = String(req.body?.projectName || "").trim();
  const description = String(req.body?.description || "").trim();
  const stage = String(req.body?.stage || "").trim();
  const timeCommitment = String(req.body?.timeCommitment || "").trim();
  const cofounders = String(req.body?.cofounders || "").trim();
  const keyPersons = String(req.body?.keyPersons || "").trim();
  const pastFailures = String(req.body?.pastFailures || "").trim();
  const personalInvestment = String(req.body?.personalInvestment || "").trim();
  const otherProjects = String(req.body?.otherProjects || "").trim();
  const clientReferences = String(req.body?.clientReferences || "").trim();
  const competitorsAdvantage = String(req.body?.competitorsAdvantage || "").trim();
  const founderAbsencePlan = String(req.body?.founderAbsencePlan || "").trim();
  const unitEconomics = String(req.body?.unitEconomics || "").trim();
  const legalStructure = String(req.body?.legalStructure || "").trim();
  const activeLitigation = String(req.body?.activeLitigation || "").trim();
  const licenses = String(req.body?.licenses || "").trim();
  const investmentType = String(req.body?.investmentType || "").trim();
  const fundingAsk = String(req.body?.fundingAsk || "").trim();
  const valuation = String(req.body?.valuation || "").trim();
  const exitPlan = String(req.body?.exitPlan || "").trim();
  const vision3_5_years = String(req.body?.vision3_5_years || "").trim();
  const biggestRisk = String(req.body?.biggestRisk || "").trim();
  const failureSignal = String(req.body?.failureSignal || "").trim();
  const hardestDecision = String(req.body?.hardestDecision || "").trim();
  const videoPitch = String(req.body?.videoPitch || "").trim();
  const projectWebsite = String(req.body?.projectWebsite || "").trim();
  const projectTg = String(req.body?.projectTg || "").trim();
  const founderOtherSocials = String(req.body?.founderOtherSocials || "").trim();
  const inn = String(req.body?.inn || "").trim();
  const whatElse = String(req.body?.whatElse || "").trim();
  const minBill = String(req.body?.minBill || "").trim();
  const pitchFileBase64 = String(req.body?.pitchFileBase64 || "").trim();
  const pitchFileName = String(req.body?.pitchFileName || "").trim();
  const finmodelFileBase64 = String(req.body?.finmodelFileBase64 || "").trim();
  const finmodelFileName = String(req.body?.finmodelFileName || "").trim();
  const pitchFilesPayload = parseProjectFilePayloads(req.body?.pitchFiles, pitchFileBase64, pitchFileName);
  const finmodelFilesPayload = parseProjectFilePayloads(req.body?.finmodelFiles, finmodelFileBase64, finmodelFileName);
  const tgUsername = String(user.username || "").trim().replace(/^@/, "");
  const tgLink = tgUsername ? `https://t.me/${tgUsername}` : `tg://user?id=${user.id}`;

  const isValidUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);
  if (videoPitch && !isValidUrl(videoPitch)) {
    res.status(400).json({ error: "Ссылка на видео-питч должна начинаться с http:// или https://." });
    return;
  }
  if (projectWebsite && !isValidUrl(projectWebsite)) {
    res.status(400).json({ error: "Сайт проекта должен начинаться с http:// или https://." });
    return;
  }
  if (projectTg && !isValidUrl(projectTg)) {
    res.status(400).json({ error: "Telegram проекта должен начинаться с http:// или https://." });
    return;
  }
  if (inn && !/^\d{10}(\d{2})?$/.test(inn.replace(/\s+/g, ""))) {
    res.status(400).json({ error: "ИНН должен содержать 10 или 12 цифр." });
    return;
  }

  try {
    const projectFields = await listTableFields(baserow, baserow.tableProjects);

    const uploadedPitch = pitchFilesPayload.length
      ? await uploadProjectFiles(pitchFilesPayload, PROJECT_PITCH_MAX_BYTES, "pitch-file")
      : [];
    const uploadedFinmodel = finmodelFilesPayload.length
      ? await uploadProjectFiles(finmodelFilesPayload, PROJECT_FINMODEL_MAX_BYTES, "finmodel-file")
      : [];

    const row: Record<string, unknown> = {};
    const putField = (fieldId: number, fallbackKey: string, value: unknown) => {
      if (!hasAnyValue(value)) return;
      const key = rowKeyForFieldId(projectFields, fieldId) || fallbackKey;
      row[key] = value;
    };
    putField(FIELD_PROJECT_TITLE, "Project_name", projectName);
    putField(FIELD_PROJECT_DESCRIPTION, "Description", description);
    putField(FIELD_PROJECT_STAGE, "Stage", stage);
    putField(FIELD_PROJECT_TIME_COMMITMENT, "Time_commitment", timeCommitment);
    putField(FIELD_PROJECT_COFOUNDERS, "Cofounders", cofounders);
    putField(FIELD_PROJECT_KEY_PERSONS, "Key_persons", keyPersons);
    putField(FIELD_PROJECT_PAST_FAILURES, "Past_failures", pastFailures);
    putField(FIELD_PROJECT_PERSONAL_INVESTMENT, "Personal_investment", personalInvestment);
    putField(FIELD_PROJECT_OTHER_PROJECTS, "Other_projects", otherProjects);
    putField(FIELD_PROJECT_CLIENT_REFERENCES, "Client_references", clientReferences);
    putField(FIELD_PROJECT_COMPETITORS_ADVANTAGE, "Competitors_advantage", competitorsAdvantage);
    putField(FIELD_PROJECT_FOUNDER_ABSENCE_PLAN, "Founder_absence_plan", founderAbsencePlan);
    putField(FIELD_PROJECT_UNIT_ECONOMICS, "Unit_economics", unitEconomics);
    putField(FIELD_PROJECT_LEGAL_STRUCTURE, "Legal_structure", legalStructure);
    putField(FIELD_PROJECT_ACTIVE_LITIGATION, "Active_litigation", activeLitigation);
    putField(FIELD_PROJECT_LICENSES, "Licenses", licenses);
    putField(FIELD_PROJECT_INVESTMENT_TYPE, "Investment_type", investmentType);
    putField(FIELD_PROJECT_FUNDING_ASK, "Funding_ask", fundingAsk);
    putField(FIELD_PROJECT_VALUATION, "Valuation", valuation);
    putField(FIELD_PROJECT_EXIT_PLAN, "Exit_plan", exitPlan);
    putField(FIELD_PROJECT_VISION_3_5_YEARS, "Vision_3_5_years", vision3_5_years);
    putField(FIELD_PROJECT_BIGGEST_RISK, "Biggest_risk", biggestRisk);
    putField(FIELD_PROJECT_FAILURE_SIGNAL, "Failure_signal", failureSignal);
    putField(FIELD_PROJECT_HARDEST_DECISION, "Hardest_decision", hardestDecision);
    putField(FIELD_PROJECT_TG_LINK, "TG_link", tgLink);
    putField(FIELD_PROJECT_TG_ID, "TG_ID", Number(user.id));
    putField(
      FIELD_PROJECT_PITCH_FILE,
      "Pitch_file",
      uploadedPitch.length ? uploadedPitch.map((f) => ({ name: f.name })) : undefined,
    );
    putField(
      FIELD_PROJECT_FINMODEL_FILE,
      "Finmodel_file",
      uploadedFinmodel.length ? uploadedFinmodel.map((f) => ({ name: f.name })) : undefined,
    );
    putField(FIELD_PROJECT_VIDEO_PITCH, "Video_pitch", videoPitch);
    putField(FIELD_PROJECT_WEBSITE, "Project_website", projectWebsite);
    putField(FIELD_PROJECT_TG, "Project_TG", projectTg);
    putField(FIELD_PROJECT_FOUNDER_OTHER_SOCIALS, "Founder_other_socials", founderOtherSocials);
    putField(FIELD_PROJECT_INN, "INN", inn.replace(/\s+/g, ""));
    putField(FIELD_PROJECT_WHAT_ELSE, "What_else", whatElse);
    putField(FIELD_PROJECT_MIN_BILL, "Min_bill", minBill);

    await createRow(baserow, baserow.tableProjects, row);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Не удалось отправить анкету проекта." });
  }
}));

app.post("/api/app/guest-profile/upsert", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(400).json({ error: "Сохранение доступно только при подключённой базе." });
    return;
  }

  const fullName = String(req.body?.fullName || "").trim();
  const city = String(req.body?.city || "").trim();
  const phone = normalizePhoneStrict(req.body?.phone);
  const email = normalizeEmailStrict(req.body?.email);
  const investExperience = String(req.body?.investExperience || "").trim();
  const occupation = String(req.body?.occupation || "").trim();
  const hobbies = String(req.body?.hobbies || "").trim();
  const useful = String(req.body?.useful || "").trim();
  const personalRequests = String(req.body?.personalRequests || "").trim();
  const invests = parseMultiInput(req.body?.invests);
  const wantsToInvest = parseMultiInput(req.body?.wantsToInvest);
  const telegramUsername = String(user.username || "").trim().replace(/^@/, "");

  if (!fullName) {
    res.status(400).json({ error: "Укажите ФИО." });
    return;
  }
  if (!phone) {
    res.status(400).json({ error: "Укажите корректный номер телефона." });
    return;
  }
  if (!email) {
    res.status(400).json({ error: "Укажите корректный e-mail." });
    return;
  }
  if (!investExperience) {
    res.status(400).json({ error: "Укажите опыт инвестиций." });
    return;
  }

  try {
    const residentFields = await listTableFields(baserow, baserow.tableResidents);
    const me = (await getResidentByTelegram(baserow, user.id)) || (await getResidentByUsername(baserow, user.username || ""));
    const meRow = (me || {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    const putField = (aliases: string[], value: unknown, fallbackKey: string) => {
      const k = rowKeyForFieldAliases(residentFields, aliases) || pickRowKey(meRow, aliases) || fallbackKey;
      patch[k] = value;
    };

    putField(["full_name", "fullname", "фио", "имя"], fullName, "full_name");
    putField(["city", "город"], city, "city");
    putField(PHONE_ALIASES, phone, "phone");
    putField(EMAIL_ALIASES, email, "email");
    putField(INVEST_EXPERIENCE_ALIASES, investExperience, "invest_experience");
    putField(
      ["occupation", "what_i_do", "activity", "чем я занимаюсь", "чем занимается", "деятельность"],
      occupation,
      "occupation",
    );
    putField(["hobbies", "hobby", "interests", "интересы", "увлечения", "чем я увлекаюсь"], hobbies, "hobbies");
    putField(["useful_for_club", "useful", "чем полезен", "чем я могу быть полезен"], useful, "useful_for_club");
    putField(
      ["personal_requests", "requests", "запросы", "какие запросы", "какие у меня запросы в клубе"],
      personalRequests,
      "personal_requests",
    );
    putField(["username", "telegram_username", "telegram_user", "tg_username"], telegramUsername, "username");
    putField(["telegram_id", "tg_id"], Number(user.id), "telegram_id");

    const investsField = getMultiSelectField(residentFields, ["invests_in", "invests"]);
    const wantsField = getMultiSelectField(residentFields, ["wants_to_invest", "wants_to_invest_in"]);
    if (investsField) patch[investsField.name] = mapValuesToSelectIds(invests, investsField.options);
    if (wantsField) patch[wantsField.name] = mapValuesToSelectIds(wantsToInvest, wantsField.options);

    const nameParts = splitFullName(fullName);
    if (me?.id) {
      await updateResidentFields(baserow, Number(me.id), patch);
      const rowWithPatch = { ...meRow, ...patch };
      let espoContactId =
        cellFromRow(rowWithPatch, residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id", "espo_contact"]) ||
        rowVal(me, "espo_contact_id");
      if (!espoContactId) {
        espoContactId = await resolveEspoContactDuplicateId(
          String(user.id),
          telegramUsername,
          nameParts.firstName,
          nameParts.lastName,
        );
      }
      await persistResidentEspoContactIdIfMissing(baserow, residentFields, Number(me.id), rowVal(me, "espo_contact_id"), espoContactId);
      void triggerProfileReverseSync({
        espoContactId,
        baserowRowId: Number(me.id),
        telegramId: user.id,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        city,
        occupation,
        interests: hobbies,
        personalRequests,
        useful,
        investsIn: invests,
        wantsToInvest,
        phone,
        email,
        investExperience,
      });
      res.json({ ok: true, mode: "updated" });
      return;
    }
    const created = (await createRow(baserow, baserow.tableResidents, patch)) as BaserowRow;
    const createdRowId = Number(created?.id);
    const createdRowObj = created as Record<string, unknown>;
    let espoContactId =
      cellFromRow(createdRowObj, residentFields, ["espo_contact_id", "espocrm_contact_id", "contact_id", "espo_contact"]) ||
      rowVal(created, "espo_contact_id");
    if (!espoContactId) {
      espoContactId = await resolveEspoContactDuplicateId(
        String(user.id),
        telegramUsername,
        nameParts.firstName,
        nameParts.lastName,
      );
    }
    await persistResidentEspoContactIdIfMissing(baserow, residentFields, createdRowId, rowVal(created, "espo_contact_id"), espoContactId);
    void triggerProfileReverseSync({
      espoContactId,
      baserowRowId: Number.isFinite(createdRowId) ? createdRowId : undefined,
      telegramId: user.id,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      city,
      occupation,
      interests: hobbies,
      personalRequests,
      useful,
      investsIn: invests,
      wantsToInvest,
      phone,
      email,
      investExperience,
    });
    res.json({ ok: true, mode: "created" });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Не удалось сохранить профиль." });
  }
}));

app.post("/api/app/profile/photo", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(400).json({ error: "Загрузка фото доступна только при подключённой базе." });
    return;
  }
  const parsed = parseImageDataUrl(String(req.body?.photoBase64 || ""));
  if (!parsed) {
    res.status(400).json({ error: "Некорректный формат фото." });
    return;
  }
  if (parsed.bytes.byteLength > 6 * 1024 * 1024) {
    res.status(413).json({ error: "Фото слишком большое (макс. 6MB)." });
    return;
  }
  const originalName = String(req.body?.photoName || "profile-photo").trim();
  const safeBaseName = originalName.replace(/[^\w.-]+/g, "_").replace(/^_+/, "").slice(0, 80) || "profile-photo";
  const ext = parsed.mimeType.split("/")[1] || "jpg";
  const fileName = /\.[a-zA-Z0-9]+$/.test(safeBaseName) ? safeBaseName : `${safeBaseName}.${ext}`;

  try {
    const me = (await getResidentByTelegram(baserow, user.id)) || (await getResidentByUsername(baserow, user.username || ""));
    if (!me?.id) {
      res.status(404).json({ error: "Профиль не найден в базе." });
      return;
    }
    const residentFields = await listTableFields(baserow, baserow.tableResidents);
    const meRow = me as Record<string, unknown>;
    const fileFieldKey =
      rowKeyForFieldAliases(
        residentFields,
        ["photo", "avatar", "image", "profile_photo", "фото", "аватар"],
        { typeMatches: (t) => t.includes("file") },
      ) || pickRowKey(meRow, ["photo", "avatar", "image", "profile_photo"]);
    if (!fileFieldKey) {
      res.status(400).json({ error: "В таблице резидентов не найдено поле фото." });
      return;
    }

    const uploaded = await uploadUserFile(baserow, fileName, parsed.bytes, parsed.mimeType);
    const investsField = getMultiSelectField(residentFields, ["invests_in", "invests"]);
    const wantsField = getMultiSelectField(residentFields, ["wants_to_invest", "wants_to_invest_in"]);
    const existingInvests = parseMultiInput(investsField?.name ? meRow[investsField.name] : meRow.invests_in ?? rowVal(me, "invests_in"));
    const existingWants = parseMultiInput(
      wantsField?.name ? meRow[wantsField.name] : meRow.wants_to_invest ?? rowVal(me, "wants_to_invest"),
    );
    const hasInvestments = (existingInvests.length || existingWants.length) > 0;
    const profileCompleteField =
      rowKeyForFieldId(residentFields, 7816) ||
      rowKeyForFieldAliases(residentFields, ["profile_complete", "profile complete", "профиль заполнен"]) ||
      "profile_complete";
    await updateResidentFields(baserow, Number(me.id), {
      [fileFieldKey]: [{ name: String(uploaded.name) }],
      [profileCompleteField]: hasInvestments,
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Ошибка загрузки фото." });
  }
}));

app.post("/api/app/events/register", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  const eventId = Number(req.body?.eventId);
  const action = String(req.body?.action || "register").trim().toLowerCase();
  if (action !== "register" && action !== "cancel") {
    res.status(400).json({ error: "action должен быть register или cancel." });
    return;
  }
  if (!Number.isFinite(eventId)) {
    res.status(400).json({ error: "eventId обязателен." });
    return;
  }

  if (baserow) {
    const events = await listUpcomingEvents(baserow);
    const ev = events.find((e) => Number(e.id) === eventId);
    if (!ev) {
      res.status(404).json({ error: "Событие не найдено." });
      return;
    }
    const status =
      action === "cancel"
        ? await cancelUserRegistrationForEvent(baserow, user.id, ev, user.username || "")
        : await registerUserForEvent(baserow, user.id, ev, user.username || "");
    const me = (await getResidentByTelegram(baserow, user.id)) || (await getResidentByUsername(baserow, user.username || ""));
    const needsGuestProfile = action === "register" && !me;
    res.json({ ok: true, status, needsGuestProfile });
    return;
  }

  const db = loadDb();
  const localEvent = db.events[eventId - 1];
  const status = localEvent
    ? action === "cancel"
      ? unregisterForEvent(localEvent.id, user.id)
      : registerForEvent(localEvent.id, user.id)
    : "missing";
  res.json({ ok: true, status });
}));

app.post("/api/app/meetings/action", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }
  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const user = authMiniappUser(initData);
  if (!user) {
    res.status(401).json({ error: "Неверная подпись Telegram или нет user." });
    return;
  }
  if (!baserow) {
    res.status(400).json({ error: "Раздел встреч доступен только при подключённой базе." });
    return;
  }
  const action = String(req.body?.action || "").trim().toLowerCase();
  const feedbackText = String(req.body?.feedback || "").trim();
  try {
    if (action === "join") {
      const before = await getMeetingsState(baserow, user.id);
      await joinMeetings(baserow, user.id);
      const after = await getMeetingsState(baserow, user.id);
      if (after.mode === "matched" && before.mode !== "matched") {
        const partnerId = Number(after.partner?.telegramId);
        if (Number.isFinite(partnerId)) {
          const text =
            "Ваш партнер для Умной Встречи на этой неделе найден.\n" +
            'Откройте приложение и зайдите в раздел "События" - Умные связи, чтобы увидеть своего партнера.';
          await tgCall<unknown>(TELEGRAM_BOT_TOKEN, "sendMessage", {
            chat_id: user.id,
            text,
          });
          await tgCall<unknown>(TELEGRAM_BOT_TOKEN, "sendMessage", {
            chat_id: partnerId,
            text,
          });
        }
      }
    } else if (action === "cancel_waiting") {
      await leaveWaitingMeetings(baserow, user.id);
    } else if (action === "partner_unreachable") {
      const partnerId = await markPartnerUnreachable(baserow, user.id);
      if (Number.isFinite(partnerId)) {
        await tgCall<unknown>(TELEGRAM_BOT_TOKEN, "sendMessage", {
          chat_id: Number(partnerId),
          text: "Ваш партнёр по Умным Встречам сообщил, что вы не вышли на связь. Матч аннулирован, поиск запущен заново.",
        });
      }
    } else if (action === "submit_feedback") {
      if (!feedbackText) {
        res.status(400).json({ error: "feedback обязателен." });
        return;
      }
      await submitMeetingFeedback(baserow, user.id, feedbackText);
    } else {
      res.status(400).json({ error: "Неизвестное действие." });
      return;
    }
    const state = await getMeetingsState(baserow, user.id);
    res.json({ ok: true, state });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Ошибка раздела встреч." });
  }
}));

app.post("/api/ingest", safeAsync(async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Сервер не настроен: нет TELEGRAM_BOT_TOKEN." });
    return;
  }

  const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  if (!initData || !text.trim()) {
    res.status(400).json({ error: "initData и text обязательны." });
    return;
  }

  if (!verifyTelegramInitData(initData, TELEGRAM_BOT_TOKEN)) {
    res.status(401).json({ error: "Неверная подпись Telegram." });
    return;
  }

  const user = parseUserFromInitData(initData);
  if (!user) {
    res.status(400).json({ error: "Нет user в initData." });
    return;
  }

  const safe = text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = `📩 <b>Мини-приложение</b>\n${safe}`;

  const sent = await tgCall<unknown>(TELEGRAM_BOT_TOKEN, "sendMessage", {
    chat_id: user.id,
    text: body,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });

  if (!sent.ok) {
    const code = "error_code" in sent ? sent.error_code : undefined;
    if (code === 403) {
      res.status(403).json({
        error: "Бот не может написать вам. Откройте чат с ботом и нажмите /start.",
      });
      return;
    }
    res.status(502).json({ error: sent.description || "Telegram API error" });
    return;
  }

  res.json({ ok: true });
}));

const dist = path.join(__dirname, "../dist");
app.use(
  express.static(dist, {
    setHeaders: (r) => {
      r.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      r.setHeader("Pragma", "no-cache");
      r.setHeader("Expires", "0");
    },
  }),
);
app.get("*", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.sendFile(path.join(dist, "index.html"));
});

// Глобальный Express error-handler — страховка для синхронных ошибок / next(err).
// Должен идти ПОСЛЕ всех маршрутов (по правилам Express 4).
app.use(((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("[express error-handler]:", msg);
  if (!res.headersSent) {
    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
}) as express.ErrorRequestHandler);

app.listen(PORT, () => {
  console.log(`gordost miniapp server http://127.0.0.1:${PORT}`);
  loadDb();
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN пуст — бот и /api/ingest не будут работать.");
    return;
  }
  startTelegramBot(TELEGRAM_BOT_TOKEN);
  console.log("Telegram long-polling bot started.");
});

// Предохранитель процесса: логируем необработанные ошибки, а не роняем сервер.
// Это гарантирует, что один «сбойный» запрос не прервёт работу мини-аппа
// и не оборвёт остальные запросы пользователей.
process.on("uncaughtException", (e) => {
  console.error("uncaughtException (процесс продолжает работу):", e instanceof Error ? e.message : String(e));
});
process.on("unhandledRejection", (e) => {
  console.error("unhandledRejection (процесс продолжает работу):", e instanceof Error ? e.message : String(e));
});

import { brFetch, createRow, listRows, patchRow, type BaserowRow } from "./baserow/client.js";
import type { BaserowRuntimeConfig } from "./baserow/config.js";
import { boolDb, getResidentByTelegram, rowVal } from "./baserow/service.js";

const MSK = "Europe/Moscow";
const FEEDBACK_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

const TABLE_POOL = 840;
const TABLE_HISTORY = 841;
const TABLE_SETTINGS = 843;
const TABLE_RESIDENTS = 597;

const FIELD_POOL_RESIDENT = 7792;
const FIELD_POOL_WEEK = 7793;
const FIELD_POOL_STATUS = 7794;
const FIELD_HISTORY_U1 = 7795;
const FIELD_HISTORY_U2 = 7796;
const FIELD_HISTORY_WEEK = 7844;
const FIELD_SETTING_KEY = 7801;

type MeetingMode = "idle" | "waiting" | "matched" | "feedback";

export type MeetingsPartner = {
  telegramId: number;
  row: BaserowRow | null;
};

export type MeetingsState = {
  mode: MeetingMode;
  introText: string;
  hasOffline: boolean;
  pendingFeedbackPrompt?: string;
  partner?: MeetingsPartner;
};

function mondayYmdMoscow(now = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: MSK, year: "numeric", month: "2-digit", day: "2-digit" });
  const parts = fmt.formatToParts(now);
  let y = Number(parts.find((p) => p.type === "year")?.value || 0);
  let m = Number(parts.find((p) => p.type === "month")?.value || 0);
  let d = Number(parts.find((p) => p.type === "day")?.value || 0);
  for (let i = 0; i < 7; i += 1) {
    const probe = new Date(`${String(y)}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T12:00:00+03:00`);
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: MSK, weekday: "short" }).format(probe);
    if (wd === "Mon") return `${String(y)}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const t = Date.UTC(y, m - 1, d - 1);
    const u = new Date(t);
    y = u.getUTCFullYear();
    m = u.getUTCMonth() + 1;
    d = u.getUTCDate();
  }
  return "";
}

function isPoolActive(r: BaserowRow): boolean {
  const st = String(r.Status || "").trim().toLowerCase();
  return st === "waiting" || st === "matched";
}

async function getPoolRow(cfg: BaserowRuntimeConfig, telegramId: number, weekYmd: string): Promise<BaserowRow | null> {
  const rows = await listRows(cfg, TABLE_POOL, {
    [`filter__field_${FIELD_POOL_RESIDENT}__equal`]: String(telegramId),
    [`filter__field_${FIELD_POOL_WEEK}__date_equal`]: String(weekYmd),
    filter_type: "AND",
    size: "50",
  });
  const active = rows.filter(isPoolActive).sort((a, b) => Number(b.id) - Number(a.id));
  return active[0] || null;
}

async function listWaitingRows(cfg: BaserowRuntimeConfig, weekYmd: string): Promise<BaserowRow[]> {
  return listRows(cfg, TABLE_POOL, {
    [`filter__field_${FIELD_POOL_WEEK}__date_equal`]: String(weekYmd),
    [`filter__field_${FIELD_POOL_STATUS}__equal`]: "waiting",
    filter_type: "AND",
    size: "200",
  });
}

function boolFromHistoryCell(v: unknown): boolean {
  if (v === true || v === 1 || v === "1" || v === "true") return true;
  if (v && typeof v === "object") return boolDb((v as Record<string, unknown>).value);
  return false;
}

function parseMatchedAtMs(v: unknown): number {
  if (v == null || v === "") return NaN;
  if (typeof v === "object" && v !== null && "value" in (v as Record<string, unknown>)) {
    return parseMatchedAtMs((v as Record<string, unknown>).value);
  }
  const t = new Date(typeof v === "string" || typeof v === "number" ? v : String(v)).getTime();
  return Number.isFinite(t) ? t : NaN;
}

function feedbackPlain(row: BaserowRow): string {
  const v = row.Feedback;
  if (v == null) return "";
  if (typeof v === "object" && v !== null && "value" in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>).value || "").trim();
  }
  return String(v).trim();
}

async function getIntroText(cfg: BaserowRuntimeConfig): Promise<string> {
  const rows = await listRows(cfg, TABLE_SETTINGS, {
    [`filter__field_${FIELD_SETTING_KEY}__equal`]: "smart_connections_intro",
    size: "1",
  });
  const notes = String((rows[0]?.Notes ?? rows[0]?.notes ?? "") || "").trim();
  return (
    notes ||
    "Это возможность для резидентов клуба встречаться с новыми людьми один на один. Нажмите «Хочу участвовать», чтобы мы подобрали вам партнера для встречи на этой неделе."
  );
}

function isResidentEligible(row: BaserowRow | null): boolean {
  if (!row) return false;
  return boolDb(row.profile_complete) && boolDb(row.is_member);
}

async function getPendingFeedbackRow(cfg: BaserowRuntimeConfig, telegramId: number): Promise<BaserowRow | null> {
  const rowsA = await listRows(cfg, TABLE_HISTORY, {
    [`filter__field_${FIELD_HISTORY_U1}__equal`]: String(telegramId),
    size: "200",
  });
  const rowsB = await listRows(cfg, TABLE_HISTORY, {
    [`filter__field_${FIELD_HISTORY_U2}__equal`]: String(telegramId),
    size: "200",
  });
  const now = Date.now();
  const all = [...rowsA, ...rowsB].filter((r) => {
    const t = parseMatchedAtMs(r.MatchedAt);
    if (!Number.isFinite(t) || t > now - FEEDBACK_DELAY_MS) return false;
    if (boolFromHistoryCell(r.MeetingConfirmed)) return false;
    if (feedbackPlain(r)) return false;
    return true;
  });
  all.sort((a, b) => Number(parseMatchedAtMs(b.MatchedAt)) - Number(parseMatchedAtMs(a.MatchedAt)));
  return all[0] || null;
}

async function loadBlockingSet(cfg: BaserowRuntimeConfig, selfId: number): Promise<Set<number>> {
  const rowsA = await listRows(cfg, TABLE_HISTORY, {
    [`filter__field_${FIELD_HISTORY_U1}__equal`]: String(selfId),
    size: "200",
  });
  const rowsB = await listRows(cfg, TABLE_HISTORY, {
    [`filter__field_${FIELD_HISTORY_U2}__equal`]: String(selfId),
    size: "200",
  });
  const blocked = new Set<number>();
  for (const h of [...rowsA, ...rowsB]) {
    const blockedPair = boolFromHistoryCell(h.MeetingConfirmed) || boolFromHistoryCell(h.NegativePair);
    if (!blockedPair) continue;
    const a = Number(h.User1ID);
    const b = Number(h.User2ID);
    const other = a === selfId ? b : a;
    if (Number.isFinite(other)) blocked.add(other);
  }
  return blocked;
}

async function deletePoolRow(cfg: BaserowRuntimeConfig, rowId: number): Promise<void> {
  await brFetch(cfg, "DELETE", `/api/database/rows/table/${TABLE_POOL}/${rowId}/`);
}

async function archiveOrDeletePool(cfg: BaserowRuntimeConfig, poolRow: BaserowRow | null): Promise<void> {
  if (!poolRow?.id) return;
  try {
    await patchRow(cfg, TABLE_POOL, Number(poolRow.id), {
      Status: "archived",
      MatchedWith: null,
      MatchActive: false,
    });
  } catch {
    await deletePoolRow(cfg, Number(poolRow.id));
  }
}

async function findOpenHistoryByPair(cfg: BaserowRuntimeConfig, aId: number, bId: number, weekYmd: string): Promise<BaserowRow | null> {
  const a = Math.min(aId, bId);
  const b = Math.max(aId, bId);
  const rows = await listRows(cfg, TABLE_HISTORY, {
    [`filter__field_${FIELD_HISTORY_WEEK}__date_equal`]: String(weekYmd),
    size: "200",
  });
  const candidates: BaserowRow[] = [];
  for (const h of rows) {
    const u1 = Number(h.User1ID);
    const u2 = Number(h.User2ID);
    if (u1 === a && u2 === b && !boolFromHistoryCell(h.MeetingConfirmed)) candidates.push(h);
  }
  candidates.sort((x, y) => Number(parseMatchedAtMs(y.MatchedAt)) - Number(parseMatchedAtMs(x.MatchedAt)));
  return candidates[0] || null;
}

function mergeFeedback(prev: string, authorName: string, text: string): string {
  const name = String(authorName || "").trim().replace(/\s+/g, " ").replace(/[[\]]/g, "");
  const piece = String(text || "").trim();
  if (!name || !piece) return prev.trim();
  const line = `[${name}] ${piece}`;
  if (!prev.trim()) return line;
  const prefix = `[${name}]`;
  const blocks = prev
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean)
    .filter((b) => !b.startsWith(prefix));
  return [...blocks, line].join("\n\n");
}

export async function getMeetingsState(cfg: BaserowRuntimeConfig, telegramId: number): Promise<MeetingsState> {
  const introText = await getIntroText(cfg);
  const me = await getResidentByTelegram(cfg, telegramId);
  if (!isResidentEligible(me)) {
    return { mode: "idle", introText, hasOffline: false };
  }

  const pending = await getPendingFeedbackRow(cfg, telegramId);
  if (pending) {
    const u1 = Number(pending.User1ID);
    const u2 = Number(pending.User2ID);
    const partnerId = u1 === telegramId ? u2 : u1;
    const partnerRow = Number.isFinite(partnerId) ? await getResidentByTelegram(cfg, partnerId) : null;
    const partnerName = String(partnerRow?.full_name || partnerRow?.first_name || "партнером").trim();
    return {
      mode: "feedback",
      introText,
      hasOffline: false,
      pendingFeedbackPrompt: `Расскажите, как прошла ваша встреча с ${partnerName}?`,
    };
  }

  const week = mondayYmdMoscow();
  const pool = await getPoolRow(cfg, telegramId, week);
  if (!pool) return { mode: "idle", introText, hasOffline: false };

  const st = String(pool.Status || "").toLowerCase();
  if (st === "waiting") return { mode: "waiting", introText, hasOffline: false };
  if (st === "matched" && boolDb(pool.MatchActive)) {
    const partnerId = Number(pool.MatchedWith);
    const partner = Number.isFinite(partnerId) ? await getResidentByTelegram(cfg, partnerId) : null;
    return {
      mode: "matched",
      introText,
      hasOffline: false,
      partner: { telegramId: partnerId, row: partner },
    };
  }
  return { mode: "idle", introText, hasOffline: false };
}

export async function joinMeetings(cfg: BaserowRuntimeConfig, telegramId: number): Promise<void> {
  const me = await getResidentByTelegram(cfg, telegramId);
  if (!isResidentEligible(me)) throw new Error("Раздел доступен только резидентам с заполненным профилем.");
  const week = mondayYmdMoscow();
  const existing = await getPoolRow(cfg, telegramId, week);
  const st = String(existing?.Status || "").toLowerCase();
  if (existing && (st === "waiting" || (st === "matched" && boolDb(existing.MatchActive)))) return;

  const blocked = await loadBlockingSet(cfg, telegramId);
  const waiting = await listWaitingRows(cfg, week);
  const candidates = waiting
    .map((r) => ({ row: r, id: Number(r.ResidentID) }))
    .filter((x) => Number.isFinite(x.id) && x.id !== telegramId && !blocked.has(x.id));

  let myPool = existing;
  if (!myPool) {
    myPool = (await createRow(cfg, TABLE_POOL, {
      ResidentID: telegramId,
      WeekStart: week,
      Status: "waiting",
      MatchActive: false,
    })) as BaserowRow;
  } else {
    await patchRow(cfg, TABLE_POOL, Number(myPool.id), { Status: "waiting", MatchedWith: null, MatchActive: false });
  }

  let chosen: { row: BaserowRow; id: number } | null = null;
  for (let i = 0; i < Math.min(candidates.length, 5); i += 1) {
    const c = candidates[i];
    const fresh = await getPoolRow(cfg, c.id, week);
    if (fresh && String(fresh.Status || "").toLowerCase() === "waiting") {
      chosen = { row: fresh, id: c.id };
      break;
    }
  }
  if (!chosen) return;

  const nowIso = new Date().toISOString();
  const a = Math.min(telegramId, chosen.id);
  const b = Math.max(telegramId, chosen.id);
  await createRow(cfg, TABLE_HISTORY, {
    User1ID: a,
    User2ID: b,
    MatchedAt: nowIso,
    WeekStart: week,
    NegativePair: false,
  });

  if (!myPool?.id) return;
  await patchRow(cfg, TABLE_POOL, Number(myPool.id), {
    Status: "matched",
    MatchedWith: chosen.id,
    MatchedAt: nowIso,
    MatchActive: true,
  });
  await patchRow(cfg, TABLE_POOL, Number(chosen.row.id), {
    Status: "matched",
    MatchedWith: telegramId,
    MatchedAt: nowIso,
    MatchActive: true,
  });
}

export async function leaveWaitingMeetings(cfg: BaserowRuntimeConfig, telegramId: number): Promise<void> {
  const week = mondayYmdMoscow();
  const pool = await getPoolRow(cfg, telegramId, week);
  if (!pool) return;
  if (String(pool.Status || "").toLowerCase() !== "waiting") return;
  await archiveOrDeletePool(cfg, pool);
}

export async function markPartnerUnreachable(cfg: BaserowRuntimeConfig, telegramId: number): Promise<number | null> {
  const week = mondayYmdMoscow();
  const myPool = await getPoolRow(cfg, telegramId, week);
  if (!myPool || String(myPool.Status || "").toLowerCase() !== "matched" || !boolDb(myPool.MatchActive)) return null;
  const partnerId = Number(myPool.MatchedWith);
  if (!Number.isFinite(partnerId)) return null;
  const partnerPool = await getPoolRow(cfg, partnerId, week);
  const hist = await findOpenHistoryByPair(cfg, telegramId, partnerId, week);
  if (hist?.id) {
    await patchRow(cfg, TABLE_HISTORY, Number(hist.id), {
      PartnerUnreachableBy: telegramId,
      NegativePair: true,
      MeetingConfirmed: false,
    });
  }
  await patchRow(cfg, TABLE_POOL, Number(myPool.id), { Status: "waiting", MatchedWith: null, MatchActive: false });
  if (partnerPool?.id) {
    await patchRow(cfg, TABLE_POOL, Number(partnerPool.id), { Status: "waiting", MatchedWith: null, MatchActive: false });
  }
  return partnerId;
}

export async function submitMeetingFeedback(cfg: BaserowRuntimeConfig, telegramId: number, feedbackText: string): Promise<void> {
  const text = String(feedbackText || "").trim();
  if (!text) throw new Error("Текст обратной связи пуст.");
  const pending = await getPendingFeedbackRow(cfg, telegramId);
  if (!pending?.id) return;
  const me = await getResidentByTelegram(cfg, telegramId);
  const name = String(rowVal(me || undefined, "full_name") || rowVal(me || undefined, "first_name") || `tg:${telegramId}`).trim();
  const merged = mergeFeedback(feedbackPlain(pending), name, text);
  await patchRow(cfg, TABLE_HISTORY, Number(pending.id), {
    MeetingConfirmed: true,
    Feedback: merged,
  });
}

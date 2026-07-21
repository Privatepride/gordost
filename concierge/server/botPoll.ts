import { handleUpdate, type PendingField, type TelegramUpdate } from "./botHandlers.js";
import { loadBaserowConfig } from "./baserow/config.js";
import { activeUserReg, listRegsForEvent, listUpcomingEvents, parseEventDateMs, rowVal } from "./baserow/service.js";
import { tgCall } from "./tgApi.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MSK = "Europe/Moscow";
const REMINDER_INTERVAL_MS = 15 * 60 * 1000;
const REMINDER_HOUR_MSK = 12;
const REMINDER_MINUTE_WINDOW = 20;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REMINDER_STATE_FILE = path.join(__dirname, "../data/reminders-sent.json");

function dayKeyMsk(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MSK,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value || "0000";
  const m = parts.find((p) => p.type === "month")?.value || "00";
  const d = parts.find((p) => p.type === "day")?.value || "00";
  return `${y}-${m}-${d}`;
}

function tomorrowKeyMsk(now = new Date()): string {
  const todayKey = dayKeyMsk(now);
  const start = new Date(`${todayKey}T00:00:00+03:00`).getTime();
  return dayKeyMsk(new Date(start + 24 * 60 * 60 * 1000));
}

function fmtDateMsk(ms: number): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: MSK,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(ms));
}

function fmtTimeMsk(ms: number): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: MSK,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mskHourMinute(now = new Date()): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MSK,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

function inReminderWindow(now = new Date()): boolean {
  const { hour, minute } = mskHourMinute(now);
  return hour === REMINDER_HOUR_MSK && minute >= 0 && minute < REMINDER_MINUTE_WINDOW;
}

function loadReminderState(): Set<string> {
  try {
    const raw = fs.readFileSync(REMINDER_STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as { keys?: unknown };
    if (!Array.isArray(parsed.keys)) return new Set();
    const keys = parsed.keys.map((k) => String(k || "").trim()).filter(Boolean);
    return new Set(keys);
  } catch {
    return new Set();
  }
}

function saveReminderState(keys: Set<string>): void {
  try {
    const dir = path.dirname(REMINDER_STATE_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REMINDER_STATE_FILE, JSON.stringify({ keys: Array.from(keys).sort() }), "utf8");
  } catch {
    // non-blocking
  }
}

export function startTelegramBot(botToken: string) {
  const pending = new Map<number, PendingField>();
  const sentReminders = loadReminderState();
  let offset = 0;
  let stopped = false;

  const ensurePollingMode = async () => {
    try {
      await tgCall(botToken, "deleteWebhook", { drop_pending_updates: false });
    } catch {
      // non-blocking; we'll retry on conflict
    }
  };

  const loop = async () => {
    await ensurePollingMode();
    while (!stopped) {
      try {
        const resp = await tgCall<TelegramUpdate[]>(botToken, "getUpdates", {
          offset,
          timeout: 45,
          allowed_updates: ["message", "callback_query"],
        });
        if (!resp.ok) {
          const description = "description" in resp ? String(resp.description || "") : "";
          console.warn("getUpdates:", description || resp);
          if (description.toLowerCase().includes("webhook is active")) {
            await ensurePollingMode();
          }
          await new Promise((r) => setTimeout(r, 2500));
          continue;
        }
        for (const u of resp.result) {
          offset = u.update_id + 1;
          try {
            await handleUpdate(botToken, u, pending);
          } catch {
            /* одно обновление не должно валить цикл */
          }
        }
      } catch {
        await new Promise((r) => setTimeout(r, 2500));
      }
    }
  };

  const remindersLoop = async () => {
    const br = loadBaserowConfig();
    if (!br) return;
    while (!stopped) {
      try {
        if (!inReminderWindow()) {
          await new Promise((r) => setTimeout(r, REMINDER_INTERVAL_MS));
          continue;
        }
        const tomorrow = tomorrowKeyMsk();
        // Keep only current reminder-day keys to avoid unbounded growth.
        for (const key of Array.from(sentReminders)) {
          if (!key.startsWith(`${tomorrow}:`)) sentReminders.delete(key);
        }
        const events = await listUpcomingEvents(br);
        const upcomingTomorrow = events.filter((ev) => {
          const ms = parseEventDateMs(ev);
          if (!Number.isFinite(ms)) return false;
          return dayKeyMsk(new Date(ms)) === tomorrow;
        });
        for (const ev of upcomingTomorrow) {
          const eventId = Number(ev.id);
          if (!Number.isFinite(eventId)) continue;
          const title = rowVal(ev, "Title") || rowVal(ev, "Name") || "Мероприятие";
          const description = rowVal(ev, "Description");
          const startsAt = parseEventDateMs(ev);
          if (!Number.isFinite(startsAt)) continue;
          const dateStr = fmtDateMsk(startsAt);
          const timeStr = fmtTimeMsk(startsAt);
          const regs = await listRegsForEvent(br, eventId);
          for (const reg of regs) {
            const active = activeUserReg(reg);
            if (!active) continue;
            const residentId = Number(String((reg as Record<string, unknown>).ResidentID ?? "").replace(/\D/g, ""));
            if (!Number.isFinite(residentId) || residentId <= 0) continue;
            const key = `${tomorrow}:${eventId}:${residentId}`;
            if (sentReminders.has(key)) continue;
            const text =
              `<b>Напоминание о мероприятии</b>\n\n` +
              `<b>Название:</b> ${escapeHtml(title)}\n` +
              `<b>Дата:</b> ${escapeHtml(dateStr)}\n` +
              `<b>Время:</b> ${escapeHtml(timeStr)}\n` +
              `<b>Описание:</b> ${escapeHtml(description || "—")}`;
            const result = await tgCall<unknown>(botToken, "sendMessage", {
              chat_id: residentId,
              text,
              parse_mode: "HTML",
              disable_web_page_preview: true,
            });
            if (result.ok) {
              sentReminders.add(key);
              saveReminderState(sentReminders);
            }
          }
        }
      } catch {
        // non-blocking
      }
      await new Promise((r) => setTimeout(r, REMINDER_INTERVAL_MS));
    }
  };

  void loop();
  void remindersLoop();

  return () => {
    stopped = true;
  };
}

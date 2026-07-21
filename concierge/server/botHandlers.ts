import { loadBaserowConfig } from "./baserow/config.js";
import { listTableFields } from "./baserow/client.js";
import {
  activeUserReg,
  bindResidentByInviteCode,
  findUserRegForEvent,
  formatMyProfileMessage,
  formatResidentCard,
  getResidentByTelegram,
  getResidentByUsername,
  listRegsForEvent,
  listResidentsForDirectory,
  listUpcomingEvents,
  occupiedSlots,
  parseEventDateMs,
  registerUserForEvent,
  residentEligible,
  rowVal,
  setResidentEspoContactIdIfEmpty,
  updateResidentFields,
} from "./baserow/service.js";
import { resolveEspoContactIdFallback } from "./espoApi.js";
import { consentFor, countRegistrations, isUserRegistered, loadDb, profileFor, registerForEvent, setConsent, setProfileField } from "./store.js";
import { tgCall } from "./tgApi.js";

export type PendingField = "displayName" | "phone" | "notes";

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    from?: { id: number; username?: string; first_name?: string; last_name?: string };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number };
    message?: { message_id: number; chat: { id: number } };
    data?: string;
  };
};

const br = loadBaserowConfig();
const firstStartHintSent = new Set<number>();
const PRIVACY_POLICY_URL = String(process.env.PRIVACY_POLICY_URL || "").trim();
const MARKETING_POLICY_URL = String(process.env.MARKETING_POLICY_URL || "").trim();

function normalizeMenuText(s: string) {
  return String(s || "")
    .replace(/\uFEFF/g, "")
    .replace(/\u00A0/g, " ")
    .trim()
    .toLowerCase();
}

function mainMenuKb() {
  return {
    inline_keyboard: [
      [{ text: "Профиль", callback_data: "pr" }],
      [{ text: "Резиденты", callback_data: "rs:0" }],
      [{ text: "Мероприятия", callback_data: "ev" }],
    ],
  };
}

function profileKb() {
  return {
    inline_keyboard: [
      [{ text: "Имя (как в профиле)", callback_data: "pn" }],
      [{ text: "Телефон / контакт", callback_data: "pp" }],
      [{ text: "Текущий запрос консьержу", callback_data: "pt" }],
      [{ text: "« В меню", callback_data: "m" }],
    ],
  };
}

function consentKb(userId: number) {
  const c = consentFor(userId);
  return {
    inline_keyboard: [
      [{ text: `${c.privacyConsent ? "✅" : "☐"} Политика конфиденциальности`, callback_data: "consent:privacy" }],
      [{ text: `${c.marketingConsent ? "✅" : "☐"} Маркетинговые рассылки`, callback_data: "consent:marketing" }],
      [{ text: "Продолжить", callback_data: "consent:confirm" }],
    ],
  };
}

function consentText(): string {
  const privacyLink = PRIVACY_POLICY_URL
    ? `\n• <a href="${PRIVACY_POLICY_URL}">Политика конфиденциальности</a>`
    : "";
  const marketingLink = MARKETING_POLICY_URL
    ? `\n• <a href="${MARKETING_POLICY_URL}">Условия маркетинговых рассылок</a>`
    : "";
  return (
    "<b>Подтвердите согласия</b>\n\n" +
    "Перед использованием бота и мини-приложения подтвердите:\n" +
    "• согласие с политикой конфиденциальности;\n" +
    "• согласие на маркетинговые рассылки.\n" +
    privacyLink +
    marketingLink
  );
}

function hasAllConsents(userId: number): boolean {
  const c = consentFor(userId);
  return c.privacyConsent && c.marketingConsent;
}

async function syncConsentsToBaserow(userId: number, username: string) {
  if (!br) return;
  const me = (await getResidentByTelegram(br, userId)) || (await getResidentByUsername(br, username || ""));
  if (!me?.id) return;
  const fields = await listTableFields(br, br.tableResidents);
  const privacyField =
    fields.find((f) => Number(f.id) === 7814) ||
    fields.find((f) => String(f.name || "").trim().toLowerCase() === "consent_given");
  const marketingField = fields.find((f) => {
    const n = String(f.name || "").trim().toLowerCase();
    return ["marketing_consent", "marketing consent", "consent_marketing", "рассылки", "согласие на рассылки"].includes(n);
  });
  const patch: Record<string, unknown> = {};
  if (privacyField?.name) patch[String(privacyField.name)] = true;
  if (marketingField?.name) patch[String(marketingField.name)] = true;
  if (!Object.keys(patch).length) return;
  await updateResidentFields(br, Number(me.id), patch);
}

function fmtWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Moscow",
    });
  } catch {
    return iso;
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function send(botToken: string, chatId: number, text: string, replyMarkup?: unknown) {
  await tgCall(botToken, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: replyMarkup,
  });
}

async function edit(botToken: string, chatId: number, messageId: number, text: string, replyMarkup?: unknown) {
  await tgCall(botToken, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: replyMarkup,
  });
}

async function answerCb(botToken: string, id: string, text?: string) {
  await tgCall(botToken, "answerCallbackQuery", { callback_query_id: id, text: text?.slice(0, 200), show_alert: false });
}

async function stripReplyKeyboard(botToken: string, chatId: number) {
  await tgCall(botToken, "sendMessage", {
    chat_id: chatId,
    text: " ",
    reply_markup: { remove_keyboard: true },
  });
}

/** Локальный профиль (без подключённой базы) */
function localProfileText(userId: number): string {
  const p = profileFor(userId);
  const lines = [
    "<b>Профиль (локально)</b>",
    "",
    p.displayName ? `Имя: ${escapeHtml(p.displayName)}` : "Имя: <i>не указано</i>",
    p.phone ? `Телефон: ${escapeHtml(p.phone)}` : "Телефон: <i>не указан</i>",
    p.notes ? `Заметки: ${escapeHtml(p.notes)}` : "Заметки: <i>нет</i>",
    "",
    `<i>Обновлено: ${p.updatedAt ? fmtWhen(p.updatedAt) : "ещё не сохранялось"}</i>`,
  ];
  return lines.join("\n");
}

function localResidentsPage(page: number) {
  const db = loadDb();
  const all = db.residents;
  const start = page * 6;
  const slice = all.slice(start, start + 6);
  const rows: { text: string; callback_data: string }[][] = [];
  if (slice.length === 0) {
    rows.push([{ text: "« В меню", callback_data: "m" }]);
    return { text: "<b>Резиденты</b>\n\nСписок пуст.", keyboard: { inline_keyboard: rows } };
  }
  const lines = slice.map((r, i) => {
    const n = start + i + 1;
    const u = r.unit ? ` · ${escapeHtml(r.unit)}` : "";
    const note = r.note ? `\n   <i>${escapeHtml(r.note)}</i>` : "";
    return `${n}. <b>${escapeHtml(r.name)}</b>${u}${note}`;
  });
  const nav: { text: string; callback_data: string }[] = [];
  if (page > 0) nav.push({ text: "« Пред.", callback_data: `rs:${page - 1}` });
  if (start + 6 < all.length) nav.push({ text: "Далее »", callback_data: `rs:${page + 1}` });
  if (nav.length) rows.push(nav);
  rows.push([{ text: "« В меню", callback_data: "m" }]);
  return { text: `<b>Резиденты</b> (${all.length})\n\n${lines.join("\n\n")}`, keyboard: { inline_keyboard: rows } };
}

function localEventsKb(userId: number) {
  const db = loadDb();
  const now = Date.now();
  const upcoming = db.events.filter((e) => new Date(e.startsAt).getTime() >= now - 60_000).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const rows: { text: string; callback_data: string }[][] = [];
  if (upcoming.length === 0) {
    return {
      text: "<b>Мероприятия</b>\n\nБлижайших событий нет.",
      keyboard: { inline_keyboard: [[{ text: "« В меню", callback_data: "m" }]] },
    };
  }
  const lines: string[] = [];
  for (const e of upcoming) {
    const taken = countRegistrations(e.id);
    const reg = isUserRegistered(e.id, userId);
    lines.push(
      `<b>${escapeHtml(e.title)}</b>\n${fmtWhen(e.startsAt)}\n${escapeHtml(e.description)}\nМест: ${taken}/${e.capacity}${reg ? " · <i>вы записаны</i>" : ""}`,
    );
    if (!reg && taken < e.capacity) {
      rows.push([{ text: `Записаться · ${e.title.slice(0, 18)}`, callback_data: `rg:${e.id}` }]);
    }
  }
  rows.push([{ text: "« В меню", callback_data: "m" }]);
  return { text: `<b>Мероприятия</b>\n\n${lines.join("\n\n—\n\n")}`, keyboard: { inline_keyboard: rows } };
}

async function showBaserowProfile(botToken: string, chatId: number, uid: number, editMsgId?: number) {
  if (!br) return;
  const row = await getResidentByTelegram(br, uid);
  if (!row) {
    const t =
      "<b>Профиль не найден</b>\n\nВ базе нет строки резидента с вашим Telegram ID. Пройдите регистрацию по приглашению или напишите менеджеру.";
    if (editMsgId != null) await edit(botToken, chatId, editMsgId, t, mainMenuKb());
    else await send(botToken, chatId, t, mainMenuKb());
    return;
  }
  if (!residentEligible(row)) {
    const t =
      "<b>Профиль не готов</b>\n\nНужны заполненный профиль и активное членство в базе. Завершите регистрацию в боте или обратитесь к менеджеру.";
    if (editMsgId != null) await edit(botToken, chatId, editMsgId, t, mainMenuKb());
    else await send(botToken, chatId, t, mainMenuKb());
    return;
  }
  const body = "<b>Ваш профиль</b>\n\n" + formatMyProfileMessage(row);
  if (editMsgId != null) await edit(botToken, chatId, editMsgId, body, profileKb());
  else await send(botToken, chatId, body, profileKb());
}

async function showBaserowResidents(
  botToken: string,
  chatId: number,
  uid: number,
  page: number,
  editMsgId?: number,
) {
  if (!br) return;
  const me = await getResidentByTelegram(br, uid);
  if (!residentEligible(me)) {
    const t = "Раздел «Резиденты» доступен при заполненном профиле и активном членстве.";
    if (editMsgId != null) await edit(botToken, chatId, editMsgId, t, mainMenuKb());
    else await send(botToken, chatId, t, mainMenuKb());
    return;
  }
  const list = await listResidentsForDirectory(br, uid);
  if (!list.length) {
    const t = "<b>Резиденты</b>\n\nПока нет других резидентов с заполненным профилем.";
    if (editMsgId != null) await edit(botToken, chatId, editMsgId, t, mainMenuKb());
    else await send(botToken, chatId, t, mainMenuKb());
    return;
  }
  const idx = Math.min(Math.max(0, page), list.length - 1);
  const r = list[idx];
  const head = `<i>${idx + 1} / ${list.length}</i>\n\n`;
  const body = head + formatResidentCard(r);
  const nav: { text: string; callback_data: string }[] = [];
  if (idx > 0) nav.push({ text: "«", callback_data: `rs:${idx - 1}` });
  if (idx < list.length - 1) nav.push({ text: "»", callback_data: `rs:${idx + 1}` });
  const rows: { text: string; callback_data: string }[][] = [];
  if (nav.length) rows.push(nav);
  rows.push([{ text: "« В меню", callback_data: "m" }]);
  const kb = { inline_keyboard: rows };
  if (editMsgId != null) await edit(botToken, chatId, editMsgId, body, kb);
  else await send(botToken, chatId, body, kb);
}

async function showBaserowEvents(botToken: string, chatId: number, uid: number, editMsgId?: number) {
  if (!br) return;
  const me = await getResidentByTelegram(br, uid);
  if (!residentEligible(me)) {
    const t = "Раздел «Мероприятия» доступен при заполненном профиле и активном членстве.";
    if (editMsgId != null) await edit(botToken, chatId, editMsgId, t, mainMenuKb());
    else await send(botToken, chatId, t, mainMenuKb());
    return;
  }
  const events = await listUpcomingEvents(br);
  if (!events.length) {
    const t = "<b>Мероприятия</b>\n\nБлижайших событий в базе нет.";
    if (editMsgId != null) await edit(botToken, chatId, editMsgId, t, mainMenuKb());
    else await send(botToken, chatId, t, mainMenuKb());
    return;
  }
  const lines: string[] = [];
  const rows: { text: string; callback_data: string }[][] = [];
  for (const ev of events) {
    const id = Number(ev.id);
    const title = rowVal(ev, "Title") || rowVal(ev, "Name") || "Событие";
    const desc = rowVal(ev, "Description");
    const ms = parseEventDateMs(ev);
    const when = Number.isFinite(ms) ? fmtWhen(new Date(ms).toISOString()) : "—";
    const regs = await listRegsForEvent(br, id);
    const taken = occupiedSlots(regs);
    const maxRaw = rowVal(ev, "MaxParticipants");
    const max = Math.max(0, Number.parseInt(maxRaw, 10) || 0) || 0;
    const capLine = max > 0 ? `Мест: ${taken}/${max}` : `Записей: ${taken}`;
    const ex = findUserRegForEvent(regs, uid, id);
    const active = activeUserReg(ex);
    lines.push(
      `<b>${escapeHtml(title)}</b>\n${when}\n${desc ? escapeHtml(desc) : ""}\n${capLine}${active ? " · <i>вы в списке</i>" : ""}`,
    );
    if (!active) {
      rows.push([{ text: `Записаться · ${title.slice(0, 16)}`, callback_data: `rg:${id}` }]);
    }
  }
  rows.push([{ text: "« В меню", callback_data: "m" }]);
  const text = `<b>Мероприятия</b>\n\n${lines.join("\n\n—\n\n")}`;
  const kb = { inline_keyboard: rows };
  if (editMsgId != null) await edit(botToken, chatId, editMsgId, text, kb);
  else await send(botToken, chatId, text, kb);
}

async function sendWelcomeMessage(botToken: string, chatId: number) {
  const welcome =
    "<b>Добро пожаловать!</b>\n\n" +
    "Теперь вы можете пользоваться полным функционалом нашей платформы.\n\n" +
    "В случае любых вопросов обращайтесь к @gordost_community";
  await send(botToken, chatId, welcome);
}

function menuTextToAction(text: string): "menu" | "profile" | "residents" | "events" | null {
  const n = normalizeMenuText(text);
  if (["меню", "menu", "start", "/menu"].includes(n)) return "menu";
  if (["мой профиль", "профиль", "профиль резидента", "анкета"].includes(n)) return "profile";
  if (["резиденты", "каталог резидентов", "участники"].includes(n)) return "residents";
  if (["мероприятия", "события", "календарь", "афиша"].includes(n)) return "events";
  return null;
}

export async function handleUpdate(botToken: string, u: TelegramUpdate, pending: Map<number, PendingField>) {
  const sectionHint = (section: "menu" | "profile" | "residents" | "events") => {
    if (section === "profile") return "Откройте мини-приложение и перейдите в раздел «Профиль».\n\nИзменения через текстового бота отключены.";
    if (section === "residents") return "Откройте мини-приложение и перейдите в раздел «Резиденты».";
    if (section === "events") return "Откройте мини-приложение и перейдите в раздел «События».";
    return "Откройте мини-приложение через кнопку «Приложение» в боте и выберите нужный раздел.";
  };

  const cq = u.callback_query;
  if (cq?.data && cq.from && cq.message) {
    const chatId = cq.message.chat.id;
    const msgId = cq.message.message_id;
    const data = cq.data;
    if (data === "consent:privacy" || data === "consent:marketing" || data === "consent:confirm") {
      if (data === "consent:privacy") {
        setConsent(cq.from.id, "privacyConsent", true);
        await answerCb(botToken, cq.id, "Согласие с политикой сохранено");
        await edit(botToken, chatId, msgId, consentText(), consentKb(cq.from.id));
        return;
      }
      if (data === "consent:marketing") {
        setConsent(cq.from.id, "marketingConsent", true);
        await answerCb(botToken, cq.id, "Согласие на рассылки сохранено");
        await edit(botToken, chatId, msgId, consentText(), consentKb(cq.from.id));
        return;
      }
      if (!hasAllConsents(cq.from.id)) {
        await answerCb(botToken, cq.id, "Нужно подтвердить оба согласия");
        await edit(botToken, chatId, msgId, consentText(), consentKb(cq.from.id));
        return;
      }
      try {
        await syncConsentsToBaserow(cq.from.id, "");
      } catch {
        // consent sync failure must not block access
      }
      await answerCb(botToken, cq.id, "Спасибо! Доступ открыт");
      await edit(botToken, chatId, msgId, "Согласия подтверждены ✅");
      await sendWelcomeMessage(botToken, chatId);
      return;
    }
    if (!hasAllConsents(cq.from.id)) {
      await answerCb(botToken, cq.id, "Сначала подтвердите согласия");
      await edit(botToken, chatId, msgId, consentText(), consentKb(cq.from.id));
      return;
    }
    const section: "menu" | "profile" | "residents" | "events" =
      data === "pr" || data === "pn" || data === "pp" || data === "pt"
        ? "profile"
        : data.startsWith("rs:")
          ? "residents"
          : data === "ev" || data.startsWith("rg:")
            ? "events"
            : "menu";
    pending.delete(cq.from.id);
    await answerCb(botToken, cq.id, "Откройте мини-приложение");
    try {
      await edit(botToken, chatId, msgId, sectionHint(section));
    } catch {
      // Old callback message might be stale; ignore.
    }
    return;
  }

  const msg = u.message;
  if (!msg?.chat?.id || msg.chat.type !== "private") return;
  const chatId = msg.chat.id;
  const from = msg.from;
  if (!from) return;
  const text = (msg.text || "").trim();

  if (text === "/cancel") {
    pending.delete(from.id);
    await send(botToken, chatId, "Ок, отменено.\n\nВсе изменения доступны только в мини-приложении.");
    return;
  }

  const pend = pending.get(from.id);
  if (pend && text && !text.startsWith("/")) {
    pending.delete(from.id);
    await send(botToken, chatId, sectionHint("profile"));
    return;
  }

  if (text === "/menu" || text.startsWith("/start")) {
    pending.delete(from.id);
    await stripReplyKeyboard(botToken, chatId);
    const rest = text.startsWith("/start") ? text.slice(6).trim() : "";
    if (br && rest && !rest.startsWith("nav_")) {
      try {
        const bindResult = await bindResidentByInviteCode(br, from.id, from.username || "", rest);
        if (bindResult === "bound") {
          try {
            const me = await getResidentByTelegram(br, from.id);
            if (me?.id) {
              // Never auto-create Espo contact from Telegram profile fields here.
              // Only attach an existing contact id resolved by Baserow profile data.
              const espoId = await resolveEspoContactIdFallback(
                String(from.id),
                rowVal(me, "username"),
                rowVal(me, "first_name"),
                rowVal(me, "last_name"),
              );
              if (espoId) await setResidentEspoContactIdIfEmpty(br, Number(me.id), espoId);
            }
          } catch {
            // Espo link must not block /start
          }
        }
      } catch {
        // invite bind should not block start flow
      }
    }
    if (text.startsWith("/start") && !firstStartHintSent.has(from.id)) {
      firstStartHintSent.add(from.id);
      await send(botToken, chatId, 'Нажмите кнопку "Приложение", чтобы пользоваться клубом.');
    }
    if (!hasAllConsents(from.id)) {
      await send(botToken, chatId, consentText(), consentKb(from.id));
      return;
    }
    try {
      await syncConsentsToBaserow(from.id, from.username || "");
    } catch {
      // consent sync failure must not block start flow
    }
    if (rest.startsWith("nav_")) {
      const key = rest.replace(/^nav_/, "");
      if (key === "prof") {
        await send(botToken, chatId, sectionHint("profile"));
        return;
      }
      if (key === "res") {
        await send(botToken, chatId, sectionHint("residents"));
        return;
      }
      if (key === "ev") {
        await send(botToken, chatId, sectionHint("events"));
        return;
      }
      if (key === "menu") {
        await send(botToken, chatId, sectionHint("menu"));
        return;
      }
    }
    await sendWelcomeMessage(botToken, chatId);
    return;
  }

  if (text.startsWith("/")) return;

  if (!hasAllConsents(from.id)) {
    await send(botToken, chatId, consentText(), consentKb(from.id));
    return;
  }

  const route = menuTextToAction(text);
  if (route) {
    pending.delete(from.id);
    if (route === "menu") {
      await send(botToken, chatId, sectionHint("menu"));
      return;
    }
    if (route === "profile") {
      await send(botToken, chatId, sectionHint("profile"));
      return;
    }
    if (route === "residents") {
      await send(botToken, chatId, sectionHint("residents"));
      return;
    }
    if (route === "events") {
      await send(botToken, chatId, sectionHint("events"));
      return;
    }
  }

  await send(botToken, chatId, "Все действия доступны в мини-приложении. Откройте «Приложение» и выберите нужный раздел.");
}

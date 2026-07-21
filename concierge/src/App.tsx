import { useCallback, useEffect, useMemo, useRef, useState, type TextareaHTMLAttributes } from "react";
import { CityAutocomplete } from "./CityAutocomplete";

import { NonResidentLanding } from "./NonResidentLanding";
import { ConsentScreen } from "./ConsentScreen";
import { prepareProfilePhotoForUpload } from "./profilePhoto";

type Section = "profile" | "residents" | "events" | "meetings" | "useful";

type ProfileDto = {
  exists: boolean;
  fullName: string;
  city: string;
  birthDate: string;
  capital: string;
  monthlyIncome: string;
  telegramUsername: string;
  /** Цифры Telegram user id, если в базе нет @username */
  telegramId: string;
  personalRequests: string;
  photoUrl: string;
  role: string;
  occupation: string;
  hobbies: string;
  useful: string;
  invests: string[];
  wantsToInvest: string[];
};

type ResidentDto = {
  id: number;
  name: string;
  city: string;
  birthDate: string;
  capital: string;
  monthlyIncome: string;
  telegramUsername: string;
  telegramId: string;
  occupation: string;
  hobbies: string;
  useful: string;
  role: string;
  requests: string;
  photoUrl: string;
  invests: string[];
  wantsToInvest: string[];
};

type EventDto = {
  id: number;
  title: string;
  description: string;
  location: string;
  link: string;
  imageUrl: string;
  startsAt: number;
  occupied: number;
  capacity: number | null;
  myStatus: string;
};

type BroadcastSummaryDto = {
  id: number;
  title: string;
  fileUrl: string;
  text: string;
};

type Bootstrap = {
  ok: true;
  accessDenied: boolean;
  needsConsent?: boolean;
  residentId?: number;
  consentLinks?: { marketing: string; privacy: string; personalData: string };
  accessMessage: string;
  communityTelegram: string;
  profile: ProfileDto;
  investmentOptions: {
    invests: string[];
    wantsToInvest: string[];
  };
  residents: ResidentDto[];
  events: EventDto[];
  meetings: MeetingsDto;
  broadcastSummaries: BroadcastSummaryDto[];
};

type MeetingsDto = {
  mode: "idle" | "waiting" | "matched" | "feedback";
  introTitle: string;
  introText: string;
  offlineEnabled: boolean;
  partner: ResidentDto | null;
  feedbackPrompt: string;
};

type IconProps = { active?: boolean };

function IconProfile({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.6" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
      <path d="M5.5 18.4c1.7-2.5 4-3.7 6.5-3.7s4.8 1.2 6.5 3.7" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
    </svg>
  );
}

function IconResidents({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="2.8" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
      <circle cx="16.5" cy="8.5" r="2.2" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
      <path d="M3.8 18.4c1.4-2.2 3.1-3.2 5.2-3.2 2.1 0 3.8 1 5.2 3.2" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
      <path d="M14 18.2c1-1.5 2.1-2.2 3.6-2.2 1 0 2 .3 2.8 1.1" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
    </svg>
  );
}

function IconEvents({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4.2" y="5.4" width="15.6" height="14.4" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
      <path d="M4.2 9.2h15.6" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
      <path d="M8 3.7v3.4M16 3.7v3.4" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.5" />
    </svg>
  );
}

function IconUseful({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5.5 6.5h13M5.5 12h13M5.5 17.5h13" stroke={active ? "#d8be8b" : "#8f9aa8"} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="6.5" r="1.6" fill={active ? "#d8be8b" : "#8f9aa8"} />
      <circle cx="12" cy="12" r="1.6" fill={active ? "#d8be8b" : "#8f9aa8"} />
      <circle cx="16" cy="17.5" r="1.6" fill={active ? "#d8be8b" : "#8f9aa8"} />
    </svg>
  );
}

function TelegramGoldIcon({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <img src="/useful/telegram.png" alt="" aria-hidden className={`telegram-icon-img ${className}`.trim()} style={{ width: size, height: size }} />
  );
}

const TABS: { key: Section; label: string; Icon: (p: IconProps) => JSX.Element }[] = [
  { key: "profile", label: "Профиль", Icon: IconProfile },
  { key: "residents", label: "Резиденты", Icon: IconResidents },
  { key: "events", label: "События", Icon: IconEvents },
  { key: "useful", label: "Полезное", Icon: IconUseful },
];

function fmtDate(ms: number): string {
  if (!Number.isFinite(ms)) return "Дата уточняется";
  return new Date(ms).toLocaleString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDayKey(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthLabelFromMs(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  return new Date(ms).toLocaleString("ru-RU", { month: "long", year: "numeric" });
}

function initials(name: string): string {
  const chunks = name.trim().split(/\s+/).filter(Boolean);
  if (!chunks.length) return "GD";
  return chunks
    .slice(0, 2)
    .map((c) => c[0]?.toUpperCase() || "")
    .join("");
}

function dateToUi(raw: string): string {
  const v = String(raw || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  return v;
}

function dateToApi(raw: string): string {
  const v = String(raw || "").trim();
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(v);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return v;
}

function moneyToUi(raw: string): string {
  const v = String(raw || "").replace(/\s+/g, "").trim();
  if (!v) return "";
  if (!/^-?\d+([.,]\d+)?$/.test(v)) return raw;
  const sign = v.startsWith("-") ? "-" : "";
  const core = sign ? v.slice(1) : v;
  const [intPart, fracPart] = core.split(/[.,]/);
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return sign + (fracPart != null ? `${grouped},${fracPart}` : grouped);
}

function moneyToApi(raw: string): string {
  return String(raw || "").replace(/\s+/g, "").replace(",", ".").trim();
}

function normalizeStringArray(v: unknown): string[] {
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
  const text = String(v || "").trim();
  if (!text) return [];
  return text
    .split(/\r?\n|,\s*/)
    .map((x) => x.trim().replace(/^[•\-\*\u2022]\s*/, ""))
    .filter(Boolean);
}

function normalizeProfileForUi(p: ProfileDto): ProfileDto {
  return {
    ...p,
    birthDate: dateToUi(p.birthDate),
    capital: moneyToUi(p.capital),
    monthlyIncome: moneyToUi(p.monthlyIncome),
    invests: normalizeStringArray(p.invests),
    wantsToInvest: normalizeStringArray(p.wantsToInvest),
  };
}

function residentToUi(r: ResidentDto): ResidentDto {
  return {
    ...r,
    telegramUsername: String(r.telegramUsername || ""),
    telegramId: String(r.telegramId || ""),
    invests: normalizeStringArray(r.invests),
    wantsToInvest: normalizeStringArray(r.wantsToInvest),
    birthDate: dateToUi(r.birthDate),
    capital: moneyToUi(r.capital),
    monthlyIncome: moneyToUi(r.monthlyIncome),
  };
}

type TgWebAppLite = {
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
};

function openTelegramContact(tg: TgWebAppLite | undefined, usernameRaw: string, telegramIdRaw: string): void {
  const raw = String(usernameRaw || "").trim();
  const directUrl =
    /^https?:\/\//i.test(raw) ? raw : /^t\.me\//i.test(raw) ? `https://${raw}` : raw.startsWith("t.me/") ? `https://${raw}` : "";
  if (directUrl) {
    try {
      if (typeof tg?.openTelegramLink === "function") {
        tg.openTelegramLink(directUrl);
        return;
      }
    } catch {
      /* fallback */
    }
    try {
      tg?.openLink?.(directUrl);
      return;
    } catch {
      /* */
    }
    window.open(directUrl, "_blank");
    return;
  }
  const username = raw.replace(/^@/, "").trim();
  const tid = String(telegramIdRaw || "").replace(/\D/g, "");
  let url: string | null = null;
  if (username && !/^\d+$/.test(username)) {
    url = `https://t.me/${encodeURIComponent(username)}`;
  } else if (tid) {
    url = `tg://user?id=${tid}`;
  } else if (username && /^\d+$/.test(username)) {
    url = `tg://user?id=${username}`;
  }
  if (!url) return;
  try {
    if (typeof tg?.openTelegramLink === "function") {
      tg.openTelegramLink(url);
      return;
    }
  } catch {
    /* fallback */
  }
  try {
    tg?.openLink?.(url);
    return;
  } catch {
    /* */
  }
  window.open(url, "_blank");
}

function AutoGrowTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { value, onInput, className, ...rest } = props;
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [resize, value]);

  return (
    <textarea
      {...rest}
      ref={ref}
      value={value}
      className={className}
      onInput={(e) => {
        resize();
        onInput?.(e);
      }}
    />
  );
}

function ResidentProfileView({
  resident,
  tab,
  onTab,
  tg,
}: {
  resident: ResidentDto;
  tab: "money" | "person";
  onTab: (t: "money" | "person") => void;
  tg?: TgWebAppLite;
}) {
  const telegramUsername = String(resident.telegramUsername || "");
  const telegramId = String(resident.telegramId || "");
  const canOpenTg = Boolean(
    telegramUsername.replace(/^@/, "").trim() || telegramId.replace(/\D/g, ""),
  );
  const openTg = () => openTelegramContact(tg, telegramUsername, telegramId);

  return (
    <div className="profile-card ref-profile viewer-resident-inner">
      <div className="ref-topbar">
        <span>Резидент</span>
      </div>

      <div className="ref-main">
        <div className="ref-avatar-box">
          {resident.photoUrl ? <img src={resident.photoUrl} alt={resident.name} className="ref-avatar" /> : <div className="item-fallback profile-fallback ref-avatar">{initials(resident.name)}</div>}
        </div>

        <div className="ref-identity">
          <div className="profile-row-top">
            <input readOnly className="field-input profile-name-input profile-field-readonly" value={resident.name} />
            <button
              type="button"
              className="tg-inline-btn"
              disabled={!canOpenTg}
              onClick={openTg}
              aria-label="Открыть Telegram профиль"
              title="Открыть Telegram профиль"
            >
              <TelegramGoldIcon />
            </button>
          </div>
          <div className="profile-row-grid">
            <div className="profile-mini-field">
              <label className="profile-compact-label">Город</label>
              <input readOnly className="field-input profile-mini-input profile-field-readonly" value={resident.city} />
            </div>
            <div className="profile-mini-field">
              <label className="profile-compact-label">День рождения</label>
              <input readOnly className="field-input profile-mini-input profile-field-readonly" value={resident.birthDate} />
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button type="button" onClick={() => onTab("person")} className={`profile-tab-btn ${tab === "person" ? "active" : ""}`}>
          О себе
        </button>
        <button type="button" onClick={() => onTab("money")} className={`profile-tab-btn ${tab === "money" ? "active" : ""}`}>
          Инвестиции
        </button>
      </div>

      {tab === "money" ? (
        <div className="profile-edit-list">
          <label className="profile-section-label">Во что инвестирует</label>
          {resident.invests.length ? (
            <div className="chip-list profile-chip-list">
              {resident.invests.map((option) => (
                <span key={`rv-inv-${option}`} className="chip-btn active">
                  {option}
                </span>
              ))}
            </div>
          ) : (
            <p className="stats-line">Не указано</p>
          )}
          <label className="profile-section-label">Во что хочет инвестировать</label>
          {resident.wantsToInvest.length ? (
            <div className="chip-list profile-chip-list">
              {resident.wantsToInvest.map((option) => (
                <span key={`rv-w-${option}`} className="chip-btn active">
                  {option}
                </span>
              ))}
            </div>
          ) : (
            <p className="stats-line">Не указано</p>
          )}
        </div>
      ) : (
        <div className="profile-edit-list">
          <label className="field-label">Чем занимается</label>
          <AutoGrowTextarea readOnly className="field-input field-textarea profile-field-readonly" value={resident.occupation} />
          <label className="field-label">Чем может быть полезен</label>
          <AutoGrowTextarea readOnly className="field-input field-textarea profile-field-readonly" value={resident.useful} />
          <label className="field-label">Чем увлекается</label>
          <AutoGrowTextarea readOnly className="field-input field-textarea profile-field-readonly" value={resident.hobbies} />
          <label className="field-label">Какие запросы</label>
          <AutoGrowTextarea readOnly className="field-input field-textarea profile-field-readonly" value={resident.requests} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<Section>("profile");
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDto>({
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
  });
  const [investmentOptions, setInvestmentOptions] = useState<{ invests: string[]; wantsToInvest: string[] }>({
    invests: [],
    wantsToInvest: [],
  });
  const [residents, setResidents] = useState<ResidentDto[]>([]);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [broadcastSummaries, setBroadcastSummaries] = useState<BroadcastSummaryDto[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  const [needsConsent, setNeedsConsent] = useState(false);
  const [consentResidentId, setConsentResidentId] = useState(0);
  const [consentLinks, setConsentLinks] = useState<{ marketing: string; privacy: string; personalData: string }>({
    marketing: "",
    privacy: "",
    personalData: "",
  });
  const [communityTelegram, setCommunityTelegram] = useState("https://t.me/+9h87ONiKUMo5ZGQy");
  const [meetings, setMeetings] = useState<MeetingsDto>({
    mode: "idle",
    introTitle: "Умные связи",
    introText:
      "Это возможность для резидентов клуба встречаться с новыми людьми один на один. Нажмите «Хочу участвовать», чтобы мы подобрали вам партнера для встречи на этой неделе.",
    offlineEnabled: false,
    partner: null,
    feedbackPrompt: "",
  });
  const [selectedResident, setSelectedResident] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [profileTab, setProfileTab] = useState<"money" | "person">("person");
  const [residentQuery, setResidentQuery] = useState("");
  const [residentFiltersOpen, setResidentFiltersOpen] = useState(false);
  const [residentCityFilter, setResidentCityFilter] = useState<string[]>([]);
  const [residentInvestFilter, setResidentInvestFilter] = useState<string[]>([]);
  const [residentLimit, setResidentLimit] = useState(36);
  const [viewerKind, setViewerKind] = useState<"resident" | "event" | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerResidentTab, setViewerResidentTab] = useState<"money" | "person">("person");
  const [meetingsPartnerTab, setMeetingsPartnerTab] = useState<"money" | "person">("person");
  const [meetingsGuideOpen, setMeetingsGuideOpen] = useState(false);
  const [meetingsFeedback, setMeetingsFeedback] = useState("");
  const [usefulView, setUsefulView] = useState<"menu" | "notes" | "note_detail">("menu");
  const [selectedSummaryId, setSelectedSummaryId] = useState<number | null>(null);
  const [eventsMonthMs, setEventsMonthMs] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  });
  const swipeStartX = useRef<number | null>(null);

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) {
      const ua = navigator.userAgent || "";
      const inTelegramClient = /Telegram/i.test(ua);
      setHint(
        inTelegramClient
          ? "Telegram не передал WebApp API. Откройте именно как Mini App."
          : "Откройте приложение из Telegram (кнопка меню бота).",
      );
      return;
    }
    try {
      tg.ready();
    } catch {}
    tg.expand();
    try {
      tg.setBackgroundColor("#0d0f14");
      tg.setHeaderColor("#0d0f14");
    } catch {}
  }, [tg]);

  const loadApp = useCallback(async () => {
    if (!tg?.initData) return;
    setLoading(true);
    try {
      const r = await fetch("/api/app/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      });
      const j = (await r.json().catch(() => ({}))) as Bootstrap | { error?: string };
      if (!r.ok || !("ok" in j)) throw new Error("error" in j ? String(j.error || "") : r.statusText);
      const rawProfile = j.profile as ProfileDto;
      const normalized = normalizeProfileForUi({ ...rawProfile, telegramId: rawProfile.telegramId ?? "" });
      setAccessDenied(Boolean(j.accessDenied));
      setNeedsConsent(Boolean(j.needsConsent));
      if (j.needsConsent) {
        setConsentResidentId(Number(j.residentId) || 0);
        setConsentLinks(j.consentLinks || { marketing: "", privacy: "", personalData: "" });
      }
      setAccessMessage(String(j.accessMessage || ""));
      setCommunityTelegram(String(j.communityTelegram || "https://t.me/+9h87ONiKUMo5ZGQy").trim());
      setProfile(normalized);
      setInvestmentOptions({
        invests: Array.from(new Set([...normalizeStringArray(j.investmentOptions?.invests), ...normalized.invests])),
        wantsToInvest: Array.from(new Set([...normalizeStringArray(j.investmentOptions?.wantsToInvest), ...normalized.wantsToInvest])),
      });
      setResidents(
        j.residents.map((r) => {
          const row = r as ResidentDto;
          return { ...row, telegramId: row.telegramId ?? "" };
        }),
      );
      setEvents(j.events);
      setBroadcastSummaries(
        Array.isArray(j.broadcastSummaries)
          ? j.broadcastSummaries.map((x) => ({
              id: Number(x.id) || 0,
              title: String(x.title || "").trim(),
              fileUrl: String(x.fileUrl || "").trim(),
              text: String(x.text || "").trim(),
            }))
          : [],
      );
      setMeetings({
        ...(j.meetings as MeetingsDto),
        partner: j.meetings?.partner ? ({ ...(j.meetings.partner as ResidentDto), telegramId: j.meetings.partner.telegramId ?? "" } as ResidentDto) : null,
      });
      setSelectedResident((prev) => (prev && j.residents.some((x) => x.id === prev) ? prev : j.residents[0]?.id ?? null));
      setSelectedEvent((prev) => (prev && j.events.some((x) => x.id === prev) ? prev : j.events[0]?.id ?? null));
      setHint(null);
    } catch (e) {
      setHint(e instanceof Error ? e.message : "Не удалось загрузить данные.");
    } finally {
      setLoading(false);
    }
  }, [tg]);

  useEffect(() => {
    void loadApp();
  }, [loadApp]);

  const touchSession = useCallback(
    async (currentPage: string) => {
      if (!tg?.initData) return;
      try {
        await fetch("/api/app/session/touch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initData: tg.initData,
            state: "active",
            currentPage,
            tempData: { source: "miniapp_tab_change" },
          }),
        });
      } catch {}
    },
    [tg],
  );

  useEffect(() => {
    void touchSession(active);
  }, [active, touchSession]);

  const saveProfile = useCallback(async () => {
    if (!tg?.initData) return;
    setSavingProfile(true);
    try {
      const r = await fetch("/api/app/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: tg.initData,
          ...profile,
          birthDate: dateToApi(profile.birthDate),
          capital: moneyToApi(profile.capital),
          monthlyIncome: moneyToApi(profile.monthlyIncome),
          invests: profile.invests,
          wantsToInvest: profile.wantsToInvest,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) throw new Error(j.error || r.statusText);
      setHint("Профиль сохранен.");
      setTimeout(() => setHint(null), 1800);
      void loadApp();
    } catch (e) {
      setHint(e instanceof Error ? e.message : "Не удалось сохранить профиль.");
    } finally {
      setSavingProfile(false);
    }
  }, [tg, profile, loadApp]);

  const registerEvent = useCallback(
    async (eventId: number, action: "register" | "cancel" = "register") => {
      if (!tg?.initData) { setHint("Ошибка: нет данных Telegram."); return; }
      setRegisteringId(eventId);
      try {
        const r = await fetch("/api/app/events/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData, eventId, action }),
        });
        const j = (await r.json().catch(() => ({}))) as { status?: string; error?: string };
        if (!r.ok) throw new Error(j.error || r.statusText);
        if (j.status === "cancelled") setHint("Запись отменена.");
        else if (j.status === "ok") setHint("Вы записаны.");
        else if (j.status === "wait") setHint("Вы в листе ожидания.");
        else if (j.status === "exists") setHint("Вы уже записаны.");
        else if (j.status === "missing" && action === "cancel") setHint("Вы не были записаны.");
        else setHint("Запрос обработан.");
        setTimeout(() => setHint(null), 2200);
        void loadApp();
      } catch (e) {
        setHint(e instanceof Error ? e.message : action === "cancel" ? "Не удалось отменить запись." : "Не удалось записаться.");
      }
      setRegisteringId(null);
    },
    [tg, loadApp],
  );

  const meetingsAction = useCallback(
    async (action: "join" | "cancel_waiting" | "partner_unreachable" | "submit_feedback", feedback?: string) => {
      if (!tg?.initData) return;
      try {
        const r = await fetch("/api/app/meetings/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData, action, feedback: feedback || "" }),
        });
        const j = (await r.json().catch(() => ({}))) as { state?: MeetingsDto; error?: string };
        if (!r.ok) throw new Error(j.error || r.statusText);
        if (j.state) {
          setMeetings({
            ...j.state,
            partner: j.state.partner ? ({ ...(j.state.partner as ResidentDto), telegramId: j.state.partner.telegramId ?? "" } as ResidentDto) : null,
          });
        }
        if (action === "submit_feedback") {
          setMeetingsFeedback("");
          setHint("Спасибо за обратную связь.");
        } else if (action === "partner_unreachable") {
          setHint("Поиск нового партнера запущен.");
        }
        setTimeout(() => setHint(null), 2200);
        void loadApp();
      } catch (e) {
        setHint(e instanceof Error ? e.message : "Не удалось выполнить действие.");
      }
    },
    [tg, loadApp],
  );

  const uploadProfilePhoto = useCallback(
    async (file: File) => {
      if (!file) return;
      if (!tg?.initData) {
        setHint("Откройте приложение из Telegram.");
        setTimeout(() => setHint(null), 2200);
        return;
      }
      setUploadingPhoto(true);
      try {
        const { dataUrl, name } = await prepareProfilePhotoForUpload(file);
        const r = await fetch("/api/app/profile/photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initData: tg.initData,
            photoName: name,
            photoBase64: dataUrl,
          }),
        });
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        if (!r.ok) throw new Error(j.error || r.statusText);
        setHint("Фото обновлено.");
        setTimeout(() => setHint(null), 1600);
        void loadApp();
      } catch (e) {
        setHint(e instanceof Error ? e.message : "Не удалось загрузить фото.");
      } finally {
        setUploadingPhoto(false);
      }
    },
    [tg, loadApp],
  );

  const toggleProfileMulti = useCallback((key: "invests" | "wantsToInvest", value: string) => {
    setProfile((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((x) => x !== value) : [...current, value],
      };
    });
  }, []);

  const filteredResidents = useMemo(() => {
    const q = residentQuery.trim().toLowerCase();
    return residents.filter((r) => {
      if (q) {
        const searchable = [
          r.name,
          r.city,
          r.role,
          r.occupation,
          r.useful,
          r.requests,
          r.hobbies,
          r.telegramUsername,
          r.birthDate,
          r.capital,
          r.monthlyIncome,
          ...r.invests,
          ...r.wantsToInvest,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      const city = String(r.city || "").trim();
      if (residentCityFilter.length && !residentCityFilter.includes(city)) return false;
      if (residentInvestFilter.length && !residentInvestFilter.some((x) => r.invests.includes(x))) return false;
      return true;
    });
  }, [residents, residentQuery, residentCityFilter, residentInvestFilter]);

  const residentCityOptions = useMemo(
    () =>
      Array.from(
        new Set(
          residents
            .map((r) => String(r.city || "").trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "ru")),
    [residents],
  );

  const residentInvestOptions = useMemo(
    () =>
      Array.from(
        new Set(
          residents
            .flatMap((r) => r.invests)
            .map((x) => String(x || "").trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "ru")),
    [residents],
  );

  const toggleResidentFilterValue = useCallback(
    (key: "city" | "invest", value: string) => {
      if (!value) return;
      if (key === "city") {
        setResidentCityFilter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
        return;
      }
      setResidentInvestFilter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
    },
    [],
  );

  const eventsCalendar = useMemo(() => {
    const monthDate = new Date(eventsMonthMs);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthStartMs = monthStart.getTime();
    const weekdayMonBased = (monthStart.getDay() + 6) % 7;
    const firstCell = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 - weekdayMonBased);
    const todayKey = toDayKey(Date.now());
    const eventDayCounts = new Map<string, number>();
    const eventFirstIdByDay = new Map<string, number>();
    const myEventDays = new Set<string>();
    for (const ev of events) {
      const key = toDayKey(ev.startsAt);
      if (!key) continue;
      eventDayCounts.set(key, (eventDayCounts.get(key) || 0) + 1);
      if (String(ev.myStatus || "").trim()) myEventDays.add(key);
      const current = eventFirstIdByDay.get(key);
      if (!current) {
        eventFirstIdByDay.set(key, ev.id);
        continue;
      }
      const prev = events.find((x) => x.id === current);
      if (!prev || ev.startsAt < prev.startsAt) {
        eventFirstIdByDay.set(key, ev.id);
      }
    }
    const days = Array.from({ length: 42 }, (_, i) => {
      const cellDate = new Date(firstCell.getFullYear(), firstCell.getMonth(), firstCell.getDate() + i);
      const key = toDayKey(cellDate.getTime());
      return {
        key,
        day: cellDate.getDate(),
        inCurrentMonth: cellDate.getMonth() === monthStart.getMonth(),
        hasEvent: eventDayCounts.has(key),
        eventsCount: eventDayCounts.get(key) || 0,
        eventId: eventFirstIdByDay.get(key) || null,
        hasMyEvent: myEventDays.has(key),
        isToday: key === todayKey,
      };
    });
    return {
      monthStartMs,
      title: monthLabelFromMs(monthStartMs),
      days,
    };
  }, [events, eventsMonthMs]);

  useEffect(() => {
    setResidentLimit(36);
  }, [residentQuery, residentCityFilter, residentInvestFilter]);

  const residentsSlice = filteredResidents.slice(0, residentLimit);
  const viewerItemsCount = viewerKind === "resident" ? filteredResidents.length : viewerKind === "event" ? events.length : 0;
  const viewerResident = viewerKind === "resident" ? filteredResidents[viewerIndex] || null : null;
  const viewerEvent = viewerKind === "event" ? events[viewerIndex] || null : null;

  const viewerResidentUi = useMemo(() => {
    if (viewerKind !== "resident" || !viewerResident) return null;
    return residentToUi(viewerResident);
  }, [viewerKind, viewerResident]);

  useEffect(() => {
    if (!viewerKind) return;
    if (viewerItemsCount < 1) {
      setViewerKind(null);
      return;
    }
    if (viewerIndex > viewerItemsCount - 1) setViewerIndex(Math.max(0, viewerItemsCount - 1));
  }, [viewerKind, viewerItemsCount, viewerIndex]);

  useEffect(() => {
    if (viewerKind === "resident") setViewerResidentTab("person");
  }, [viewerKind]);

  useEffect(() => {
    setViewerKind(null);
  }, [active]);

  useEffect(() => {
    if (active !== "meetings") {
      setMeetingsGuideOpen(false);
      setMeetingsFeedback("");
      setMeetingsPartnerTab("person");
    }
  }, [active]);

  useEffect(() => {
    if (active !== "useful") {
      setUsefulView("menu");
      setSelectedSummaryId(null);
    }
  }, [active]);

  const openResidentViewer = useCallback(
    (residentId: number, fallbackIndex?: number) => {
      const safeId = Number(residentId);
      const idx =
        Number.isFinite(safeId)
          ? filteredResidents.findIndex((r) => Number.isFinite(Number(r.id)) && Number(r.id) === safeId)
          : typeof fallbackIndex === "number"
            ? fallbackIndex
            : -1;
      if (idx < 0) return;
      const selected = filteredResidents[idx];
      const selectedId = Number(selected?.id);
      setSelectedResident(Number.isFinite(selectedId) ? selectedId : null);
      setViewerIndex(idx);
      setViewerKind("resident");
    },
    [filteredResidents],
  );

  const openEventViewer = useCallback((eventId: number) => {
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx < 0) return;
    setSelectedEvent(eventId);
    setViewerIndex(idx);
    setViewerKind("event");
  }, [events]);

  const moveViewer = useCallback(
    (direction: -1 | 1) => {
      if (!viewerKind || viewerItemsCount < 2) return;
      setViewerIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return viewerItemsCount - 1;
        if (next >= viewerItemsCount) return 0;
        return next;
      });
    },
    [viewerKind, viewerItemsCount],
  );

  return (
    <div className="app-shell">
      <section className={`main-panel ${active === "profile" ? "main-panel--profile" : ""}`}>
        {loading ? (
          <p className="hint-line">Загрузка…</p>
        ) : needsConsent ? (
          <ConsentScreen
            residentId={consentResidentId}
            consentLinks={consentLinks}
            initData={tg?.initData || ""}
            onDone={() => {
              setNeedsConsent(false);
              loadApp();
            }}
          />
        ) : accessDenied ? (
          <NonResidentLanding />
        ) : active === "profile" ? (
          <div className="profile-card ref-profile profile-edit-screen">
            <div className="ref-topbar">
              <span>Профиль</span>
            </div>

            <div className="ref-main">
              <div className="ref-avatar-box">
                {profile.photoUrl ? <img src={profile.photoUrl} alt="Профиль" className="ref-avatar" /> : <div className="item-fallback profile-fallback ref-avatar">{initials(profile.fullName)}</div>}
                <label className="avatar-edit-btn" aria-label="Обновить фото профиля" title="Нажмите на фото, чтобы выбрать изображение">
                  <input
                    type="file"
                    accept="image/*"
                    className="photo-upload-input"
                    disabled={uploadingPhoto}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadProfilePhoto(file);
                      e.currentTarget.value = "";
                    }}
                  />
                  <span className="avatar-edit-icon" aria-hidden="true">
                    {uploadingPhoto ? "…" : "✎"}
                  </span>
                </label>
              </div>

              <div className="ref-identity">
                <div className="profile-row-top">
                  <input readOnly className="field-input profile-name-input profile-field-readonly" value={profile.fullName} />
                  <button
                    type="button"
                    className="tg-inline-btn"
                    disabled={
                      !profile.telegramUsername.replace(/^@/, "").trim() && !String(profile.telegramId || "").replace(/\D/g, "")
                    }
                    onClick={() => openTelegramContact(tg, profile.telegramUsername, profile.telegramId)}
                    aria-label="Открыть Telegram профиль"
                    title="Открыть Telegram профиль"
                  >
                    <TelegramGoldIcon />
                  </button>
                </div>
                <div className="profile-row-grid">
                  <div className="profile-mini-field">
                    <label className="profile-compact-label">Город</label>
                    <CityAutocomplete
                      value={profile.city}
                      onChange={(city) => setProfile((p) => ({ ...p, city }))}
                      className="field-input profile-mini-input"
                      placeholder="Начните вводить город"
                    />
                  </div>
                  <div className="profile-mini-field">
                    <label className="profile-compact-label">День рождения</label>
                    <input
                      value={profile.birthDate}
                      onChange={(e) => setProfile((p) => ({ ...p, birthDate: e.target.value }))}
                      onBlur={(e) => setProfile((p) => ({ ...p, birthDate: dateToUi(e.target.value) }))}
                      className="field-input profile-mini-input"
                      placeholder="ДД.ММ.ГГГГ"
                    />
                  </div>
                </div>
                <div className="profile-row-grid">
                  <div className="profile-mini-field">
                    <label className="profile-compact-label">Капитал</label>
                    <input
                      value={profile.capital}
                      onChange={(e) => setProfile((p) => ({ ...p, capital: e.target.value }))}
                      onBlur={(e) => setProfile((p) => ({ ...p, capital: moneyToUi(e.target.value) }))}
                      className="field-input profile-mini-input"
                      placeholder="0"
                    />
                  </div>
                  <div className="profile-mini-field">
                    <label className="profile-compact-label">Доход</label>
                    <input
                      value={profile.monthlyIncome}
                      onChange={(e) => setProfile((p) => ({ ...p, monthlyIncome: e.target.value }))}
                      onBlur={(e) => setProfile((p) => ({ ...p, monthlyIncome: moneyToUi(e.target.value) }))}
                      className="field-input profile-mini-input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-tabs">
              <button type="button" onClick={() => setProfileTab("person")} className={`profile-tab-btn ${profileTab === "person" ? "active" : ""}`}>
                О себе
              </button>
              <button type="button" onClick={() => setProfileTab("money")} className={`profile-tab-btn ${profileTab === "money" ? "active" : ""}`}>
                Инвестиции
              </button>
            </div>

            {profileTab === "money" ? (
              <div className="profile-edit-list">
                <label className="profile-section-label">Во что я инвестирую</label>
                <div className="chip-list profile-chip-list">
                  {investmentOptions.invests.map((option) => {
                    const activeChip = profile.invests.includes(option);
                    return (
                      <button
                        key={`inv-${option}`}
                        type="button"
                        className={`chip-btn ${activeChip ? "active" : ""}`}
                        onClick={() => toggleProfileMulti("invests", option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {!investmentOptions.invests.length ? <p className="stats-line">Список инвестиций пуст.</p> : null}
                <label className="profile-section-label">Во что я хочу инвестировать</label>
                <div className="chip-list profile-chip-list">
                  {investmentOptions.wantsToInvest.map((option) => {
                    const activeChip = profile.wantsToInvest.includes(option);
                    return (
                      <button
                        key={`want-${option}`}
                        type="button"
                        className={`chip-btn ${activeChip ? "active" : ""}`}
                        onClick={() => toggleProfileMulti("wantsToInvest", option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {!investmentOptions.wantsToInvest.length ? <p className="stats-line">Список целей инвестиций пуст.</p> : null}
              </div>
            ) : (
              <div className="profile-edit-list">
                <label className="field-label">Чем я занимаюсь</label>
                <AutoGrowTextarea
                  value={profile.occupation}
                  onChange={(e) => setProfile((p) => ({ ...p, occupation: e.target.value }))}
                  className="field-input field-textarea"
                />
                <label className="field-label">Чем я могу быть полезен</label>
                <AutoGrowTextarea value={profile.useful} onChange={(e) => setProfile((p) => ({ ...p, useful: e.target.value }))} className="field-input field-textarea" />
                <label className="field-label">Чем я увлекаюсь</label>
                <AutoGrowTextarea value={profile.hobbies} onChange={(e) => setProfile((p) => ({ ...p, hobbies: e.target.value }))} className="field-input field-textarea" />
                <label className="field-label">Какие у меня запросы в клубе</label>
                <AutoGrowTextarea
                  value={profile.personalRequests}
                  onChange={(e) => setProfile((p) => ({ ...p, personalRequests: e.target.value }))}
                  className="field-input field-textarea"
                />
              </div>
            )}

          </div>
        ) : active === "residents" ? (
          <>
            <div className="resident-search-row">
              <label className="resident-search-line" aria-label="Поиск резидентов">
                <input
                  value={residentQuery}
                  onChange={(e) => setResidentQuery(e.target.value)}
                  placeholder="Поиск"
                  className="field-input resident-search-input"
                />
                <span className="resident-search-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
                    <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
              </label>
              <button
                type="button"
                className={`resident-filter-toggle ${residentFiltersOpen ? "active" : ""}`}
                onClick={() => setResidentFiltersOpen((v) => !v)}
                aria-label="Открыть фильтры"
                title="Фильтры"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {residentFiltersOpen ? (
              <div className="resident-filters-panel">
                <p className="resident-filters-heading">Фильтры</p>
                <button
                  type="button"
                  className="resident-filter-reset"
                  onClick={() => {
                    setResidentCityFilter([]);
                    setResidentInvestFilter([]);
                  }}
                >
                  Сбросить
                </button>
                <details className="resident-multi-select">
                  <summary>
                    <span className="resident-filter-label">Город</span>
                    <span className="resident-filter-summary">{residentCityFilter.length ? `${residentCityFilter.length} выбрано` : "Все города"}</span>
                  </summary>
                  <div className="resident-multi-options">
                    {residentCityOptions.map((city) => (
                      <label key={city} className="resident-multi-option">
                        <input
                          type="checkbox"
                          checked={residentCityFilter.includes(city)}
                          onChange={() => toggleResidentFilterValue("city", city)}
                        />
                        <span>{city}</span>
                      </label>
                    ))}
                  </div>
                </details>
                <details className="resident-multi-select">
                  <summary>
                    <span className="resident-filter-label">Во что инвестирует</span>
                    <span className="resident-filter-summary">{residentInvestFilter.length ? `${residentInvestFilter.length} выбрано` : "Все направления"}</span>
                  </summary>
                  <div className="resident-multi-options">
                    {residentInvestOptions.map((invest) => (
                      <label key={invest} className="resident-multi-option">
                        <input
                          type="checkbox"
                          checked={residentInvestFilter.includes(invest)}
                          onChange={() => toggleResidentFilterValue("invest", invest)}
                        />
                        <span>{invest}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>
            ) : null}
            <div className="resident-grid">
              {residentsSlice.map((r, idx) => (
                <article key={`${r.id}-${idx}`} className="resident-card">
                  <button
                    type="button"
                    className="resident-photo-btn"
                    onClick={() => openResidentViewer(r.id, idx)}
                    aria-label={`Открыть анкету: ${r.name}`}
                    title="Открыть анкету"
                  >
                    {r.photoUrl ? (
                      <img src={r.photoUrl} alt={r.name} className="resident-photo" />
                    ) : (
                      <div className="resident-photo resident-photo-fallback item-fallback">{initials(r.name)}</div>
                    )}
                  </button>
                  <div className="resident-card-body">
                    <strong className="resident-name">{r.name}</strong>
                    {r.city ? <p className="resident-city">{r.city}</p> : null}
                    <p className="resident-invests-title">Во что инвестирует</p>
                    <p className="resident-invests">
                      {r.invests.length ? r.invests.join(", ") : "Не указано"}
                    </p>
                  </div>
                  <button type="button" onClick={() => openResidentViewer(r.id, idx)} className="resident-open-btn">
                    К анкете
                  </button>
                </article>
              ))}
            </div>
            {residentLimit < filteredResidents.length ? (
              <button type="button" onClick={() => setResidentLimit((v) => v + 36)} className="btn-ghost">
                Показать ещё
              </button>
            ) : null}
          </>
        ) : active === "events" ? (
          <>
            <section className="events-calendar" aria-label="Календарь событий">
              <div className="events-calendar-head">
                <button
                  type="button"
                  className="events-month-nav"
                  onClick={() => {
                    const d = new Date(eventsCalendar.monthStartMs);
                    setEventsMonthMs(new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime());
                  }}
                  aria-label="Предыдущий месяц"
                >
                  ←
                </button>
                <strong>{eventsCalendar.title}</strong>
                <button
                  type="button"
                  className="events-month-nav"
                  onClick={() => {
                    const d = new Date(eventsCalendar.monthStartMs);
                    setEventsMonthMs(new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime());
                  }}
                  aria-label="Следующий месяц"
                >
                  →
                </button>
              </div>
              <div className="events-calendar-weekdays" aria-hidden>
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
              <div className="events-calendar-grid">
                {eventsCalendar.days.map((cell) => (
                  <div
                    key={cell.key}
                    className={`events-calendar-cell ${cell.inCurrentMonth ? "" : "is-out"} ${cell.hasEvent ? "has-event" : ""}`}
                    title={cell.hasEvent ? `Событий: ${cell.eventsCount}` : undefined}
                  >
                    {cell.hasEvent && cell.eventId ? (
                      <button
                        type="button"
                        className={`events-calendar-day ${cell.hasEvent ? "has-event" : ""} ${cell.hasMyEvent ? "has-my-event" : ""} ${cell.isToday ? "is-today" : ""}`}
                        onClick={() => openEventViewer(cell.eventId as number)}
                        aria-label={`Открыть событие на ${cell.day}`}
                      >
                        {cell.day}
                      </button>
                    ) : (
                      <span className={`events-calendar-day ${cell.hasEvent ? "has-event" : ""} ${cell.hasMyEvent ? "has-my-event" : ""} ${cell.isToday ? "is-today" : ""}`}>
                        {cell.day}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
            <button type="button" className="btn-primary events-smart-btn" onClick={() => setActive("meetings")}>
              Умные связи
            </button>
            <p className="events-smart-note">Еженедельные встречи тет-а-тет</p>
            <div className="list-wrap">
              {events.map((ev) => (
                <button key={ev.id} type="button" onClick={() => openEventViewer(ev.id)} className="list-item event-item">
                  <div className="item-copy">
                    <strong>{ev.title}</strong>
                    {ev.myStatus ? <span className="my-event-badge">Моё событие</span> : null}
                    <span>{fmtDate(ev.startsAt)}</span>
                  </div>
                  <div className="event-counter">{ev.capacity ? `${ev.occupied}/${ev.capacity}` : ev.occupied}</div>
                </button>
              ))}
            </div>
          </>
        ) : active === "meetings" ? (
          <div className="meetings-wrap">
            <button type="button" className="btn-ghost" onClick={() => setActive("events")}>
              ← Назад
            </button>
            <h3 className="meetings-title">{meetings.introTitle || "Умные связи"}</h3>
            {meetingsGuideOpen ? (
              <div className="meetings-guide-card">
                <h4>Как подготовиться к встрече и получить максимум пользы</h4>
                <p><b>1️⃣ Договоритесь о времени</b><br />Напишите партнёру в Telegram и предложите 2-3 варианта на ближайшие дни. Онлайн-встреча обычно длится 30-45 минут. Ссылка на его телеграм - рядом с его именем.</p>
                <p><b>2️⃣ Выберите формат</b><br />Созвониться можно в Zoom, Google Meet, Telegram — как вам удобнее.</p>
                <p><b>3️⃣ Подготовьтесь за 5 минут</b><br />Перед встречей подумайте:<br />• Кто вы и чем занимаетесь (кратко)<br />• Ваш главный вопрос или тема для обсуждения<br />• Чем вы можете быть полезны собеседнику</p>
                <p><b>4️⃣ Структура встречи</b><br />Мы рекомендуем такой план:<br />— По 3 минуты на представление каждого<br />— 20–30 минут на обсуждение: вопросы, обмен опытом, идеи<br />— 5 минут на договорённости и следующие шаги</p>
                <p><b>5️⃣ Правила добрососедства</b><br />• Уважайте время: начинайте вовремя, предупреждайте об опоздании<br />• Конфиденциальность: всё, чем делятся на встрече — остаётся между вами<br />• Не продавайте и не рекламируйте свои услуги настойчиво. Главное — живой обмен и польза друг для друга</p>
                <p><b>6️⃣ Если встреча не складывается</b><br />Если партнёр не выходит на связь или диалог не клеится — ничего страшного. Вы всегда можете завершить встречу досрочно и сообщить об этом боту.</p>
                <p>И помните: лучшие инвестиционные идеи и партнёрства часто рождаются именно в таких беседах.</p>
                <button type="button" className="btn-ghost" onClick={() => setMeetingsGuideOpen(false)}>
                  Назад к партнеру
                </button>
              </div>
            ) : (
              <>
                {meetings.mode === "idle" ? (
                  <>
                    <p className="meetings-text">
                      {meetings.introText ||
                        "Это возможность для резидентов клуба встречаться с новыми людьми один на один. Нажмите «Хочу участвовать», чтобы мы подобрали вам партнера для встречи на этой неделе."}
                    </p>
                    {/* Кнопки онлайн/оффлайн временно скрыты до запуска оффлайн-встреч.
                    <div className="meetings-mode-row">...</div>
                    */}
                    <button type="button" className="btn-primary" onClick={() => void meetingsAction("join")}>
                      Хочу участвовать
                    </button>
                  </>
                ) : meetings.mode === "waiting" ? (
                  <>
                    <p className="stats-line">Вы в списке ожидания. Как только найдется пара — пришлем уведомление.</p>
                    <button type="button" className="btn-primary" onClick={() => void meetingsAction("cancel_waiting")}>
                      Передумать
                    </button>
                  </>
                ) : meetings.mode === "feedback" ? (
                  <div className="meetings-feedback-card">
                    <p className="meetings-feedback-title">{meetings.feedbackPrompt || "Расскажите, как прошла ваша встреча?"}</p>
                    <textarea
                      className="field-input field-textarea"
                      rows={5}
                      placeholder="Поделитесь коротко итогом встречи"
                      value={meetingsFeedback}
                      onChange={(e) => setMeetingsFeedback(e.target.value)}
                    />
                    <button type="button" className="btn-primary" onClick={() => void meetingsAction("submit_feedback", meetingsFeedback)}>
                      Отправить обратную связь
                    </button>
                  </div>
                ) : meetings.partner ? (
                  <div className="meetings-matched">
                    <p className="meetings-feedback-title">Ваш партнер на этой неделе.</p>
                    <div className="meetings-actions-top">
                      <button type="button" className="btn-ghost" onClick={() => setMeetingsGuideOpen(true)}>
                        Что делать дальше?
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => void meetingsAction("partner_unreachable")}>
                        Партнер не выходит на связь
                      </button>
                    </div>
                    <ResidentProfileView resident={residentToUi(meetings.partner)} tab={meetingsPartnerTab} onTab={setMeetingsPartnerTab} tg={tg} />
                  </div>
                ) : (
                  <button type="button" className="btn-primary" onClick={() => void meetingsAction("join")}>
                    Хочу участвовать
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="useful-wrap">
            {usefulView === "notes" ? (
              <div className="useful-notes-wrap">
                <button type="button" className="btn-ghost useful-notes-back" onClick={() => setUsefulView("menu")}>
                  ← Назад
                </button>
                {broadcastSummaries.length ? (
                  broadcastSummaries.map((item) => (
                    <button
                      key={`summary-title-${item.id}`}
                      type="button"
                      className="btn-ghost useful-note-title-btn"
                      onClick={() => {
                        setSelectedSummaryId(item.id);
                        setUsefulView("note_detail");
                      }}
                    >
                      {item.title || "Конспект"}
                    </button>
                  ))
                ) : (
                  <p className="stats-line">Пока нет активных конспектов эфиров.</p>
                )}
              </div>
            ) : usefulView === "note_detail" ? (
              <div className="useful-notes-wrap">
                <button
                  type="button"
                  className="btn-ghost useful-notes-back"
                  onClick={() => {
                    setUsefulView("notes");
                    setSelectedSummaryId(null);
                  }}
                >
                  ← К списку
                </button>
                {(() => {
                  const item = broadcastSummaries.find((x) => x.id === selectedSummaryId) || null;
                  if (!item) return <p className="stats-line">Конспект не найден.</p>;
                  return (
                    <article className="useful-note-card">
                      <h4>{item.title || "Конспект"}</h4>
                      {item.fileUrl ? (
                        <button
                          type="button"
                          className="btn-primary useful-note-file-btn"
                          onClick={() => {
                            try {
                              if (typeof tg?.openLink === "function") {
                                tg.openLink(item.fileUrl);
                                return;
                              }
                            } catch {}
                            window.open(item.fileUrl, "_blank");
                          }}
                        >
                          Открыть файл конспекта
                        </button>
                      ) : null}
                      {item.text ? <p>{item.text}</p> : null}
                    </article>
                  );
                })()}
              </div>
            ) : (
              <>
                <button type="button" className="btn-primary useful-main-btn" onClick={() => openTelegramContact(tg, communityTelegram, "")}>
                  <TelegramGoldIcon size={42} className="useful-main-img" />
                  Перейти в чат
                </button>
                <div className="useful-grid">
                  <button type="button" className="btn-ghost useful-item-btn useful-item-btn--notes" onClick={() => setUsefulView("notes")}>
                    <img src="/useful/237.png" alt="" className="useful-item-img" aria-hidden />
                    <span className="useful-item-copy">
                      <strong>Конспекты эфиров</strong>
                    </span>
                  </button>
                  <button type="button" className="btn-ghost useful-item-btn useful-item-btn--materials" onClick={() => setHint("Скоро добавим полезные материалы.")}>
                    <img src="/useful/145.png" alt="" className="useful-item-img" aria-hidden />
                    <span className="useful-item-copy">
                      <strong>Полезные материалы</strong>
                    </span>
                  </button>
                  <button type="button" className="btn-ghost useful-item-btn useful-item-btn--vendors" onClick={() => setHint("Скоро добавим базу подрядчиков.")}>
                    <img src="/useful/137.png" alt="" className="useful-item-img" aria-hidden />
                    <span className="useful-item-copy">
                      <strong>База подрядчиков</strong>
                    </span>
                  </button>
                  <button type="button" className="btn-ghost useful-item-btn useful-item-btn--partners" onClick={() => setHint("Скоро добавим партнеров клуба.")}>
                    <img src="/useful/103.png" alt="" className="useful-item-img" aria-hidden />
                    <span className="useful-item-copy">
                      <strong>Партнеры клуба</strong>
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {!accessDenied && !loading && active === "profile" ? (
        <button type="button" disabled={savingProfile || uploadingPhoto} onClick={() => void saveProfile()} className="btn-primary profile-save-btn">
          {savingProfile ? "Сохраняем..." : "Сохранить"}
        </button>
      ) : null}

      {!accessDenied ? (
        <nav className="bottom-nav">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button key={tab.key} type="button" onClick={() => setActive(tab.key)} className={`nav-btn ${isActive ? "active" : ""}`} title={tab.label}>
                <tab.Icon active={isActive} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      ) : null}

      {!accessDenied && viewerKind ? (
        <div className="viewer-backdrop" onClick={() => setViewerKind(null)}>
          <div
            className="viewer-card"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              swipeStartX.current = e.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (swipeStartX.current == null) return;
              const dx = (e.changedTouches[0]?.clientX ?? swipeStartX.current) - swipeStartX.current;
              swipeStartX.current = null;
              if (Math.abs(dx) < 40) return;
              moveViewer(dx > 0 ? -1 : 1);
            }}
          >
            <button type="button" className="viewer-close" onClick={() => setViewerKind(null)} aria-label="Закрыть">
              ✕
            </button>
            {viewerKind === "resident" && viewerResidentUi ? (
              <div className="viewer-body viewer-body--resident-profile">
                <ResidentProfileView resident={viewerResidentUi} tab={viewerResidentTab} onTab={setViewerResidentTab} tg={tg} />
              </div>
            ) : viewerEvent ? (
              <div className="viewer-body">
                <article className="detail-card">
                  {viewerEvent.imageUrl ? <img src={viewerEvent.imageUrl} alt={viewerEvent.title} className="media-image" /> : null}
                  <h3>{viewerEvent.title}</h3>
                  <p className="detail-muted">{fmtDate(viewerEvent.startsAt)}</p>
                  {viewerEvent.location ? <p><b>Локация:</b> {viewerEvent.location}</p> : null}
                  {viewerEvent.description ? <p className="event-description">{viewerEvent.description}</p> : null}
                  <p className="detail-muted">
                    {viewerEvent.capacity ? `Мест: ${viewerEvent.occupied}/${viewerEvent.capacity}` : `Записей: ${viewerEvent.occupied}`}
                    
                  </p>
                  <div className="actions-row">
                    <button
                      type="button"
                      onClick={() => void registerEvent(viewerEvent.id, viewerEvent.myStatus ? "cancel" : "register")}
                      className="btn-primary"
                      disabled={registeringId === viewerEvent.id}
                    >
                      {registeringId === viewerEvent.id ? "Загрузка…" : viewerEvent.myStatus ? "Передумать" : "Записаться"}
                    </button>
                    {viewerEvent.link ? (
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            tg?.openLink(viewerEvent.link);
                          } catch {}
                        }}
                        className="btn-ghost"
                      >
                        Открыть ссылку
                      </button>
                    ) : null}
                  </div>
                </article>
              </div>
            ) : null}
            <div className="viewer-nav">
              <button type="button" onClick={() => moveViewer(-1)} className="viewer-arrow" disabled={viewerItemsCount < 2}>
                ←
              </button>
              <span>{viewerItemsCount ? `${viewerIndex + 1} / ${viewerItemsCount}` : "0 / 0"}</span>
              <button type="button" onClick={() => moveViewer(1)} className="viewer-arrow" disabled={viewerItemsCount < 2}>
                →
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {hint ? <p className="hint-line">{hint}</p> : null}
    </div>
  );
}

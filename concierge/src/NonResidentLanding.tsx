import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import { CityAutocomplete } from "./CityAutocomplete";

const cards = [
  { key: "join", image: "/join-club.png", title: "Вступить в клуб ГОРДОСТЬ", subtitle: "" },
  { key: "invest", image: "/invest-card.png", title: "Привлечь инвестиции в свой проект", subtitle: "" },
  { key: "events", image: "/events-card.png", title: "Календарь ближайших мероприятий", subtitle: "" },
  { key: "banya", image: "/banya-community.png", title: "Вступить в сообщество ИнвестБаня", subtitle: "" },
  { key: "consult", image: "/consult-card.png", title: "Персональная консультация Андрея Плахотнюка", subtitle: "" },
];

type NonResidentView =
  | "menu"
  | "consult"
  | "events"
  | "guest_profile"
  | "banya_landing"
  | "banya_form"
  | "gordost_landing"
  | "gordost_form"
  | "project_landing"
  | "project_form";

type ExternalEventDto = {
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
  externalPrice: string;
};

type GuestProfileForm = {
  fullName: string;
  city: string;
  birthDate: string;
  phone: string;
  email: string;
  investExperience: string;
  capital: string;
  monthlyIncome: string;
  occupation: string;
  useful: string;
  hobbies: string;
  personalRequests: string;
  additional: string;
  socialNetworks: string;
  invests: string[];
  wantsToInvest: string[];
};

type InvestBanyaBootstrap = {
  ok: boolean;
  exists: boolean;
  profile: GuestProfileForm;
  investmentOptions: {
    invests: string[];
    wantsToInvest: string[];
  };
  error?: string;
};

type CommunityKind = "investbanya" | "gordost";

type ProjectApplyForm = {
  projectName: string;
  description: string;
  stage: string;
  timeCommitment: string;
  cofounders: string;
  keyPersons: string;
  pastFailures: string;
  personalInvestment: string;
  otherProjects: string;
  clientReferences: string;
  competitorsAdvantage: string;
  founderAbsencePlan: string;
  unitEconomics: string;
  legalStructure: string;
  activeLitigation: string;
  licenses: string;
  investmentType: string;
  fundingAsk: string;
  valuation: string;
  exitPlan: string;
  vision3_5_years: string;
  biggestRisk: string;
  failureSignal: string;
  hardestDecision: string;
  inn: string;
  whatElse: string;
  minBill: string;
  pitchFiles: File[];
  finmodelFiles: File[];
  videoPitch: string;
  projectWebsite: string;
  projectTg: string;
  founderOtherSocials: string;
};

function emptyProjectForm(): ProjectApplyForm {
  return {
    projectName: "",
    description: "",
    stage: "",
    timeCommitment: "",
    cofounders: "",
    keyPersons: "",
    pastFailures: "",
    personalInvestment: "",
    otherProjects: "",
    clientReferences: "",
    competitorsAdvantage: "",
    founderAbsencePlan: "",
    unitEconomics: "",
    legalStructure: "",
    activeLitigation: "",
    licenses: "",
    investmentType: "",
    fundingAsk: "",
    valuation: "",
    exitPlan: "",
    vision3_5_years: "",
    biggestRisk: "",
    failureSignal: "",
    hardestDecision: "",
    inn: "",
    whatElse: "",
    minBill: "",
    pitchFiles: [],
    finmodelFiles: [],
    videoPitch: "",
    projectWebsite: "",
    projectTg: "",
    founderOtherSocials: "",
  };
}

type TgWebAppLite = {
  initData?: string;
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
};

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

function birthDateToUi(raw: string): string {
  const v = String(raw || "").trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
  const dmyDot = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(v);
  if (dmyDot) return `${dmyDot[1]}/${dmyDot[2]}/${dmyDot[3]}`;
  const dmyDash = /^(\d{2})-(\d{2})-(\d{4})$/.exec(v);
  if (dmyDash) return `${dmyDash[1]}/${dmyDash[2]}/${dmyDash[3]}`;
  const dmySlash = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (dmySlash) return `${dmySlash[1]}/${dmySlash[2]}/${dmySlash[3]}`;
  return v;
}

function normalizeBirthDateForSubmit(raw: string): string {
  const compact = String(raw || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[.-]/g, "/")
    .replace(/\/+/g, "/");
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(compact);
  if (!m) return "";
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return "";
  if (yyyy < 1900 || yyyy > 2100) return "";
  if (mm < 1 || mm > 12) return "";
  if (dd < 1 || dd > 31) return "";
  const date = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (date.getUTCFullYear() !== yyyy || date.getUTCMonth() + 1 !== mm || date.getUTCDate() !== dd) return "";
  return `${String(dd).padStart(2, "0")}/${String(mm).padStart(2, "0")}/${yyyy}`;
}

function normalizeMoneyForSubmit(raw: string): string {
  const compact = String(raw || "").trim().replace(/\s+/g, "").replace(",", ".");
  if (!compact) return "";
  if (!/^-?\d+(\.\d+)?$/.test(compact)) return "";
  return compact;
}

function normalizeEmailForSubmit(raw: string): string {
  const email = String(raw || "").trim().toLowerCase();
  if (!email) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

function normalizePhoneForSubmit(raw: string): string {
  const phone = String(raw || "")
    .trim()
    .replace(/[^\d+]/g, "");
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "";
  return phone;
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

function openGordostCommunity(): void {
  const tg = window.Telegram?.WebApp;
  const url = "https://t.me/gordost_community";
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

const MAX_PITCH_FILE_BYTES = 20 * 1024 * 1024;
const MAX_FINMODEL_FILE_BYTES = 20 * 1024 * 1024;
const MAX_FILES_PER_FIELD = 5;

type ProjectFileDropzoneProps = {
  label: string;
  files: File[];
  maxBytes: number;
  maxFiles: number;
  invalid: boolean;
  onChange: (files: File[]) => void;
  onError: (message: string) => void;
};

function ProjectFileDropzone({
  label,
  files,
  maxBytes,
  maxFiles,
  invalid,
  onChange,
  onError,
}: ProjectFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const mergeFiles = useCallback(
    (incoming: File[]) => {
      if (!incoming.length) return;
      const next = [...files];
      for (const file of incoming) {
        if (file.size > maxBytes) {
          onError(`Файл «${file.name}» слишком большой (${formatFileSize(file.size)}). Максимум ${formatFileSize(maxBytes)}.`);
          continue;
        }
        if (next.length >= maxFiles) {
          onError(`Можно прикрепить не больше ${maxFiles} файлов.`);
          break;
        }
        const duplicate = next.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
        if (!duplicate) next.push(file);
      }
      onChange(next);
    },
    [files, maxBytes, maxFiles, onChange, onError],
  );

  const removeFile = useCallback(
    (index: number) => {
      onChange(files.filter((_, i) => i !== index));
    },
    [files, onChange],
  );

  return (
    <>
      <label className={`field-label ${invalid ? "is-invalid-label" : ""}`.trim()}>{label}</label>
      <div
        className={`file-dropzone ${dragOver ? "is-dragover" : ""} ${invalid ? "is-invalid" : ""}`.trim()}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          mergeFiles(Array.from(e.dataTransfer.files || []));
        }}
      >
        <p className="file-dropzone-title">Перетащите файлы сюда или нажмите для выбора</p>
        <p className="stats-line">Любой формат, до {formatFileSize(maxBytes)}, до {maxFiles} файлов</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="file-dropzone-input"
          onChange={(e) => {
            mergeFiles(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </div>
      {files.length ? (
        <ul className="file-dropzone-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`} className="file-dropzone-item">
              <span>
                {file.name} ({formatFileSize(file.size)})
              </span>
              <button type="button" className="file-dropzone-remove" onClick={() => removeFile(index)} title="Удалить">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function mimeTypeFromFileName(fileName: string): string {
  const ext = String(fileName || "").split(".").pop()?.toLowerCase() || "";
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
    reader.onload = () => {
      let result = typeof reader.result === "string" ? reader.result : "";
      if (!result.startsWith("data:")) {
        reject(new Error("Некорректный формат файла."));
        return;
      }
      const mimeMatch = /^data:([^;,]*);base64,/.exec(result);
      if (!mimeMatch?.[1]) {
        const mime = file.type || mimeTypeFromFileName(file.name);
        const base64 = result.slice(result.indexOf(",") + 1);
        result = `data:${mime};base64,${base64}`;
      }
      resolve(result);
    };
    reader.readAsDataURL(file);
  });
}

export const NonResidentLanding: FC = () => {
  const [joinCard, ...otherCards] = cards;
  const [view, setView] = useState<NonResidentView>("menu");
  const [events, setEvents] = useState<ExternalEventDto[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsHint, setEventsHint] = useState<string | null>(null);
  const [guestProfileSaving, setGuestProfileSaving] = useState(false);
  const [investBanyaLoading, setInvestBanyaLoading] = useState(false);
  const [banyaSubmitAttempted, setBanyaSubmitAttempted] = useState(false);
  const [guestProfileSubmitAttempted, setGuestProfileSubmitAttempted] = useState(false);
  const [projectSubmitAttempted, setProjectSubmitAttempted] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectApplyForm>(emptyProjectForm);
  const [investBanyaOptions, setInvestBanyaOptions] = useState<{ invests: string[]; wantsToInvest: string[] }>({
    invests: [],
    wantsToInvest: [],
  });
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [eventsViewerOpen, setEventsViewerOpen] = useState(false);
  const [guestProfile, setGuestProfile] = useState<GuestProfileForm>({
    fullName: "",
    city: "",
    birthDate: "",
    phone: "",
    email: "",
    investExperience: "",
    capital: "",
    monthlyIncome: "",
    occupation: "",
    useful: "",
    hobbies: "",
    personalRequests: "",
    invests: [],
    wantsToInvest: [],
    additional: "",
    socialNetworks: "",
  });
  const [eventsMonthMs, setEventsMonthMs] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  });
  const tg = window.Telegram?.WebApp as TgWebAppLite | undefined;

  const openEventLink = useCallback((urlRaw: string) => {
    const url = String(urlRaw || "").trim();
    if (!url) return;
    try {
      tg?.openLink?.(url);
      return;
    } catch {
      /* fallback */
    }
    window.open(url, "_blank");
  }, [tg]);

  const loadExternalEvents = useCallback(async () => {
    if (!tg?.initData) {
      setEventsHint("Откройте приложение из Telegram (кнопка меню бота).");
      return;
    }
    setEventsLoading(true);
    setEventsHint(null);
    try {
      const r = await fetch("/api/app/external-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; events?: ExternalEventDto[]; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || r.statusText || "Не удалось загрузить события.");
      const rows = Array.isArray(j.events) ? j.events : [];
      setEvents(rows);
      setSelectedEventId((prev) => (prev != null && rows.some((x) => x.id === prev) ? prev : null));
    } catch (e) {
      setEventsHint(e instanceof Error ? e.message : "Не удалось загрузить события.");
    } finally {
      setEventsLoading(false);
    }
  }, [tg]);

  const registerExternalEvent = useCallback(
    async (eventId: number, action: "register" | "cancel" = "register") => {
      if (!tg?.initData) {
        setEventsHint("Откройте приложение из Telegram.");
        return;
      }
      try {
        const r = await fetch("/api/app/events/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData, eventId, action }),
        });
        const j = (await r.json().catch(() => ({}))) as { status?: string; error?: string; needsGuestProfile?: boolean };
        if (!r.ok) throw new Error(j.error || r.statusText);
        if (j.status === "cancelled") setEventsHint("Запись отменена.");
        else if (j.status === "ok") setEventsHint("Вы записаны.");
        else if (j.status === "wait") setEventsHint("Вы в листе ожидания.");
        else if (j.status === "exists") setEventsHint("Вы уже записаны.");
        else setEventsHint("Запрос обработан.");
        if (j.needsGuestProfile) {
          setGuestProfileSubmitAttempted(false);
          setView("guest_profile");
          return;
        }
        await loadExternalEvents();
      } catch (e) {
        setEventsHint(e instanceof Error ? e.message : "Не удалось выполнить действие.");
      }
    },
    [loadExternalEvents, tg],
  );

  const guestProfileValidation = useMemo(() => {
    const badPhone = Boolean(guestProfile.phone.trim()) && !normalizePhoneForSubmit(guestProfile.phone);
    const badEmail = Boolean(guestProfile.email.trim()) && !normalizeEmailForSubmit(guestProfile.email);
    const flags = {
      fullName: !guestProfile.fullName.trim(),
      city: !guestProfile.city.trim(),
      phone: !guestProfile.phone.trim(),
      email: !guestProfile.email.trim(),
      investExperience: !guestProfile.investExperience.trim(),
      occupation: !guestProfile.occupation.trim(),
      hobbies: !guestProfile.hobbies.trim(),
    };
    return {
      flags,
      hasMissing: Object.values(flags).some(Boolean),
      hasFormatErrors: badPhone || badEmail,
      formatFlags: {
        phone: badPhone,
        email: badEmail,
      },
    };
  }, [guestProfile]);

  const saveGuestProfile = useCallback(async () => {
    if (!tg?.initData) {
      setEventsHint("Откройте приложение из Telegram.");
      return;
    }
    setGuestProfileSubmitAttempted(true);
    if (guestProfileValidation.hasMissing) {
      setEventsHint("Заполните обязательные поля анкеты.");
      return;
    }
    if (guestProfileValidation.hasFormatErrors) {
      setEventsHint("Проверьте формат полей, подсвеченных красным.");
      return;
    }
    const normalizedPhone = normalizePhoneForSubmit(guestProfile.phone);
    const normalizedEmail = normalizeEmailForSubmit(guestProfile.email);
    setGuestProfileSaving(true);
    try {
      const r = await fetch("/api/app/guest-profile/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: tg.initData,
          fullName: guestProfile.fullName,
          city: guestProfile.city,
          phone: normalizedPhone,
          email: normalizedEmail,
          investExperience: guestProfile.investExperience,
          occupation: guestProfile.occupation,
          hobbies: guestProfile.hobbies,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || r.statusText || "Не удалось сохранить профиль.");
      setEventsHint("Профиль сохранен.");
      setGuestProfileSubmitAttempted(false);
      setView("events");
      await loadExternalEvents();
    } catch (e) {
      setEventsHint(e instanceof Error ? e.message : "Не удалось сохранить профиль.");
    } finally {
      setGuestProfileSaving(false);
    }
  }, [guestProfile, guestProfileValidation.hasFormatErrors, guestProfileValidation.hasMissing, loadExternalEvents, tg]);

  const loadCommunityForm = useCallback(async (kind: CommunityKind) => {
    if (!tg?.initData) {
      setEventsHint("Откройте приложение из Telegram.");
      return;
    }
    setInvestBanyaLoading(true);
    setEventsHint(null);
    try {
      const r = await fetch(`/api/app/${kind}/form-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      });
      const j = (await r.json().catch(() => ({}))) as InvestBanyaBootstrap;
      if (!r.ok || !j.ok) throw new Error(j.error || r.statusText || "Не удалось загрузить анкету.");
      setGuestProfile({
        fullName: String(j.profile?.fullName || ""),
        city: String(j.profile?.city || ""),
        birthDate: birthDateToUi(String(j.profile?.birthDate || "")),
        phone: String(j.profile?.phone || ""),
        email: String(j.profile?.email || ""),
        investExperience: String(j.profile?.investExperience || ""),
        capital: String(j.profile?.capital || ""),
        monthlyIncome: String(j.profile?.monthlyIncome || ""),
        occupation: String(j.profile?.occupation || ""),
        useful: String(j.profile?.useful || ""),
        hobbies: String(j.profile?.hobbies || ""),
        personalRequests: String(j.profile?.personalRequests || ""),
        invests: Array.isArray(j.profile?.invests) ? j.profile.invests : [],
        wantsToInvest: Array.isArray(j.profile?.wantsToInvest) ? j.profile.wantsToInvest : [],
        additional: String(j.profile?.additional || ""),
        socialNetworks: String(j.profile?.socialNetworks || ""),
      });
      setBanyaSubmitAttempted(false);
      setInvestBanyaOptions({
        invests: Array.isArray(j.investmentOptions?.invests) ? j.investmentOptions.invests : [],
        wantsToInvest: Array.isArray(j.investmentOptions?.wantsToInvest) ? j.investmentOptions.wantsToInvest : [],
      });
    } catch (e) {
      setEventsHint(e instanceof Error ? e.message : "Не удалось загрузить анкету для вступления в сообщество ИнвестБаня.");
    } finally {
      setInvestBanyaLoading(false);
    }
  }, [tg]);

  const toggleInvestBanyaMulti = useCallback((key: "invests" | "wantsToInvest", value: string) => {
    if (!value) return;
    setGuestProfile((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((x) => x !== value) : [...current, value],
      };
    });
  }, []);

  const banyaValidation = useMemo(() => {
    const badBirthDate = Boolean(guestProfile.birthDate.trim()) && !normalizeBirthDateForSubmit(guestProfile.birthDate);
    const badCapital = Boolean(guestProfile.capital.trim()) && !normalizeMoneyForSubmit(guestProfile.capital);
    const badMonthlyIncome = Boolean(guestProfile.monthlyIncome.trim()) && !normalizeMoneyForSubmit(guestProfile.monthlyIncome);
    const badPhone = Boolean(guestProfile.phone.trim()) && !normalizePhoneForSubmit(guestProfile.phone);
    const badEmail = Boolean(guestProfile.email.trim()) && !normalizeEmailForSubmit(guestProfile.email);
    const flags = {
      fullName: !guestProfile.fullName.trim(),
      city: !guestProfile.city.trim(),
      birthDate: !guestProfile.birthDate.trim(),
      phone: !guestProfile.phone.trim(),
      email: !guestProfile.email.trim(),
      investExperience: !guestProfile.investExperience.trim(),
      capital: !guestProfile.capital.trim(),
      monthlyIncome: !guestProfile.monthlyIncome.trim(),
      occupation: !guestProfile.occupation.trim(),
      useful: !guestProfile.useful.trim(),
      hobbies: !guestProfile.hobbies.trim(),
      personalRequests: !guestProfile.personalRequests.trim(),
      invests: !guestProfile.invests.length,
      wantsToInvest: !guestProfile.wantsToInvest.length,
    };
    const missingLabels: string[] = [];
    if (flags.fullName) missingLabels.push("ФИО");
    if (flags.city) missingLabels.push("Город");
    if (flags.birthDate) missingLabels.push("День рождения");
    if (flags.phone) missingLabels.push("Номер телефона");
    if (flags.email) missingLabels.push("E-mail");
    if (flags.investExperience) missingLabels.push("Опыт инвестиций");
    if (flags.capital) missingLabels.push("Капитал");
    if (flags.monthlyIncome) missingLabels.push("Доход");
    if (flags.occupation) missingLabels.push("Чем я занимаюсь");
    if (flags.useful) missingLabels.push("Какие у вас есть ресурсы/экспертиза, которые могут быть полезны сообществу?");
    if (flags.hobbies) missingLabels.push("Чем я увлекаюсь");
    if (flags.personalRequests) missingLabels.push("Запрос в клубе");
    if (flags.invests) missingLabels.push("Во что инвестирую");
    if (flags.wantsToInvest) missingLabels.push("Во что хочу инвестировать");
    const formatLabels: string[] = [];
    if (badBirthDate) formatLabels.push("День рождения");
    if (badPhone) formatLabels.push("Номер телефона");
    if (badEmail) formatLabels.push("E-mail");
    if (badCapital) formatLabels.push("Капитал");
    if (badMonthlyIncome) formatLabels.push("Доход");
    return {
      flags,
      hasMissing: missingLabels.length > 0,
      missingLabels,
      formatFlags: {
        birthDate: badBirthDate,
        phone: badPhone,
        email: badEmail,
        capital: badCapital,
        monthlyIncome: badMonthlyIncome,
      },
      hasFormatErrors: formatLabels.length > 0,
      formatLabels,
    };
  }, [guestProfile]);

  const projectValidation = useMemo(() => {
    const videoPitch = projectForm.videoPitch.trim();
    const projectWebsite = projectForm.projectWebsite.trim();
    const projectTg = projectForm.projectTg.trim();
    const badVideoLink = Boolean(videoPitch) && !/^https?:\/\/\S+$/i.test(videoPitch);
    const badProjectWebsite = Boolean(projectWebsite) && !/^https?:\/\/\S+$/i.test(projectWebsite);
    const badProjectTg = Boolean(projectTg) && !/^https?:\/\/\S+$/i.test(projectTg);
    const inn = projectForm.inn.trim().replace(/\s+/g, "");
    const badInn = Boolean(inn) && !/^\d{10}(\d{2})?$/.test(inn);
    const pitchFileTooLarge = projectForm.pitchFiles.some((f) => f.size > MAX_PITCH_FILE_BYTES);
    const finmodelFileTooLarge = projectForm.finmodelFiles.some((f) => f.size > MAX_FINMODEL_FILE_BYTES);
    const tooManyPitchFiles = projectForm.pitchFiles.length > MAX_FILES_PER_FIELD;
    const tooManyFinmodelFiles = projectForm.finmodelFiles.length > MAX_FILES_PER_FIELD;
    return {
      hasMissing: false,
      hasFormatErrors:
        badVideoLink ||
        badProjectWebsite ||
        badProjectTg ||
        badInn ||
        pitchFileTooLarge ||
        finmodelFileTooLarge ||
        tooManyPitchFiles ||
        tooManyFinmodelFiles,
      formatFlags: {
        badVideoLink,
        badProjectWebsite,
        badProjectTg,
        badInn,
        pitchFileTooLarge,
        finmodelFileTooLarge,
        tooManyPitchFiles,
        tooManyFinmodelFiles,
      },
    };
  }, [projectForm]);

  const submitCommunityApply = useCallback(async (kind: CommunityKind) => {
    if (!tg?.initData) {
      setEventsHint("Откройте приложение из Telegram.");
      return;
    }
    setBanyaSubmitAttempted(true);
    if (banyaValidation.hasMissing) {
      setEventsHint("Заполните все обязательные поля в анкете.");
      return;
    }
    if (banyaValidation.hasFormatErrors) {
      setEventsHint("Проверьте формат полей, подсвеченных красным.");
      return;
    }
    const normalizedBirthDate = normalizeBirthDateForSubmit(guestProfile.birthDate);
    const normalizedPhone = normalizePhoneForSubmit(guestProfile.phone);
    const normalizedEmail = normalizeEmailForSubmit(guestProfile.email);
    const normalizedCapital = normalizeMoneyForSubmit(guestProfile.capital);
    const normalizedMonthlyIncome = normalizeMoneyForSubmit(guestProfile.monthlyIncome);
    setGuestProfileSaving(true);
    try {
      const r = await fetch(`/api/app/${kind}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: tg.initData,
          ...guestProfile,
          birthDate: normalizedBirthDate,
          phone: normalizedPhone,
          email: normalizedEmail,
          capital: normalizedCapital,
          monthlyIncome: normalizedMonthlyIncome,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; mode?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || r.statusText || "Не удалось отправить заявку.");
      const successMessage = "Спасибо, ваша заявка отправлена, скоро с вами свяжется менеджер.";
      setEventsHint(successMessage);
      try {
        window.Telegram?.WebApp?.showAlert?.(successMessage);
      } catch {
        // non-blocking UI fallback
      }
      setView("menu");
    } catch (e) {
      setEventsHint(e instanceof Error ? e.message : "Не удалось отправить заявку.");
    } finally {
      setGuestProfileSaving(false);
    }
  }, [banyaValidation.hasMissing, banyaValidation.hasFormatErrors, guestProfile, tg]);

  const submitProjectApply = useCallback(async () => {
    if (!tg?.initData) {
      setEventsHint("Откройте приложение из Telegram.");
      return;
    }
    setProjectSubmitAttempted(true);
    if (projectValidation.formatFlags.badInn) {
      setEventsHint("ИНН должен содержать 10 или 12 цифр.");
      return;
    }
    if (projectValidation.formatFlags.pitchFileTooLarge) {
      setEventsHint("Один из файлов презентации слишком большой. Максимум 20 МБ на файл.");
      return;
    }
    if (projectValidation.formatFlags.finmodelFileTooLarge) {
      setEventsHint("Один из файлов финансовой модели слишком большой. Максимум 20 МБ на файл.");
      return;
    }
    if (projectValidation.formatFlags.tooManyPitchFiles || projectValidation.formatFlags.tooManyFinmodelFiles) {
      setEventsHint(`Можно прикрепить не больше ${MAX_FILES_PER_FIELD} файлов в каждое поле.`);
      return;
    }
    if (projectValidation.hasFormatErrors) {
      setEventsHint("Проверьте формат полей анкеты проекта, подсвеченных красным.");
      return;
    }
    setGuestProfileSaving(true);
    try {
      const pitchFiles = await Promise.all(
        projectForm.pitchFiles.map(async (file) => ({
          name: file.name || "pitch-file",
          base64: await fileToDataUrl(file),
        })),
      );
      const finmodelFiles = await Promise.all(
        projectForm.finmodelFiles.map(async (file) => ({
          name: file.name || "finmodel-file",
          base64: await fileToDataUrl(file),
        })),
      );
      const r = await fetch("/api/app/project/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: tg.initData,
          projectName: projectForm.projectName,
          description: projectForm.description.trim(),
          stage: projectForm.stage,
          timeCommitment: projectForm.timeCommitment,
          cofounders: projectForm.cofounders,
          keyPersons: projectForm.keyPersons,
          pastFailures: projectForm.pastFailures,
          personalInvestment: projectForm.personalInvestment,
          otherProjects: projectForm.otherProjects,
          clientReferences: projectForm.clientReferences,
          competitorsAdvantage: projectForm.competitorsAdvantage,
          founderAbsencePlan: projectForm.founderAbsencePlan,
          unitEconomics: projectForm.unitEconomics,
          legalStructure: projectForm.legalStructure,
          activeLitigation: projectForm.activeLitigation,
          licenses: projectForm.licenses,
          investmentType: projectForm.investmentType,
          fundingAsk: projectForm.fundingAsk,
          valuation: projectForm.valuation,
          exitPlan: projectForm.exitPlan,
          vision3_5_years: projectForm.vision3_5_years,
          biggestRisk: projectForm.biggestRisk,
          failureSignal: projectForm.failureSignal,
          hardestDecision: projectForm.hardestDecision,
          inn: projectForm.inn.trim(),
          whatElse: projectForm.whatElse.trim(),
          minBill: projectForm.minBill.trim(),
          pitchFiles,
          finmodelFiles,
          videoPitch: projectForm.videoPitch.trim(),
          projectWebsite: projectForm.projectWebsite.trim(),
          projectTg: projectForm.projectTg.trim(),
          founderOtherSocials: projectForm.founderOtherSocials,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || r.statusText || "Не удалось отправить анкету проекта.");
      const successMessage = "Спасибо, ваша заявка отправлена, скоро с вами свяжется менеджер.";
      setEventsHint(successMessage);
      try {
        window.Telegram?.WebApp?.showAlert?.(successMessage);
      } catch {
        // non-blocking UI fallback
      }
      setProjectForm(emptyProjectForm());
      setProjectSubmitAttempted(false);
      setView("menu");
    } catch (e) {
      setEventsHint(e instanceof Error ? e.message : "Не удалось отправить анкету проекта.");
    } finally {
      setGuestProfileSaving(false);
    }
  }, [projectForm, projectValidation, tg]);

  const openExternalEventViewer = useCallback((eventId: number) => {
    const safeId = Number(eventId);
    if (!Number.isFinite(safeId)) return;
    setSelectedEventId(safeId);
    setEventsViewerOpen(true);
  }, []);

  useEffect(() => {
    if (view === "events") {
      void loadExternalEvents();
      return;
    }
    if (view === "banya_form") {
      void loadCommunityForm("investbanya");
      return;
    }
    if (view === "gordost_form") {
      void loadCommunityForm("gordost");
      return;
    }
    setEventsViewerOpen(false);
    setSelectedEventId(null);
  }, [view, loadExternalEvents, loadCommunityForm]);

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
    return { monthStartMs, title: monthLabelFromMs(monthStartMs), days };
  }, [events, eventsMonthMs]);

  const selectedEvent = useMemo(() => {
    if (selectedEventId == null) return null;
    return events.find((x) => x.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  return (
    <div className="nonresident-screen">
      <section className="profile-card ref-profile nonresident-card">
        {view === "consult" ? (
          <div className="consult-landing">
            <button type="button" className="btn-ghost consult-back-btn" onClick={() => setView("menu")}>
              ← К возможностям
            </button>

            <article className="consult-hero">
              <img src="/andrey-plakhotnyuk.png" alt="Андрей Плахотнюк" className="consult-photo" />
              <div className="consult-copy">
                <h2>Андрей Плахотнюк</h2>
                <p>
                  За его плечами более ₽5 млрд привлеченного финансирования, 6000+ рассмотренных проектов и два
                  экономических образования. В инвестициях с 2018 года.
                </p>
                <p>
                  Миссия: Помогаю финансово расти людям и компаниям через инвестиции. Превращаю доверие инвесторов в
                  деньги 🫰
                </p>
              </div>
            </article>

            <article className="consult-offer-card">
              <h3>Разовая консультация</h3>
              <p className="consult-meta">Продолжительность: 1-1,5 часа.</p>
              <p>
                Формат ответов на вопросы с общими рекомендациями по стратегии привлечения внешнего финансирования. По
                итогу у вас будет понимание, с каким офером идти к инвестору, что ему предлагать, о чем договариваться
                и где его искать.
              </p>
              <p>
                Андрей также делится своими полезными контактами, иногда организует встречу с заинтересованным
                инвестором из своего окружения.
              </p>
              <button type="button" className="btn-primary" onClick={openGordostCommunity}>
                Подать заявку
              </button>
            </article>

            <article className="consult-offer-card">
              <h3>Эдвайзинг (член консультативного совета)</h3>
              <p>
                Advisor (эдвайзер) - это профессиональный советник и стратегический партнер, помогающий компании
                решить ряд вопросов, на которые у команды не хватает компетенции.
              </p>
              <p>
                Эдвайзер может принести знания, помочь в развитии нужных навыков, обогатить своим нетворком, дать
                другой взгляд на ситуации, подсветить имеющиеся проблемы и подсказать возможные решения.
              </p>
              <p>
                Формат взаимодействия подбирается индивидуально - от еженедельных до ежемесячных встреч
                продолжительностью от 15 минут до нескольких часов, в зависимости от текущих потребностей стартапа и
                личной доступности.
              </p>
              <button type="button" className="btn-primary" onClick={openGordostCommunity}>
                Подать заявку
              </button>
            </article>
          </div>
        ) : view === "guest_profile" ? (
          <div className="consult-landing">
            <button type="button" className="btn-ghost consult-back-btn" onClick={() => setView("events")}>
              ← К мероприятиям
            </button>
            <h2 className="nonresident-page-title">ЗАПОЛНИТЕ ПРОФИЛЬ ДЛЯ УЧАСТИЯ</h2>
            <div className="consult-offer-card">
              {guestProfileSubmitAttempted && (guestProfileValidation.hasMissing || guestProfileValidation.hasFormatErrors) ? (
                <div className="form-warning" role="alert">
                  {guestProfileValidation.hasMissing
                    ? "Не все поля заполнены. Пожалуйста, заполните обязательные поля, отмеченные красным."
                    : "Проверьте формат полей, отмеченных красным."}
                </div>
              ) : null}
              <label className={`field-label ${guestProfileSubmitAttempted && guestProfileValidation.flags.fullName ? "is-invalid-label" : ""}`.trim()}>
                ФИО
              </label>
              <input
                className={`field-input ${guestProfileSubmitAttempted && guestProfileValidation.flags.fullName ? "is-invalid" : ""}`.trim()}
                value={guestProfile.fullName}
                onChange={(e) => setGuestProfile((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Иванов Иван Иванович"
                maxLength={120}
              />
              <label className={`field-label ${guestProfileSubmitAttempted && guestProfileValidation.flags.city ? "is-invalid-label" : ""}`.trim()}>
                Город
              </label>
              <CityAutocomplete
                value={guestProfile.city}
                onChange={(city) => setGuestProfile((p) => ({ ...p, city }))}
                className={`field-input ${guestProfileSubmitAttempted && guestProfileValidation.flags.city ? "is-invalid" : ""}`.trim()}
                placeholder="Начните вводить город"
              />
              <label
                className={`field-label ${guestProfileSubmitAttempted && (guestProfileValidation.flags.phone || guestProfileValidation.formatFlags.phone) ? "is-invalid-label" : ""}`.trim()}
              >
                Номер телефона
              </label>
              <input
                className={`field-input ${guestProfileSubmitAttempted && (guestProfileValidation.flags.phone || guestProfileValidation.formatFlags.phone) ? "is-invalid" : ""}`.trim()}
                inputMode="tel"
                value={guestProfile.phone}
                onChange={(e) =>
                  setGuestProfile((p) => ({
                    ...p,
                    phone: e.target.value.replace(/[^\d+\-\s()]/g, ""),
                  }))
                }
                placeholder="+7..."
                maxLength={24}
              />
              <label
                className={`field-label ${guestProfileSubmitAttempted && (guestProfileValidation.flags.email || guestProfileValidation.formatFlags.email) ? "is-invalid-label" : ""}`.trim()}
              >
                E-mail
              </label>
              <input
                className={`field-input ${guestProfileSubmitAttempted && (guestProfileValidation.flags.email || guestProfileValidation.formatFlags.email) ? "is-invalid" : ""}`.trim()}
                type="email"
                inputMode="email"
                value={guestProfile.email}
                onChange={(e) => setGuestProfile((p) => ({ ...p, email: e.target.value.trim().toLowerCase() }))}
                placeholder="name@example.com"
                maxLength={120}
              />
              <label className={`field-label ${guestProfileSubmitAttempted && guestProfileValidation.flags.investExperience ? "is-invalid-label" : ""}`.trim()}>
                Опыт инвестиций
              </label>
              <textarea
                className={`field-input field-textarea ${guestProfileSubmitAttempted && guestProfileValidation.flags.investExperience ? "is-invalid" : ""}`.trim()}
                value={guestProfile.investExperience}
                onChange={(e) => setGuestProfile((p) => ({ ...p, investExperience: e.target.value }))}
                maxLength={1200}
              />
              <label className={`field-label ${guestProfileSubmitAttempted && guestProfileValidation.flags.occupation ? "is-invalid-label" : ""}`.trim()}>
                Чем я занимаюсь
              </label>
              <textarea
                className={`field-input field-textarea ${guestProfileSubmitAttempted && guestProfileValidation.flags.occupation ? "is-invalid" : ""}`.trim()}
                value={guestProfile.occupation}
                onChange={(e) => setGuestProfile((p) => ({ ...p, occupation: e.target.value }))}
                maxLength={1200}
              />
              <label className={`field-label ${guestProfileSubmitAttempted && guestProfileValidation.flags.hobbies ? "is-invalid-label" : ""}`.trim()}>
                Чем я увлекаюсь
              </label>
              <textarea
                className={`field-input field-textarea ${guestProfileSubmitAttempted && guestProfileValidation.flags.hobbies ? "is-invalid" : ""}`.trim()}
                value={guestProfile.hobbies}
                onChange={(e) => setGuestProfile((p) => ({ ...p, hobbies: e.target.value }))}
                maxLength={1200}
              />
              <button type="button" className="btn-primary" disabled={guestProfileSaving} onClick={() => void saveGuestProfile()}>
                {guestProfileSaving ? "Сохраняем..." : "Сохранить профиль"}
              </button>
            </div>
            {eventsHint ? <p className="stats-line">{eventsHint}</p> : null}
          </div>
        ) : view === "gordost_landing" ? (
          <div className="consult-landing">
            <button type="button" className="btn-ghost consult-back-btn" onClick={() => setView("menu")}>
              ← К возможностям
            </button>
            <article className="consult-offer-card banya-landing-card">
              <img src="/join-club.png" alt="Клуб Гордость" className="banya-landing-photo" />
              <h2 className="nonresident-page-title banya-landing-title">Клуб Гордость</h2>
              <p>
                Закрытое инвестиционное сообщество предпринимателей и инвесторов. Участникам доступны нетворкинг,
                мероприятия, сделки, поддержка и развитие инвестиционных компетенций.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setEventsHint(null);
                  setBanyaSubmitAttempted(false);
                  setView("gordost_form");
                }}
              >
                Вступить
              </button>
            </article>
            {eventsHint ? <p className="stats-line">{eventsHint}</p> : null}
          </div>
        ) : view === "project_landing" ? (
          <div className="consult-landing">
            <button type="button" className="btn-ghost consult-back-btn" onClick={() => setView("menu")}>
              ← К возможностям
            </button>
            <article className="consult-offer-card banya-landing-card">
              <img src="/invest-card.png" alt="Привлечь инвестиции в проект" className="banya-landing-photo" />
              <h2 className="nonresident-page-title banya-landing-title">Привлечь инвестиции в свой проект</h2>
              <p>
                Если у вас есть проект, в который вы хотите привлечь финансирование, вы можете заполнить форму ниже, и
                ваш проект попадет к нам на оценку. В случае прохождения положительного скоринга, мы пригласим вас на
                Инвестиционный Комитет выступить с презентацией проекта перед инвесторами.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setEventsHint(null);
                  setProjectSubmitAttempted(false);
                  setProjectForm(emptyProjectForm());
                  setView("project_form");
                }}
              >
                Заполнить анкету
              </button>
            </article>
            {eventsHint ? <p className="stats-line">{eventsHint}</p> : null}
          </div>
        ) : view === "banya_landing" ? (
          <div className="consult-landing">
            <button type="button" className="btn-ghost consult-back-btn" onClick={() => setView("menu")}>
              ← К возможностям
            </button>
            <article className="consult-offer-card banya-landing-card">
              <img src="/investbanya-landing-photo.png" alt="Сообщество ИнвестБаня" className="banya-landing-photo" />
              <h2 className="nonresident-page-title banya-landing-title">Сообщество ИнвестБаня</h2>
              <p>
                Сообщество, которое объединяет инвесторов из совершенно разных сфер:
              </p>
              <ul className="banya-spheres">
                <li>— фондовый рынок, IPO, OTC;</li>
                <li>— недвижимость, земельные участки;</li>
                <li>— криптовалюты и NFT;</li>
                <li>— займы, венчур и инвестиции в бизнес;</li>
                <li>— доходное движимое имущество;</li>
                <li>— торги по банкротству;</li>
                <li>— монеты, банкноты, произведения искусства, антиквариат и др.</li>
              </ul>
              <p>Наша миссия: объединять опыт инвесторов для увеличения дохода через нетворкинг.</p>
              <p>Наш лозунг: Не парься - инвестируй!</p>
              <p>Наша основная ценность: сообщество является площадкой для обмена опытом между инвесторами. Мы предоставляем возможность оказаться в окружении инвесторов-единомышленников и получить профит от нетворкинга с ними.</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setEventsHint(null);
                  setBanyaSubmitAttempted(false);
                  setView("banya_form");
                }}
              >
                Вступить
              </button>
            </article>
            {eventsHint ? <p className="stats-line">{eventsHint}</p> : null}
          </div>
          ) : view === "project_form" ? (
          <div className="consult-landing">
            <button type="button" className="btn-ghost consult-back-btn" onClick={() => setView("project_landing")}>
              ← К описанию
            </button>
            <h2 className="nonresident-page-title">Анкета проекта</h2>
            <div className="consult-offer-card">
              {projectSubmitAttempted && projectValidation.hasFormatErrors ? (
                <div className="form-warning" role="alert">
                  Проверьте формат полей, отмеченных красным.
                </div>
              ) : null}

              {/* ── О проекте ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">О проекте</h3>
                <div className="pf-field">
                  <label className="field-label">Название проекта</label>
                  <input className="field-input" value={projectForm.projectName} onChange={(e) => setProjectForm((p) => ({ ...p, projectName: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Описание проекта</label>
                  <textarea className="field-input field-textarea field-textarea-scroll" rows={4} value={projectForm.description} onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Стадия проекта</label>
                  <select className="field-input" value={projectForm.stage} onChange={(e) => setProjectForm((p) => ({ ...p, stage: e.target.value }))}>
                    <option value="">Не выбрано</option>
                    <option value="идея">идея</option>
                    <option value="MVP">MVP</option>
                    <option value="выручка">выручка</option>
                    <option value="масштаб">масштаб</option>
                  </select>
                </div>
                <div className="pf-field">
                  <label className="field-label">Сколько времени в неделю уделяете проекту</label>
                  <input className="field-input" value={projectForm.timeCommitment} onChange={(e) => setProjectForm((p) => ({ ...p, timeCommitment: e.target.value }))} />
                </div>
              </div>

              {/* ── Команда ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Команда и роли</h3>
                <div className="pf-field">
                  <label className="field-label">Есть ли партнёры по бизнесу</label>
                  <textarea className="field-input field-textarea" value={projectForm.cofounders} onChange={(e) => setProjectForm((p) => ({ ...p, cofounders: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Какую роль вы играете и кто закрывает остальные направления</label>
                  <textarea className="field-input field-textarea" value={projectForm.keyPersons} onChange={(e) => setProjectForm((p) => ({ ...p, keyPersons: e.target.value }))} />
                </div>
              </div>

              {/* ── Опыт ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Опыт и наличие других проектов</h3>
                <div className="pf-field">
                  <label className="field-label">Был ли опыт запуска бизнеса раньше</label>
                  <textarea className="field-input field-textarea" value={projectForm.pastFailures} onChange={(e) => setProjectForm((p) => ({ ...p, pastFailures: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Сколько собственных средств вложено</label>
                  <input className="field-input" value={projectForm.personalInvestment} onChange={(e) => setProjectForm((p) => ({ ...p, personalInvestment: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Есть ли другие проекты прямо сейчас</label>
                  <textarea className="field-input field-textarea" value={projectForm.otherProjects} onChange={(e) => setProjectForm((p) => ({ ...p, otherProjects: e.target.value }))} />
                </div>
              </div>

              {/* ── Рынок ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Рынок и клиенты</h3>
                <div className="pf-field">
                  <label className="field-label">Как вы нашли первых клиентов</label>
                  <textarea className="field-input field-textarea" value={projectForm.clientReferences} onChange={(e) => setProjectForm((p) => ({ ...p, clientReferences: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Почему клиенты выбирают вас</label>
                  <textarea className="field-input field-textarea" value={projectForm.competitorsAdvantage} onChange={(e) => setProjectForm((p) => ({ ...p, competitorsAdvantage: e.target.value }))} />
                </div>
              </div>

              {/* ── Операции ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Операционная модель</h3>
                <div className="pf-field">
                  <label className="field-label">Что произойдёт с проектом если вы выпадете на месяц</label>
                  <textarea className="field-input field-textarea" value={projectForm.founderAbsencePlan} onChange={(e) => setProjectForm((p) => ({ ...p, founderAbsencePlan: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Какие технологии используете и почему</label>
                  <textarea className="field-input field-textarea" value={projectForm.unitEconomics} onChange={(e) => setProjectForm((p) => ({ ...p, unitEconomics: e.target.value }))} />
                </div>
              </div>

              {/* ── Юридическое ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Юридическая информация</h3>
                <div className="pf-field">
                  <label className="field-label">Юридическая структура</label>
                  <input className="field-input" value={projectForm.legalStructure} onChange={(e) => setProjectForm((p) => ({ ...p, legalStructure: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className={`field-label ${projectSubmitAttempted && projectValidation.formatFlags.badInn ? "is-invalid-label" : ""}`.trim()}>ИНН</label>
                  <input className={`field-input ${projectSubmitAttempted && projectValidation.formatFlags.badInn ? "is-invalid" : ""}`.trim()} value={projectForm.inn} onChange={(e) => setProjectForm((p) => ({ ...p, inn: e.target.value }))} placeholder="10 или 12 цифр" inputMode="numeric" />
                </div>
                <div className="pf-field">
                  <label className="field-label">Судебные разбирательства</label>
                  <input className="field-input" value={projectForm.activeLitigation} onChange={(e) => setProjectForm((p) => ({ ...p, activeLitigation: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Какие разрешения нужны и что получено</label>
                  <textarea className="field-input field-textarea" value={projectForm.licenses} onChange={(e) => setProjectForm((p) => ({ ...p, licenses: e.target.value }))} />
                </div>
              </div>

              {/* ── Инвестиции ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Инвестиционные условия</h3>
                <div className="pf-field">
                  <label className="field-label">Условия для инвесторов</label>
                  <input className="field-input" value={projectForm.investmentType} onChange={(e) => setProjectForm((p) => ({ ...p, investmentType: e.target.value }))} />
                </div>
                <div className="pf-row">
                  <div className="pf-field">
                    <label className="field-label">Сумма привлечения</label>
                    <input className="field-input" value={projectForm.fundingAsk} onChange={(e) => setProjectForm((p) => ({ ...p, fundingAsk: e.target.value }))} />
                  </div>
                  <div className="pf-field">
                    <label className="field-label">Оценка проекта</label>
                    <input className="field-input" value={projectForm.valuation} onChange={(e) => setProjectForm((p) => ({ ...p, valuation: e.target.value }))} />
                  </div>
                </div>
                <div className="pf-field">
                  <label className="field-label">Сумма минимального чека от одного инвестора</label>
                  <input className="field-input" value={projectForm.minBill} onChange={(e) => setProjectForm((p) => ({ ...p, minBill: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Как инвестор может вернуть вложения</label>
                  <textarea className="field-input field-textarea" value={projectForm.exitPlan} onChange={(e) => setProjectForm((p) => ({ ...p, exitPlan: e.target.value }))} />
                </div>
              </div>

              {/* ── Стратегия и риски ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Стратегия и риски</h3>
                <div className="pf-field">
                  <label className="field-label">Развитие проекта через 3-5 лет</label>
                  <textarea className="field-input field-textarea" value={projectForm.vision3_5_years} onChange={(e) => setProjectForm((p) => ({ ...p, vision3_5_years: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Что беспокоит в проекте</label>
                  <textarea className="field-input field-textarea" value={projectForm.biggestRisk} onChange={(e) => setProjectForm((p) => ({ ...p, biggestRisk: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">От чего зависит успех</label>
                  <textarea className="field-input field-textarea" value={projectForm.failureSignal} onChange={(e) => setProjectForm((p) => ({ ...p, failureSignal: e.target.value }))} />
                </div>
                <div className="pf-field">
                  <label className="field-label">Что-то шло не по плану? Как справлялись?</label>
                  <textarea className="field-input field-textarea" value={projectForm.hardestDecision} onChange={(e) => setProjectForm((p) => ({ ...p, hardestDecision: e.target.value }))} />
                </div>
              </div>

              {/* ── Дополнительно ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Дополнительно</h3>
                <div className="pf-field">
                  <label className="field-label">Что ещё нам нужно знать о проекте перед инвестированием</label>
                  <textarea className="field-input field-textarea field-textarea-scroll" rows={4} value={projectForm.whatElse} onChange={(e) => setProjectForm((p) => ({ ...p, whatElse: e.target.value }))} />
                </div>
              </div>

              {/* ── Файлы ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Документы</h3>
                <ProjectFileDropzone
                  label="Презентация проекта"
                  files={projectForm.pitchFiles}
                  maxBytes={MAX_PITCH_FILE_BYTES}
                  maxFiles={MAX_FILES_PER_FIELD}
                  invalid={
                    projectSubmitAttempted &&
                    (projectValidation.formatFlags.pitchFileTooLarge || projectValidation.formatFlags.tooManyPitchFiles)
                  }
                  onChange={(pitchFiles) => setProjectForm((p) => ({ ...p, pitchFiles }))}
                  onError={setEventsHint}
                />
                <ProjectFileDropzone
                  label="Финансовая модель"
                  files={projectForm.finmodelFiles}
                  maxBytes={MAX_FINMODEL_FILE_BYTES}
                  maxFiles={MAX_FILES_PER_FIELD}
                  invalid={
                    projectSubmitAttempted &&
                    (projectValidation.formatFlags.finmodelFileTooLarge || projectValidation.formatFlags.tooManyFinmodelFiles)
                  }
                  onChange={(finmodelFiles) => setProjectForm((p) => ({ ...p, finmodelFiles }))}
                  onError={setEventsHint}
                />
              </div>

              {/* ── Ссылки ── */}
              <div className="pf-section">
                <h3 className="pf-section-title">Ссылки</h3>
                <div className="pf-field">
                  <label className={`field-label ${projectSubmitAttempted && projectValidation.formatFlags.badVideoLink ? "is-invalid-label" : ""}`.trim()}>Ссылка на видео-питч</label>
                  <input className={`field-input ${projectSubmitAttempted && projectValidation.formatFlags.badVideoLink ? "is-invalid" : ""}`.trim()} value={projectForm.videoPitch} onChange={(e) => setProjectForm((p) => ({ ...p, videoPitch: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="pf-field">
                  <label className={`field-label ${projectSubmitAttempted && projectValidation.formatFlags.badProjectWebsite ? "is-invalid-label" : ""}`.trim()}>Сайт проекта</label>
                  <input className={`field-input ${projectSubmitAttempted && projectValidation.formatFlags.badProjectWebsite ? "is-invalid" : ""}`.trim()} value={projectForm.projectWebsite} onChange={(e) => setProjectForm((p) => ({ ...p, projectWebsite: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="pf-field">
                  <label className={`field-label ${projectSubmitAttempted && projectValidation.formatFlags.badProjectTg ? "is-invalid-label" : ""}`.trim()}>Telegram проекта</label>
                  <input className={`field-input ${projectSubmitAttempted && projectValidation.formatFlags.badProjectTg ? "is-invalid" : ""}`.trim()} value={projectForm.projectTg} onChange={(e) => setProjectForm((p) => ({ ...p, projectTg: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="pf-field">
                  <label className="field-label">Соцсети основателя</label>
                  <textarea className="field-input field-textarea" value={projectForm.founderOtherSocials} onChange={(e) => setProjectForm((p) => ({ ...p, founderOtherSocials: e.target.value }))} />
                </div>
              </div>

              <button type="button" className="pf-submit" disabled={guestProfileSaving} onClick={() => void submitProjectApply()}>
                {guestProfileSaving ? "Отправляем..." : "Отправить заявку"}
              </button>
            </div>
            {eventsHint ? <p className="stats-line">{eventsHint}</p> : null}
          </div>
        ) : view === "banya_form" || view === "gordost_form" ? (
          <div className="consult-landing">
            <button
              type="button"
              className="btn-ghost consult-back-btn"
              onClick={() => setView(view === "gordost_form" ? "gordost_landing" : "banya_landing")}
            >
              ← К описанию сообщества
            </button>
            <h2 className="nonresident-page-title">{view === "gordost_form" ? "Анкета в Клуб Гордость" : "Анкета для вступления в сообщество ИнвестБаня"}</h2>
            <div className="consult-offer-card">
              {investBanyaLoading ? <p className="stats-line">Загрузка анкеты...</p> : null}
              {banyaSubmitAttempted && (banyaValidation.hasMissing || banyaValidation.hasFormatErrors) ? (
                <div className="form-warning" role="alert">
                  {banyaValidation.hasMissing
                    ? "Не все поля заполнены. Пожалуйста, заполните все обязательные поля, отмеченные красным."
                    : "Проверьте формат полей, отмеченных красным."}
                </div>
              ) : null}
              <label className={`field-label ${banyaSubmitAttempted && banyaValidation.flags.fullName ? "is-invalid-label" : ""}`.trim()}>ФИО</label>
              <input
                className={`field-input ${banyaSubmitAttempted && banyaValidation.flags.fullName ? "is-invalid" : ""}`.trim()}
                value={guestProfile.fullName}
                onChange={(e) => setGuestProfile((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Иванов Иван Иванович"
              />
              <label className={`field-label ${banyaSubmitAttempted && banyaValidation.flags.city ? "is-invalid-label" : ""}`.trim()}>Город</label>
              <CityAutocomplete
                value={guestProfile.city}
                onChange={(city) => setGuestProfile((p) => ({ ...p, city }))}
                className={`field-input ${banyaSubmitAttempted && banyaValidation.flags.city ? "is-invalid" : ""}`.trim()}
                placeholder="Начните вводить город"
              />
              <label
                className={`field-label ${banyaSubmitAttempted && (banyaValidation.flags.phone || banyaValidation.formatFlags.phone) ? "is-invalid-label" : ""}`.trim()}
              >
                Номер телефона
              </label>
              <input
                className={`field-input ${banyaSubmitAttempted && (banyaValidation.flags.phone || banyaValidation.formatFlags.phone) ? "is-invalid" : ""}`.trim()}
                inputMode="tel"
                value={guestProfile.phone}
                onChange={(e) =>
                  setGuestProfile((p) => ({
                    ...p,
                    phone: e.target.value.replace(/[^\d+\-\s()]/g, ""),
                  }))
                }
                placeholder="+7..."
                maxLength={24}
              />
              <label
                className={`field-label ${banyaSubmitAttempted && (banyaValidation.flags.email || banyaValidation.formatFlags.email) ? "is-invalid-label" : ""}`.trim()}
              >
                E-mail
              </label>
              <input
                className={`field-input ${banyaSubmitAttempted && (banyaValidation.flags.email || banyaValidation.formatFlags.email) ? "is-invalid" : ""}`.trim()}
                type="email"
                inputMode="email"
                value={guestProfile.email}
                onChange={(e) => setGuestProfile((p) => ({ ...p, email: e.target.value.trim().toLowerCase() }))}
                placeholder="name@example.com"
                maxLength={120}
              />
              <label className={`field-label ${banyaSubmitAttempted && banyaValidation.flags.investExperience ? "is-invalid-label" : ""}`.trim()}>
                Опыт инвестиций
              </label>
              <textarea
                className={`field-input field-textarea ${banyaSubmitAttempted && banyaValidation.flags.investExperience ? "is-invalid" : ""}`.trim()}
                value={guestProfile.investExperience}
                onChange={(e) => setGuestProfile((p) => ({ ...p, investExperience: e.target.value }))}
              />
              <label
                className={`field-label ${banyaSubmitAttempted && (banyaValidation.flags.birthDate || banyaValidation.formatFlags.birthDate) ? "is-invalid-label" : ""}`.trim()}
              >
                День рождения
              </label>
              <input
                className={`field-input ${banyaSubmitAttempted && (banyaValidation.flags.birthDate || banyaValidation.formatFlags.birthDate) ? "is-invalid" : ""}`.trim()}
                value={guestProfile.birthDate}
                onChange={(e) => setGuestProfile((p) => ({ ...p, birthDate: e.target.value }))}
                onBlur={(e) => setGuestProfile((p) => ({ ...p, birthDate: birthDateToUi(e.target.value) }))}
                placeholder="ДД/ММ/ГГГГ"
              />
              <label
                className={`field-label ${banyaSubmitAttempted && (banyaValidation.flags.capital || banyaValidation.formatFlags.capital) ? "is-invalid-label" : ""}`.trim()}
              >
                Капитал
              </label>
              <input
                className={`field-input ${banyaSubmitAttempted && (banyaValidation.flags.capital || banyaValidation.formatFlags.capital) ? "is-invalid" : ""}`.trim()}
                value={guestProfile.capital}
                onChange={(e) => setGuestProfile((p) => ({ ...p, capital: e.target.value }))}
                placeholder="0"
              />
              <label
                className={`field-label ${banyaSubmitAttempted && (banyaValidation.flags.monthlyIncome || banyaValidation.formatFlags.monthlyIncome) ? "is-invalid-label" : ""}`.trim()}
              >
                Доход (в месяц)
              </label>
              <input
                className={`field-input ${banyaSubmitAttempted && (banyaValidation.flags.monthlyIncome || banyaValidation.formatFlags.monthlyIncome) ? "is-invalid" : ""}`.trim()}
                value={guestProfile.monthlyIncome}
                onChange={(e) => setGuestProfile((p) => ({ ...p, monthlyIncome: e.target.value }))}
                placeholder="0"
              />
              <label className={`field-label ${banyaSubmitAttempted && banyaValidation.flags.occupation ? "is-invalid-label" : ""}`.trim()}>
                Чем я занимаюсь
              </label>
              <textarea
                className={`field-input field-textarea ${banyaSubmitAttempted && banyaValidation.flags.occupation ? "is-invalid" : ""}`.trim()}
                value={guestProfile.occupation}
                onChange={(e) => setGuestProfile((p) => ({ ...p, occupation: e.target.value }))}
              />
              <label className={`field-label ${banyaSubmitAttempted && banyaValidation.flags.useful ? "is-invalid-label" : ""}`.trim()}>
                Какие у вас есть ресурсы/экспертиза, которые могут быть полезны сообществу?
              </label>
              <textarea
                className={`field-input field-textarea ${banyaSubmitAttempted && banyaValidation.flags.useful ? "is-invalid" : ""}`.trim()}
                value={guestProfile.useful}
                onChange={(e) => setGuestProfile((p) => ({ ...p, useful: e.target.value }))}
              />
              <label className={`field-label ${banyaSubmitAttempted && banyaValidation.flags.hobbies ? "is-invalid-label" : ""}`.trim()}>
                Чем я увлекаюсь
              </label>
              <textarea
                className={`field-input field-textarea ${banyaSubmitAttempted && banyaValidation.flags.hobbies ? "is-invalid" : ""}`.trim()}
                value={guestProfile.hobbies}
                onChange={(e) => setGuestProfile((p) => ({ ...p, hobbies: e.target.value }))}
              />
              <label className={`field-label ${banyaSubmitAttempted && banyaValidation.flags.personalRequests ? "is-invalid-label" : ""}`.trim()}>
                Запрос в клубе
              </label>
              <textarea
                className={`field-input field-textarea ${banyaSubmitAttempted && banyaValidation.flags.personalRequests ? "is-invalid" : ""}`.trim()}
                value={guestProfile.personalRequests}
                onChange={(e) => setGuestProfile((p) => ({ ...p, personalRequests: e.target.value }))}
              />
              <label className="field-label">
                Что еще вы бы хотели рассказать о себе?
              </label>
              <textarea
                className="field-input field-textarea"
                value={guestProfile.additional || ""}
                onChange={(e) => setGuestProfile((p) => ({ ...p, additional: e.target.value }))}
              />
              <label className="field-label">
                Укажите ссылки на ваши социальные сети
              </label>
              <textarea
                className="field-input field-textarea"
                value={guestProfile.socialNetworks || ""}
                onChange={(e) => setGuestProfile((p) => ({ ...p, socialNetworks: e.target.value }))}
              />
              <label className={`profile-section-label ${banyaSubmitAttempted && banyaValidation.flags.invests ? "is-invalid-label" : ""}`.trim()}>
                Во что инвестирую
              </label>
              <div className={`chip-list profile-chip-list ${banyaSubmitAttempted && banyaValidation.flags.invests ? "is-invalid-chip-list" : ""}`.trim()}>
                {investBanyaOptions.invests.map((option) => (
                  <button
                    key={`banya-inv-${option}`}
                    type="button"
                    className={`chip-btn ${guestProfile.invests.includes(option) ? "active" : ""}`}
                    onClick={() => toggleInvestBanyaMulti("invests", option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {!investBanyaOptions.invests.length ? <p className="stats-line">Список направлений пока пуст.</p> : null}
              <label className={`profile-section-label ${banyaSubmitAttempted && banyaValidation.flags.wantsToInvest ? "is-invalid-label" : ""}`.trim()}>
                Во что хочу инвестировать
              </label>
              <div className={`chip-list profile-chip-list ${banyaSubmitAttempted && banyaValidation.flags.wantsToInvest ? "is-invalid-chip-list" : ""}`.trim()}>
                {investBanyaOptions.wantsToInvest.map((option) => (
                  <button
                    key={`banya-want-${option}`}
                    type="button"
                    className={`chip-btn ${guestProfile.wantsToInvest.includes(option) ? "active" : ""}`}
                    onClick={() => toggleInvestBanyaMulti("wantsToInvest", option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {!investBanyaOptions.wantsToInvest.length ? <p className="stats-line">Список направлений пока пуст.</p> : null}
              <button
                type="button"
                className="btn-primary"
                disabled={guestProfileSaving || investBanyaLoading}
                onClick={() => void submitCommunityApply(view === "gordost_form" ? "gordost" : "investbanya")}
              >
                {guestProfileSaving ? "Отправляем..." : "Отправить заявку"}
              </button>
            </div>
            {eventsHint ? <p className="stats-line">{eventsHint}</p> : null}
          </div>
        ) : view === "events" ? (
          <div className="consult-landing">
            <button type="button" className="btn-ghost consult-back-btn" onClick={() => setView("menu")}>
              ← К возможностям
            </button>
            <h2 className="nonresident-page-title">КАЛЕНДАРЬ ОТКРЫТЫХ МЕРОПРИЯТИЙ</h2>
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
                        onClick={() => openExternalEventViewer(cell.eventId as number)}
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

            {eventsLoading ? <p className="stats-line">Загрузка событий...</p> : null}
            {eventsHint ? <p className="stats-line">{eventsHint}</p> : null}

            <div className="list-wrap">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => openExternalEventViewer(ev.id)}
                  className="list-item event-item"
                >
                  <div className="item-copy">
                    <strong>{ev.title}</strong>
                    {ev.myStatus ? <span className="my-event-badge">Мое событие</span> : null}
                    {ev.externalPrice ? <span>◆ {ev.externalPrice}₽</span> : <span>Бесплатно</span>}
                    <span>{fmtDate(ev.startsAt)}</span>
                  </div>
                  <div className="event-counter">{ev.capacity ? `${ev.occupied}/${ev.capacity}` : ev.occupied}</div>
                </button>
              ))}
            </div>

            {!events.length && !eventsLoading ? <p className="stats-line">Пока нет доступных мероприятий.</p> : null}
          </div>
        ) : (
          <>
            <h1 className="nonresident-page-title">ВОЗМОЖНОСТИ ДЛЯ ГОСТЕЙ ИНВЕСТИЦИОННОГО КЛУБА ГОРДОСТЬ</h1>

            <button
              key={joinCard.key}
              type="button"
              className={`btn-ghost useful-item-btn nonresident-useful-item nonresident-useful-item--featured nonresident-useful-item--${joinCard.key}`}
              onClick={() => {
                setEventsHint(null);
                setBanyaSubmitAttempted(false);
                setView("gordost_landing");
              }}
            >
              <img src={joinCard.image} alt="" className="useful-item-img nonresident-useful-img" aria-hidden />
              <span className="useful-item-copy">
                <strong>{joinCard.title}</strong>
                {joinCard.subtitle ? <span>{joinCard.subtitle}</span> : null}
              </span>
            </button>

            <div className="nonresident-useful-grid">
              {otherCards.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`btn-ghost useful-item-btn nonresident-useful-item nonresident-useful-item--${c.key}`}
                  onClick={() => {
                    if (c.key === "consult") {
                      setView("consult");
                      return;
                    }
                    if (c.key === "events") {
                      setView("events");
                      return;
                    }
                    if (c.key === "banya") {
                      setEventsHint(null);
                      setView("banya_landing");
                      return;
                    }
                    if (c.key === "invest") {
                      setEventsHint(null);
                      setProjectSubmitAttempted(false);
                      setView("project_landing");
                      return;
                    }
                  }}
                >
                  <img src={c.image} alt="" className="useful-item-img nonresident-useful-img" aria-hidden />
                  <span className="useful-item-copy">
                    <strong>{c.title}</strong>
                    {c.subtitle ? <span>{c.subtitle}</span> : null}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {view === "menu" ? (
        <footer className="nonresident-footer">
          <p className="hint-line nonresident-footer-text">Уже с нами, но видите этот экран?</p>
          <button type="button" className="btn-ghost nonresident-footer-link" onClick={openGordostCommunity}>
            Свяжитесь с @gordost_community
          </button>
        </footer>
      ) : null}

      {view === "events" && eventsViewerOpen && selectedEvent ? (
        <div className="viewer-backdrop" onClick={() => setEventsViewerOpen(false)}>
          <div className="viewer-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="viewer-close" onClick={() => setEventsViewerOpen(false)} aria-label="Закрыть">
              ✕
            </button>
            <div className="viewer-body">
              <article className="detail-card">
                {selectedEvent.imageUrl ? <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="media-image" /> : null}
                <h3>{selectedEvent.title}</h3>
                <p className="detail-muted">{fmtDate(selectedEvent.startsAt)}</p>
                {selectedEvent.location ? (
                  <p>
                    <b>Локация:</b> {selectedEvent.location}
                  </p>
                ) : null}
                {selectedEvent.externalPrice ? (
                  <p>
                    ◆ {selectedEvent.externalPrice}₽
                  </p>
                ) : (
                  <p>
                    Бесплатно
                  </p>
                )}
                {selectedEvent.description ? <p className="event-description">{selectedEvent.description}</p> : null}
                <div className="actions-row">
                  <button
                    type="button"
                    onClick={() => void registerExternalEvent(selectedEvent.id, selectedEvent.myStatus ? "cancel" : "register")}
                    className="btn-primary"
                  >
                    {selectedEvent.myStatus ? "Передумать" : "Записаться"}
                  </button>
                  {selectedEvent.link ? (
                    <button type="button" onClick={() => openEventLink(selectedEvent.link)} className="btn-ghost">
                      Открыть ссылку
                    </button>
                  ) : null}
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

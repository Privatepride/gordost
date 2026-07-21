import fs from "node:fs";
import path from "node:path";

export type Profile = {
  displayName: string;
  phone: string;
  notes: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
  updatedAt: string;
};

export type Resident = { id: string; name: string; unit?: string; note?: string };

export type ClubEvent = {
  id: string;
  title: string;
  startsAt: string;
  description: string;
  capacity: number;
};

export type Registration = { eventId: string; userId: number; at: string };

export type AppDb = {
  profiles: Record<string, Profile>;
  residents: Resident[];
  events: ClubEvent[];
  registrations: Registration[];
};

const defaultProfile = (): Profile => ({
  displayName: "",
  phone: "",
  notes: "",
  privacyConsent: false,
  marketingConsent: false,
  updatedAt: "",
});

function seedIfEmpty(db: AppDb) {
  if (db.residents.length === 0) {
    db.residents = [
      { id: "r1", name: "Иванова А.Е.", unit: "кв. 12", note: "Председатель совета" },
      { id: "r2", name: "Петров Д.С.", unit: "кв. 7" },
      { id: "r3", name: "Смирнова М.К.", unit: "пентхаус 1" },
    ];
  }
  if (db.events.length === 0) {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 3);
    d1.setHours(19, 0, 0, 0);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 10);
    d2.setHours(11, 0, 0, 0);
    db.events = [
      {
        id: "e1",
        title: "Завтрак резидентов",
        startsAt: d1.toISOString(),
        description: "Общий стол, дресс-код smart casual.",
        capacity: 24,
      },
      {
        id: "e2",
        title: "Экскурсия по клубу",
        startsAt: d2.toISOString(),
        description: "Для новых резидентов и гостей.",
        capacity: 12,
      },
    ];
  }
}

let cached: AppDb | null = null;

export function dataFilePath(): string {
  const raw = process.env.DATA_FILE || "";
  if (raw) return path.resolve(raw);
  return path.join(process.cwd(), "data", "gordost.json");
}

export function loadDb(): AppDb {
  if (cached) return cached;
  const file = dataFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) {
    cached = { profiles: {}, residents: [], events: [], registrations: [] };
    seedIfEmpty(cached);
    saveDb(cached);
    return cached;
  }
  const raw = fs.readFileSync(file, "utf8");
  const parsed = JSON.parse(raw) as AppDb;
  if (!parsed.profiles) parsed.profiles = {};
  if (!Array.isArray(parsed.residents)) parsed.residents = [];
  if (!Array.isArray(parsed.events)) parsed.events = [];
  if (!Array.isArray(parsed.registrations)) parsed.registrations = [];
  seedIfEmpty(parsed);
  cached = parsed;
  return cached;
}

export function saveDb(db: AppDb = loadDb()) {
  const file = dataFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
}

export function profileFor(userId: number): Profile {
  const db = loadDb();
  const key = String(userId);
  if (!db.profiles[key]) {
    db.profiles[key] = defaultProfile();
    saveDb(db);
  }
  return db.profiles[key];
}

export function consentFor(userId: number): { privacyConsent: boolean; marketingConsent: boolean } {
  const p = profileFor(userId);
  return {
    privacyConsent: Boolean(p.privacyConsent),
    marketingConsent: Boolean(p.marketingConsent),
  };
}

export function setConsent(userId: number, field: "privacyConsent" | "marketingConsent", value: boolean) {
  const db = loadDb();
  const key = String(userId);
  if (!db.profiles[key]) db.profiles[key] = defaultProfile();
  db.profiles[key][field] = Boolean(value);
  db.profiles[key].updatedAt = new Date().toISOString();
  saveDb(db);
}

export function setProfileField(userId: number, field: keyof Pick<Profile, "displayName" | "phone" | "notes">, value: string) {
  const db = loadDb();
  const key = String(userId);
  if (!db.profiles[key]) db.profiles[key] = defaultProfile();
  db.profiles[key][field] = value.trim();
  db.profiles[key].updatedAt = new Date().toISOString();
  saveDb(db);
}

export function countRegistrations(eventId: string): number {
  return loadDb().registrations.filter((r) => r.eventId === eventId).length;
}

export function isUserRegistered(eventId: string, userId: number): boolean {
  return loadDb().registrations.some((r) => r.eventId === eventId && r.userId === userId);
}

export function registerForEvent(eventId: string, userId: number): "ok" | "full" | "exists" | "missing" {
  const db = loadDb();
  const ev = db.events.find((e) => e.id === eventId);
  if (!ev) return "missing";
  if (db.registrations.some((r) => r.eventId === eventId && r.userId === userId)) return "exists";
  const n = db.registrations.filter((r) => r.eventId === eventId).length;
  if (n >= ev.capacity) return "full";
  db.registrations.push({ eventId, userId, at: new Date().toISOString() });
  saveDb(db);
  return "ok";
}

export function unregisterForEvent(eventId: string, userId: number): "cancelled" | "missing" {
  const db = loadDb();
  const idx = db.registrations.findIndex((r) => r.eventId === eventId && r.userId === userId);
  if (idx < 0) return "missing";
  db.registrations.splice(idx, 1);
  saveDb(db);
  return "cancelled";
}

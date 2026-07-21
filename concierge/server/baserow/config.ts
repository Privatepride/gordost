/** Совпадает с воркфлоу n8n «консьерж» (см. Code: events handler / Baserow-ноды). */
export type BaserowRuntimeConfig = {
  enabled: boolean;
  apiUrl: string;
  token: string;
  tableResidents: number;
  tableProjects: number;
  fieldTelegramId: number;
  fieldUsername: number;
  tableEvents: number;
  tableRegistrations: number;
  fieldRegEvent: number;
  fieldRegResident: number;
};

export function loadBaserowConfig(): BaserowRuntimeConfig | null {
  const token = (process.env.BASEROW_API_TOKEN || "").trim();
  const apiUrl = (process.env.BASEROW_API_URL || "https://base.gordost.club").trim().replace(/\/$/, "");
  if (!token) return null;
  const num = (v: string | undefined, d: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };
  return {
    enabled: true,
    apiUrl,
    token,
    tableResidents: num(process.env.BASEROW_TABLE_RESIDENTS, 597),
    tableProjects: num(process.env.BASEROW_TABLE_PROJECTS, 850),
    fieldTelegramId: num(process.env.BASEROW_FIELD_TELEGRAM_ID, 5563),
    fieldUsername: num(process.env.BASEROW_FIELD_USERNAME, 5564),
    tableEvents: num(process.env.BASEROW_TABLE_EVENTS, 838),
    tableRegistrations: num(process.env.BASEROW_TABLE_REGISTRATIONS, 839),
    fieldRegEvent: num(process.env.BASEROW_FIELD_REG_EVENT, 7790),
    fieldRegResident: num(process.env.BASEROW_FIELD_REG_RESIDENT, 7791),
  };
}

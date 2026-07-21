const ESPO_API_BASE = String(process.env.ESPO_API_BASE || "https://crm.gordost.club/api/v1")
  .trim()
  .replace(/\/$/, "");
const ESPO_API_KEY = String(process.env.ESPO_API_KEY || "").trim();
const ESPO_COMPANY = String(process.env.ESPO_COMPANY || "1").trim();
/** If set to "0", do not POST a new Contact when invite bind succeeds and no match exists. */
const ESPO_AUTO_CREATE_ON_INVITE = String(process.env.ESPO_AUTO_CREATE_ON_INVITE ?? "1").trim() !== "0";

export async function findEspoContactIdByField(attribute: string, value: string): Promise<string> {
  if (!ESPO_API_KEY || !value) return "";
  const params = new URLSearchParams();
  params.set("maxSize", "1");
  params.set("where[0][type]", "equals");
  params.set("where[0][attribute]", attribute);
  params.set("where[0][value]", value);
  const url = `${ESPO_API_BASE}/Contact?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": ESPO_API_KEY,
      "X-Company": ESPO_COMPANY,
      Accept: "application/json",
    },
  });
  if (!res.ok) return "";
  const json = (await res.json().catch(() => ({}))) as { list?: Array<{ id?: string }> };
  const id = String(json.list?.[0]?.id || "").trim();
  return id;
}

async function findEspoContactIdByNamePair(firstName: string, lastName: string): Promise<string> {
  if (!ESPO_API_KEY || !firstName || !lastName) return "";
  const params = new URLSearchParams();
  params.set("maxSize", "1");
  params.set("where[0][type]", "equals");
  params.set("where[0][attribute]", "firstName");
  params.set("where[0][value]", firstName);
  params.set("where[1][type]", "equals");
  params.set("where[1][attribute]", "lastName");
  params.set("where[1][value]", lastName);
  const url = `${ESPO_API_BASE}/Contact?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": ESPO_API_KEY,
      "X-Company": ESPO_COMPANY,
      Accept: "application/json",
    },
  });
  if (!res.ok) return "";
  const json = (await res.json().catch(() => ({}))) as { list?: Array<{ id?: string }> };
  const id = String(json.list?.[0]?.id || "").trim();
  return id;
}

export async function resolveEspoContactIdFallback(
  telegramId: string,
  telegramUsername: string,
  firstName: string,
  lastName: string,
): Promise<string> {
  const uname = telegramUsername.replace(/^@/, "").trim();
  const tgDigits = telegramId.replace(/\D/g, "");
  const candidates: Array<[string, string]> = [];
  if (uname) {
    candidates.push(["cTelegramID", `@${uname}`], ["cTelegramID", uname]);
  }
  if (tgDigits) candidates.push(["cTelegramID", tgDigits]);
  if (firstName) candidates.push(["firstName", firstName]);
  if (lastName) candidates.push(["lastName", lastName]);
  for (const [attr, val] of candidates) {
    const id = await findEspoContactIdByField(attr, val);
    if (id) return id;
  }
  return "";
}

/**
 * Strict duplicate resolver for application submits:
 * 1) exact TG match (username or numeric id variants)
 * 2) exact firstName+lastName pair match
 */
export async function resolveEspoContactDuplicateId(
  telegramId: string,
  telegramUsername: string,
  firstName: string,
  lastName: string,
): Promise<string> {
  const uname = String(telegramUsername || "").replace(/^@/, "").trim();
  const tgDigits = String(telegramId || "").replace(/\D/g, "");
  const exactTelegramCandidates: string[] = [];
  if (uname) exactTelegramCandidates.push(`@${uname}`, uname);
  if (tgDigits) exactTelegramCandidates.push(tgDigits);
  for (const value of exactTelegramCandidates) {
    const id = await findEspoContactIdByField("cTelegramID", value);
    if (id) return id;
  }
  const fn = String(firstName || "").trim();
  const ln = String(lastName || "").trim();
  if (fn && ln) {
    const id = await findEspoContactIdByNamePair(fn, ln);
    if (id) return id;
  }
  return "";
}

async function createEspoContact(payload: Record<string, unknown>): Promise<string> {
  if (!ESPO_API_KEY) return "";
  const res = await fetch(`${ESPO_API_BASE}/Contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ESPO_API_KEY,
      "X-Company": ESPO_COMPANY,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.warn("EspoCRM create Contact failed:", res.status, t.slice(0, 400));
    return "";
  }
  const j = (await res.json().catch(() => ({}))) as { id?: string };
  return String(j.id || "").trim();
}

/**
 * Resolve existing Espo Contact by Telegram / name, or create one when invite onboarding should work without a pre-seeded CRM row.
 */
export async function findOrCreateEspoContactId(
  telegramUserId: number,
  telegramUsername: string,
  firstName: string,
  lastName: string,
): Promise<string> {
  const uname = String(telegramUsername || "").replace(/^@/, "").trim();
  const fn = String(firstName || "").trim();
  const ln = String(lastName || "").trim();
  const existing = await resolveEspoContactIdFallback(String(telegramUserId), uname, fn, ln);
  if (existing) return existing;
  if (!ESPO_AUTO_CREATE_ON_INVITE || !ESPO_API_KEY) return "";
  const cTelegramID = uname ? `@${uname}` : String(telegramUserId);
  return createEspoContact({
    firstName: fn || "Telegram",
    lastName: ln || "User",
    cTelegramID,
  });
}

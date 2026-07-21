import type { BaserowRuntimeConfig } from "./config.js";

export type BaserowRow = Record<string, unknown> & { id?: number };

function qs(entries: Record<string, string | number | undefined | null>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(entries)) {
    if (v === undefined || v === null) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

// Повторять ли запрос при данной ошибке: сетевой сбой (fetch failed),
// 5xx (временная проблема сервера) или 429 (слишком много запросов).
// 4xx НЕ ретраим — это значимые ответы (404, 403 и т.п.).
function isTransientNetworkError(err: unknown, status: number | undefined): boolean {
  if (status !== undefined && (status >= 500 || status === 429)) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("fetch failed") || msg.includes("timeout") || msg.includes("econnreset")) return true;
  }
  return false;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function brFetch<T>(
  cfg: BaserowRuntimeConfig,
  method: string,
  path: string,
  search: Record<string, string | number | undefined | null> = {},
  body?: unknown,
): Promise<T> {
  const url = `${cfg.apiUrl}${path}${qs({ user_field_names: "true", ...search })}`;
  const MAX_ATTEMPTS = 3; // 1 основной + 2 повтора
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const headers: Record<string, string> = { Authorization: `Token ${cfg.token}` };
    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_ATTEMPTS && isTransientNetworkError(e, undefined)) {
        await sleep(400 * attempt);
        continue;
      }
      throw new Error(`Baserow ${method} ${path}: сеть (${attempt}/${MAX_ATTEMPTS}): ${(e as Error).message}`);
    }
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // Тело не JSON — обычно признак 5xx/прокси-ошибки; ретраим, если статус транзитный.
      if (attempt < MAX_ATTEMPTS && isTransientNetworkError(null, res.status)) {
        await sleep(400 * attempt);
        continue;
      }
      throw new Error(`Baserow ${method} ${path}: не JSON (${res.status})`);
    }
    if (!res.ok) {
      const detail = typeof json === "object" && json && "error" in json ? JSON.stringify(json) : text.slice(0, 400);
      if (attempt < MAX_ATTEMPTS && isTransientNetworkError(null, res.status)) {
        await sleep(400 * attempt);
        continue;
      }
      throw new Error(`Baserow ${method} ${path}: HTTP ${res.status} ${detail}`);
    }
    return json as T;
  }
  throw lastErr instanceof Error ? lastErr : new Error(`Baserow ${method} ${path}: исчерпаны попытки`);
}

export async function listRows(
  cfg: BaserowRuntimeConfig,
  tableId: number,
  extra: Record<string, string | number | undefined | null> = {},
): Promise<BaserowRow[]> {
  const r = await brFetch<{ results?: BaserowRow[] }>(cfg, "GET", `/api/database/rows/table/${tableId}/`, {
    size: 200,
    ...extra,
  });
  return Array.isArray(r.results) ? r.results : [];
}

export async function patchRow(cfg: BaserowRuntimeConfig, tableId: number, rowId: number, fields: Record<string, unknown>) {
  return brFetch(cfg, "PATCH", `/api/database/rows/table/${tableId}/${rowId}/`, {}, fields);
}

export async function createRow(cfg: BaserowRuntimeConfig, tableId: number, fields: Record<string, unknown>) {
  return brFetch(cfg, "POST", `/api/database/rows/table/${tableId}/`, {}, fields);
}

export async function listTableFields(cfg: BaserowRuntimeConfig, tableId: number): Promise<Record<string, unknown>[]> {
  const fields = await brFetch<unknown>(cfg, "GET", `/api/database/fields/table/${tableId}/`);
  return Array.isArray(fields) ? (fields as Record<string, unknown>[]) : [];
}

export async function uploadUserFile(
  cfg: BaserowRuntimeConfig,
  fileName: string,
  fileBuffer: Buffer,
  mimeType = "application/octet-stream",
): Promise<Record<string, unknown>> {
  const url = `${cfg.apiUrl}/api/user-files/upload-file/`;
  const form = new FormData();
  form.set("file", new Blob([fileBuffer as unknown as BlobPart], { type: mimeType }), fileName);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Token ${cfg.token}` },
    body: form,
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Baserow POST /api/user-files/upload-file/: не JSON (${res.status})`);
  }
  if (!res.ok) {
    const detail = typeof json === "object" && json && "error" in json ? JSON.stringify(json) : text.slice(0, 400);
    throw new Error(`Baserow POST /api/user-files/upload-file/: HTTP ${res.status} ${detail}`);
  }
  const payload = Array.isArray(json) ? json[0] : json;
  if (!payload || typeof payload !== "object" || typeof (payload as Record<string, unknown>).name !== "string") {
    throw new Error("Baserow upload: неожиданный ответ без name.");
  }
  return payload as Record<string, unknown>;
}

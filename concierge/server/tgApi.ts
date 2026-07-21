type TgOk<T> = { ok: true; result: T };
type TgErr = { ok: false; description?: string; error_code?: number };
export type TgResponse<T> = TgOk<T> | TgErr;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Повторять ли запрос при сетевом сбое или 5xx/429 от Telegram API.
// 4xx (400/403/404 и т.п.) НЕ ретраим — это значимые ответы, повтор ничего не изменит.
function isTransient(e: unknown, status: number): boolean {
  if (status === 429 || status >= 500) return true;
  if (e instanceof Error) {
    const m = e.message.toLowerCase();
    if (m.includes("fetch failed") || m.includes("timeout") || m.includes("econnreset")) return true;
  }
  return false;
}

export async function tgCall<T>(botToken: string, method: string, body: Record<string, unknown>): Promise<TgResponse<T>> {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  const MAX_ATTEMPTS = 3; // 1 основной + 2 повтора
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (attempt < MAX_ATTEMPTS && isTransient(e, 0)) {
        await sleep(400 * attempt);
        continue;
      }
      throw e;
    }
    // 5xx/429 — временная проблема Telegram, ретраим.
    if (attempt < MAX_ATTEMPTS && (res.status === 429 || res.status >= 500)) {
      await sleep(400 * attempt);
      continue;
    }
    return (await res.json()) as TgResponse<T>;
  }
  // На практике сюда не доходим: либо вернули ответ, либо бросили после последней попытки.
  throw new Error(`tgCall ${method}: исчерпаны попытки`);
}

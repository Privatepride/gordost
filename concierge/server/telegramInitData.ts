import crypto from "node:crypto";

/**
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  try {
    return timingSafeEqualHex(calculated, hash);
  } catch {
    return false;
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function parseUserFromInitData(initData: string): { id: number; username?: string } | null {
  const params = new URLSearchParams(initData);
  const raw = params.get("user");
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as { id?: number; username?: string };
    if (typeof u.id !== "number") return null;
    return { id: u.id, username: u.username };
  } catch {
    return null;
  }
}

const VIRUSTOTAL_API_KEY = String(process.env.VIRUSTOTAL_API_KEY || "").trim();
const VIRUSTOTAL_REQUIRED = String(process.env.VIRUSTOTAL_REQUIRED || "").trim() === "1";

const VT_UPLOAD_URL = "https://www.virustotal.com/api/v3/files";
const VT_ANALYSIS_URL = "https://www.virustotal.com/api/v3/analyses";

type VtAnalysisAttributes = {
  status?: string;
  stats?: {
    malicious?: number;
    suspicious?: number;
  };
};

function vtEnabled(): boolean {
  return Boolean(VIRUSTOTAL_API_KEY);
}

async function vtJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "x-apikey": VIRUSTOTAL_API_KEY,
    },
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`VirusTotal: не JSON (${res.status})`);
  }
  if (!res.ok) {
    const detail =
      typeof json === "object" && json && "error" in json
        ? JSON.stringify((json as { error?: unknown }).error)
        : text.slice(0, 300);
    throw new Error(`VirusTotal HTTP ${res.status}: ${detail}`);
  }
  return json as T;
}

async function waitForVtAnalysis(analysisId: string): Promise<VtAnalysisAttributes> {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const payload = await vtJson<{ data?: { attributes?: VtAnalysisAttributes } }>(
      `${VT_ANALYSIS_URL}/${encodeURIComponent(analysisId)}`,
    );
    const attrs = payload.data?.attributes;
    const status = String(attrs?.status || "").toLowerCase();
    if (status === "completed") return attrs || {};
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  throw new Error("VirusTotal: превышено время ожидания проверки файла.");
}

export async function scanFileForThreats(bytes: Buffer, fileName: string): Promise<void> {
  if (!vtEnabled()) {
    if (VIRUSTOTAL_REQUIRED) {
      throw new Error("Проверка файлов на вирусы не настроена на сервере.");
    }
    return;
  }

  const form = new FormData();
  form.set("file", new Blob([bytes as unknown as BlobPart]), fileName || "upload.bin");

  const uploadPayload = await vtJson<{ data?: { id?: string } }>(VT_UPLOAD_URL, {
    method: "POST",
    body: form,
  });
  const analysisId = String(uploadPayload.data?.id || "").trim();
  if (!analysisId) {
    throw new Error("VirusTotal: не получен id анализа.");
  }

  const attrs = await waitForVtAnalysis(analysisId);
  const malicious = Number(attrs.stats?.malicious || 0);
  const suspicious = Number(attrs.stats?.suspicious || 0);
  if (malicious > 0 || suspicious > 0) {
    throw new Error(
      `Файл «${fileName || "без имени"}» не прошёл проверку безопасности (${malicious} вредоносных, ${suspicious} подозрительных срабатываний).`,
    );
  }
}

export function virusScanConfigured(): boolean {
  return vtEnabled();
}

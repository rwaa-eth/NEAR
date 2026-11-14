import type { IncomingHttpHeaders } from "node:http";

/** Spanish- and Portuguese-speaking countries in Latin America. */
const LATAM = new Set([
  "AR",
  "BO",
  "BR",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "GT",
  "HN",
  "MX",
  "NI",
  "PA",
  "PE",
  "PR",
  "PY",
  "SV",
  "UY",
  "VE",
]);

const countryCache = new Map<string, { code: string | null; at: number }>();
const CACHE_MS = 60 * 60 * 1000;

export function isLatamCountry(code: string | null | undefined): boolean {
  if (!code) return false;
  return LATAM.has(code.trim().toUpperCase());
}

export function countryFromHeaders(headers: IncomingHttpHeaders): string | null {
  const raw = headers["cf-ipcountry"] ?? headers["x-vercel-ip-country"];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase() ?? "";
  if (!/^[A-Z]{2}$/.test(value) || value === "XX" || value === "T1") return null;
  return value;
}

export function clientAddress(headers: IncomingHttpHeaders, fallback: string): string {
  const connecting = headers["cf-connecting-ip"];
  const direct = (Array.isArray(connecting) ? connecting[0] : connecting)?.trim();
  if (direct) return direct;
  const forwarded = headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || fallback;
}

export function isLocalAddress(ip: string): boolean {
  const host = ip.replace(/^::ffff:/i, "").toLowerCase();
  if (host === "::1" || host === "0.0.0.0") return true;
  if (host.startsWith("127.") || host.startsWith("10.") || host.startsWith("192.168.")) return true;
  const pieces = host.split(".").map((part) => Number(part));
  return pieces.length === 4 && pieces[0] === 172 && pieces[1] >= 16 && pieces[1] <= 31;
}

export async function visitorCountry(ip: string, headerCountry: string | null): Promise<string | null> {
  if (headerCountry) return headerCountry;
  const host = ip.replace(/^::ffff:/i, "");
  if (isLocalAddress(host)) return null;
  const cached = countryCache.get(host);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.code;
  let code: string | null = null;
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(host)}`, { signal: AbortSignal.timeout(4000) });
    const body = (await response.json()) as { success?: boolean; country_code?: string };
    if (body.success !== false && body.country_code && /^[A-Za-z]{2}$/.test(body.country_code)) {
      code = body.country_code.toUpperCase();
    }
  } catch {
    code = null;
  }
  countryCache.set(host, { code, at: Date.now() });
  return code;
}

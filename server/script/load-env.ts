import fs from "node:fs";
import path from "node:path";

export function loadEnvFile(): void {
  const file = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    const comment = value.search(/\s+#/);
    if (comment >= 0) value = value.slice(0, comment).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

export function operatorKey(): `0x${string}` {
  const raw = (process.env.ESCROW_OPERATOR_KEY ?? "").trim();
  const key = raw.startsWith("0x") || raw.startsWith("0X") ? raw : `0x${raw}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error("Set ESCROW_OPERATOR_KEY in server/.env to the funded Base Sepolia private key.");
  }
  return key as `0x${string}`;
}

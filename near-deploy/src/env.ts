import fs from "node:fs";
import path from "node:path";

const serverEnvFile = path.join(__dirname, "..", "..", "server", ".env");
const nearServerEnvFile = path.join(__dirname, "..", "..", "near-server", ".env");

function loadEnvFile(file: string): void {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`);
  }
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

export function loadServerEnv(): void {
  loadEnvFile(serverEnvFile);
}

export function loadNearServerEnv(): void {
  loadEnvFile(nearServerEnvFile);
}

export function nearTokenAccount(): string {
  const token = (process.env.NEAR_TOKEN_ACCOUNT ?? "").trim();
  if (!/^[a-z0-9._-]{2,64}$/.test(token)) {
    throw new Error("Set NEAR_TOKEN_ACCOUNT in near-server/.env to the NEP-141 account id.");
  }
  return token;
}

export function operatorKey(): `0x${string}` {
  const raw = (process.env.ESCROW_OPERATOR_KEY ?? "").trim();
  const key = raw.startsWith("0x") || raw.startsWith("0X") ? raw : `0x${raw}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error("Set ESCROW_OPERATOR_KEY in server/.env to the Base Sepolia private key.");
  }
  return key as `0x${string}`;
}

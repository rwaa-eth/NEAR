import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../src/config";
import { callView, mintToken } from "../src/near";

function loadEnvFile(): void {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] === undefined) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

function toUnits(text: string, decimals: number): string {
  if (!/^\d+(\.\d+)?$/.test(text)) throw new Error("Amount must be a number of USDT.");
  const [whole, frac = ""] = text.split(".");
  if (frac.length > decimals) throw new Error("Too many decimal places.");
  const units = BigInt(whole + frac.padEnd(decimals, "0"));
  if (units <= 0n) throw new Error("Amount must be greater than zero.");
  return units.toString();
}

function formatUnits(amount: string, decimals: number): string {
  const digits = amount.replace(/\D/g, "").padStart(decimals + 1, "0");
  const whole = digits.slice(0, -decimals);
  const frac = digits.slice(-decimals).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}

async function main(): Promise<void> {
  loadEnvFile();
  const accountId = (process.argv[2] ?? "").trim().toLowerCase();
  const amountText = (process.argv[3] ?? "1000").trim();
  const named = /^[a-z0-9][a-z0-9._-]{0,62}\.(near|testnet)$/.test(accountId);
  const implicit = /^[0-9a-f]{64}$/.test(accountId);
  if (!named && !implicit) {
    throw new Error("Usage: npm run fund -- account.testnet [amount]");
  }
  const config = loadConfig();
  const amount = toUnits(amountText, config.tokenDecimals);
  const outcome = await mintToken(config, accountId, amount);
  const balance = await callView(config.nearRpcUrl, config.tokenAccount, "ft_balance_of", {
    account_id: accountId,
  });
  const shown = typeof balance === "string" ? formatUnits(balance, config.tokenDecimals) : balance;
  console.log(`minted ${amountText} ${config.tokenSymbol} to ${accountId}`);
  console.log(`balance ${shown} ${config.tokenSymbol}`);
  console.log(outcome.transaction?.hash ?? "");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

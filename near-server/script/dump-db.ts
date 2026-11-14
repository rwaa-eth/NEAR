import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

function loadEnvFile(file: string): void {
  if (!fs.existsSync(file)) throw new Error(`Env file not found: ${file}`);
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] === undefined) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

function formatUnits(amount: string, decimals: number): string {
  const negative = amount.trim().startsWith("-");
  const digits = amount.replace(/\D/g, "").padStart(decimals + 1, "0");
  const whole = digits.slice(0, -decimals);
  const frac = digits.slice(-decimals).replace(/0+$/, "");
  const text = frac ? `${whole}.${frac}` : whole;
  return negative ? `-${text}` : text;
}

function cell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

type Row = Record<string, unknown>;

function tableExists(db: Database.Database, name: string): boolean {
  const row = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name);
  return Boolean(row);
}

function rows(db: Database.Database, name: string, sql: string): Row[] {
  if (!tableExists(db, name)) return [];
  return db.prepare(sql).all() as Row[];
}

const arg = process.argv[2];
const envFile = !arg || arg.endsWith(".env") || path.basename(arg).startsWith(".env") ? path.resolve(arg ?? ".env") : "";
if (envFile) loadEnvFile(envFile);

const sqlitePath = path.resolve(arg && arg.endsWith(".sqlite") ? arg : (process.env.SQLITE_PATH ?? "data/rwaa.sqlite"));
const network = (process.env.NEAR_NETWORK ?? (sqlitePath.includes("testnet") ? "testnet" : "mainnet")).toLowerCase();
const decimals = Number(process.env.TOKEN_DECIMALS ?? "6");
const safeDecimals = Number.isInteger(decimals) && decimals >= 0 && decimals <= 24 ? decimals : 6;
const explorer = network === "testnet" ? "https://testnet.nearblocks.io" : "https://nearblocks.io";

if (!fs.existsSync(sqlitePath)) throw new Error(`Database not found: ${sqlitePath}`);

const db = new Database(sqlitePath, { readonly: true, fileMustExist: true });

const accounts = rows(
  db,
  "near_accounts",
  "SELECT email, account_id, public_key, created_at FROM near_accounts ORDER BY created_at, email",
);
const transfers = rows(
  db,
  "escrow_deposits",
  `SELECT created_at, sender_email, sender_address, recipient_email, amount, tx_hash, log_index,
          deposit_id, unlock_at, claimed_at, claim_tx, refunded_at, refund_tx
   FROM escrow_deposits
   ORDER BY created_at, id`,
);
const bridges = rows(
  db,
  "bridge_sends",
  `SELECT created_at, sender_email, sender_address, recipient, label, amount, tx_hash,
          deposit_address, status, completed_at
   FROM bridge_sends
   ORDER BY created_at, id`,
);

function transferKind(row: Row): string {
  if (row.refunded_at) return "refunded";
  if (row.deposit_id != null && !row.claimed_at) return "escrow-pending";
  if (row.deposit_id != null) return "escrow-claimed";
  if (row.claimed_at) return "direct";
  return "recorded";
}

console.log(`database\t${sqlitePath}`);
console.log(`network\t${network}`);
console.log(`accounts\t${accounts.length}`);
console.log(`transfers\t${transfers.length}`);
console.log(`bridges\t${bridges.length}`);

console.log("\n# accounts");
if (accounts.length === 0) console.log("(none)");
accounts.forEach((row, index) => {
  console.log(`\n${index + 1}`);
  console.log(`email\t${cell(row.email)}`);
  console.log(`account\t${cell(row.account_id)}`);
  console.log(`public_key\t${cell(row.public_key)}`);
  console.log(`created_at\t${cell(row.created_at)}`);
  console.log(`explorer\t${explorer}/address/${cell(row.account_id)}`);
});

console.log("\n# transfers");
if (transfers.length === 0) console.log("(none)");
transfers.forEach((row, index) => {
  console.log(`\n${index + 1}\t${transferKind(row)}`);
  console.log(`created_at\t${cell(row.created_at)}`);
  console.log(`from\t${cell(row.sender_email)}`);
  console.log(`from_address\t${cell(row.sender_address)}`);
  console.log(`to\t${cell(row.recipient_email)}`);
  console.log(`amount\t${formatUnits(cell(row.amount), safeDecimals)} USDT`);
  console.log(`amount_raw\t${cell(row.amount)}`);
  console.log(`tx\t${cell(row.tx_hash)}`);
  console.log(`explorer\t${row.tx_hash ? `${explorer}/txns/${row.tx_hash}` : "-"}`);
  console.log(`log_index\t${cell(row.log_index)}`);
  console.log(`deposit_id\t${cell(row.deposit_id)}`);
  console.log(`unlock_at\t${cell(row.unlock_at)}`);
  console.log(`claimed_at\t${cell(row.claimed_at)}`);
  console.log(`claim_tx\t${cell(row.claim_tx)}`);
  console.log(`refunded_at\t${cell(row.refunded_at)}`);
  console.log(`refund_tx\t${cell(row.refund_tx)}`);
});

console.log("\n# bridges");
if (bridges.length === 0) console.log("(none)");
bridges.forEach((row, index) => {
  console.log(`\n${index + 1}\t${cell(row.status)}`);
  console.log(`created_at\t${cell(row.created_at)}`);
  console.log(`from\t${cell(row.sender_email)}`);
  console.log(`from_address\t${cell(row.sender_address)}`);
  console.log(`to\t${cell(row.recipient)}`);
  console.log(`label\t${cell(row.label)}`);
  console.log(`amount\t${formatUnits(cell(row.amount), safeDecimals)} USDT`);
  console.log(`amount_raw\t${cell(row.amount)}`);
  console.log(`tx\t${cell(row.tx_hash)}`);
  console.log(`explorer\t${row.tx_hash ? `${explorer}/txns/${row.tx_hash}` : "-"}`);
  console.log(`deposit_address\t${cell(row.deposit_address)}`);
  console.log(`completed_at\t${cell(row.completed_at)}`);
});

db.close();

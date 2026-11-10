import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../src/config";
import { openDatabase } from "../src/db";
import { issueSignupKey } from "../src/signupKey";

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

loadEnvFile();
const config = loadConfig();
const db = openDatabase(config.sqlitePath);
const issued = issueSignupKey(db);
console.log(`${issued.seq}\t${issued.code}`);
db.close();

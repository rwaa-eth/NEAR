import fs from "node:fs";
import path from "node:path";
import { buildApp } from "./app";
import { loadConfig } from "./config";
import { ensureTokenStorage } from "./near";

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

async function main(): Promise<void> {
  loadEnvFile();
  const config = loadConfig();
  const app = buildApp(config);
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`RWAA NEAR API listening on ${config.port}`);
  if (config.escrowAccount) {
    ensureTokenStorage(config, config.escrowAccount).catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

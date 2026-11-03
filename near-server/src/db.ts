import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type Db = Database.Database;

export function openDatabase(sqlitePath: string): Db {
  if (sqlitePath !== ":memory:") {
    fs.mkdirSync(path.dirname(path.resolve(sqlitePath)), { recursive: true });
  }
  const db = new Database(sqlitePath);
  if (sqlitePath !== ":memory:") db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS credentials (
      credential_id TEXT PRIMARY KEY,
      public_key BLOB NOT NULL,
      compressed_key BLOB NOT NULL,
      public_key_near TEXT NOT NULL,
      near_account_id TEXT NOT NULL UNIQUE,
      sign_count INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      nonce BLOB NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS parcels (
      id TEXT PRIMARY KEY,
      owner_account_id TEXT NOT NULL,
      ring_json TEXT NOT NULL,
      geometry_rev TEXT NOT NULL DEFAULT '',
      min_lat REAL NOT NULL,
      max_lat REAL NOT NULL,
      min_lng REAL NOT NULL,
      max_lng REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS homes (
      owner_account_id TEXT PRIMARY KEY,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_m REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS near_accounts (
      email TEXT PRIMARY KEY,
      account_id TEXT NOT NULL UNIQUE,
      public_key TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS email_otps (
      email TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS email_sessions (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS escrow_deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      email_hash TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      sender_address TEXT NOT NULL,
      amount TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      claimed_at TEXT,
      claim_tx TEXT,
      deposit_id INTEGER,
      unlock_at TEXT,
      refunded_at TEXT,
      refund_tx TEXT,
      UNIQUE(tx_hash, log_index)
    );
    CREATE TABLE IF NOT EXISTS presence_samples (
      id TEXT PRIMARY KEY,
      owner_account_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy_m REAL NOT NULL,
      at_home TEXT NOT NULL,
      recorded_at TEXT NOT NULL
    );
  `);
  const parcelColumns = db.prepare("PRAGMA table_info(parcels)").all() as Array<{ name: string }>;
  if (!parcelColumns.some((column) => column.name === "geometry_rev")) {
    db.exec("ALTER TABLE parcels ADD COLUMN geometry_rev TEXT NOT NULL DEFAULT ''");
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS parcels_owner_account ON parcels(owner_account_id)");
  db.exec("CREATE INDEX IF NOT EXISTS escrow_recipient ON escrow_deposits(recipient_email)");
  db.exec("CREATE INDEX IF NOT EXISTS escrow_sender ON escrow_deposits(sender_email)");
  const escrowColumns = db.prepare("PRAGMA table_info(escrow_deposits)").all() as Array<{ name: string }>;
  const ensureEscrowColumn = (name: string, ddl: string) => {
    if (!escrowColumns.some((column) => column.name === name)) db.exec(ddl);
  };
  ensureEscrowColumn("deposit_id", "ALTER TABLE escrow_deposits ADD COLUMN deposit_id INTEGER");
  ensureEscrowColumn("unlock_at", "ALTER TABLE escrow_deposits ADD COLUMN unlock_at TEXT");
  ensureEscrowColumn("refunded_at", "ALTER TABLE escrow_deposits ADD COLUMN refunded_at TEXT");
  ensureEscrowColumn("refund_tx", "ALTER TABLE escrow_deposits ADD COLUMN refund_tx TEXT");
  return db;
}

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
  return db;
}

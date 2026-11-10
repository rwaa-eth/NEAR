import { randomBytes } from "node:crypto";
import type { Db } from "./db";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export type InviteCode = {
  seq: number;
  code: string;
  createdAt: string;
};

function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let code = "";
  for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length];
  return code;
}

export function normalizeSignupKey(code: string): string {
  return code.toUpperCase().replace(/[^A-Z]/g, "");
}

/** Next invite code in issuance order. The row exists only until an account uses it. */
export function issueSignupKey(db: Db): InviteCode {
  const issue = db.transaction(() => {
    const row = db.prepare("SELECT COALESCE(MAX(seq), 0) AS seq FROM invite_codes").get() as { seq: number };
    const seq = row.seq + 1;
    const createdAt = new Date().toISOString();
    let code = randomCode(8);
    while (db.prepare("SELECT seq FROM invite_codes WHERE code = ?").get(code)) code = randomCode(8);
    db.prepare("INSERT INTO invite_codes (seq, code, created_at) VALUES (?, ?, ?)").run(seq, code, createdAt);
    return { seq, code, createdAt };
  });
  return issue();
}

export function signupKeyAvailable(db: Db, code: string): boolean {
  const row = db.prepare("SELECT seq FROM invite_codes WHERE code = ?").get(normalizeSignupKey(code)) as
    | { seq: number }
    | undefined;
  return Boolean(row);
}

/** Delete the code. The caller puts it back if account creation does not finish. */
export function consumeSignupKey(db: Db, code: string): InviteCode {
  const normalized = normalizeSignupKey(code);
  const row = db.prepare("SELECT seq, code, created_at FROM invite_codes WHERE code = ?").get(normalized) as
    | { seq: number; code: string; created_at: string }
    | undefined;
  const result = db.prepare("DELETE FROM invite_codes WHERE code = ?").run(normalized);
  if (!row || result.changes !== 1) {
    throw Object.assign(new Error("that signup key is not valid"), { statusCode: 403 });
  }
  return { seq: row.seq, code: row.code, createdAt: row.created_at };
}

export function releaseSignupKey(db: Db, issued: InviteCode): void {
  db.prepare("INSERT OR IGNORE INTO invite_codes (seq, code, created_at) VALUES (?, ?, ?)").run(
    issued.seq,
    issued.code,
    issued.createdAt,
  );
}

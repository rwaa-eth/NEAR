import { createHash, randomInt, randomBytes } from "node:crypto";
import type { Db } from "./db";

const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function issueOtp(db: Db, email: string): { code: string; cooldownMs: number } {
  const now = Date.now();
  const recent = db
    .prepare("SELECT created_at FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1")
    .get(email) as { created_at: number } | undefined;
  if (recent && now - recent.created_at < RESEND_COOLDOWN_MS) {
    const error = new Error("wait before requesting another code") as Error & { statusCode: number };
    error.statusCode = 429;
    throw error;
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  db.prepare("DELETE FROM email_otps WHERE email = ?").run(email);
  db.prepare(
    `INSERT INTO email_otps (email, code_hash, expires_at, attempts, created_at)
     VALUES (?, ?, ?, 0, ?)`,
  ).run(email, hashValue(code), now + OTP_TTL_MS, now);
  return { code, cooldownMs: RESEND_COOLDOWN_MS };
}

export function verifyOtp(db: Db, email: string, code: string): string {
  const now = Date.now();
  const row = db
    .prepare("SELECT code_hash, expires_at, attempts FROM email_otps WHERE email = ?")
    .get(email) as { code_hash: string; expires_at: number; attempts: number } | undefined;
  if (!row) {
    const error = new Error("send a verification code first") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }
  if (row.expires_at < now) {
    db.prepare("DELETE FROM email_otps WHERE email = ?").run(email);
    const error = new Error("that code has expired") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    db.prepare("DELETE FROM email_otps WHERE email = ?").run(email);
    const error = new Error("too many incorrect codes") as Error & { statusCode: number };
    error.statusCode = 429;
    throw error;
  }
  if (row.code_hash !== hashValue(code.trim())) {
    db.prepare("UPDATE email_otps SET attempts = attempts + 1 WHERE email = ?").run(email);
    const error = new Error("that code is incorrect") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }
  db.prepare("DELETE FROM email_otps WHERE email = ?").run(email);
  const token = randomBytes(32).toString("base64url");
  db.prepare("DELETE FROM email_sessions WHERE email = ?").run(email);
  db.prepare(
    `INSERT INTO email_sessions (token_hash, email, expires_at, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(hashValue(token), email, now + SESSION_TTL_MS, now);
  return token;
}

export function consumeEmailSession(db: Db, email: string, token: string | undefined): void {
  if (!token) {
    const error = new Error("verify your email before creating a wallet") as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }
  const now = Date.now();
  const row = db
    .prepare("SELECT email, expires_at FROM email_sessions WHERE token_hash = ?")
    .get(hashValue(token)) as { email: string; expires_at: number } | undefined;
  if (!row || row.email !== email) {
    const error = new Error("verify your email before creating a wallet") as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }
  if (row.expires_at < now) {
    db.prepare("DELETE FROM email_sessions WHERE token_hash = ?").run(hashValue(token));
    const error = new Error("email verification expired; request a new code") as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }
  db.prepare("DELETE FROM email_sessions WHERE token_hash = ?").run(hashValue(token));
}

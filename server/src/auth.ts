import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import { decode } from "cbor-x";
import type { Db } from "./db";
import { compressedP256, deriveAccountId, publicKeyToString, type PasskeyPublicKey } from "./accountId";
import type { Config } from "./config";

export function tokenOk(header: string | undefined, expected: string): boolean {
  const presented = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const got = Buffer.from(presented);
  const exp = Buffer.from(expected);
  if (got.length !== exp.length) {
    timingSafeEqual(exp, exp);
    return false;
  }
  return timingSafeEqual(got, exp);
}

export function issueChallenge(db: Db): { challengeId: string; nonce: string } {
  const challengeId = randomUUID();
  const nonce = randomBytes(32);
  db.prepare("INSERT INTO challenges (id, nonce, expires_at, used) VALUES (?, ?, ?, 0)").run(
    challengeId,
    nonce,
    Date.now() + 120_000,
  );
  return { challengeId, nonce: nonce.toString("base64url") };
}

export function consumeChallenge(db: Db, challengeId: string): Buffer | null {
  const row = db.prepare("SELECT nonce, expires_at, used FROM challenges WHERE id = ?").get(challengeId) as
    | { nonce: Buffer; expires_at: number; used: number }
    | undefined;
  if (!row || row.used || row.expires_at < Date.now()) return null;
  const burned = db.prepare("UPDATE challenges SET used = 1 WHERE id = ? AND used = 0").run(challengeId);
  if (burned.changes !== 1) return null;
  return Buffer.from(row.nonce);
}

export function bindChallenge(nonce: Buffer, method: string, path: string, body: string): string {
  const bodyHash = createHash("sha256").update(body).digest();
  return createHash("sha256").update(nonce).update(method).update(path).update(bodyHash).digest("base64url");
}

function coseCompressed(publicKey: Uint8Array): PasskeyPublicKey {
  const decoded = decode(Buffer.from(publicKey)) as Map<number, Uint8Array>;
  const x = decoded.get(-2);
  const y = decoded.get(-3);
  if (!x || !y) throw new Error("COSE key is missing the P-256 point");
  return { curve: "p256", bytes: compressedP256(Uint8Array.from(x), Uint8Array.from(y)) };
}

export async function verifyRegistration(
  config: Config,
  db: Db,
  challengeId: string,
  credential: RegistrationResponseJSON,
): Promise<{ accountId: string; credentialId: string; publicKey: PasskeyPublicKey }> {
  const nonce = consumeChallenge(db, challengeId);
  if (!nonce) {
    const error = new Error("challenge is missing or expired");
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }
  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: nonce.toString("base64url"),
    expectedOrigin: config.origins,
    expectedRPID: config.rpId,
    requireUserVerification: true,
  });
  if (!verification.verified || !verification.registrationInfo) {
    const error = new Error("passkey attestation was rejected");
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }
  const info = verification.registrationInfo;
  const credentialId = info.credential.id;
  const publicKey = coseCompressed(info.credential.publicKey);
  const accountId = deriveAccountId(publicKey);
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO credentials (credential_id, public_key, compressed_key, public_key_near, near_account_id, sign_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(credential_id) DO UPDATE SET sign_count = excluded.sign_count`,
  ).run(
    credentialId,
    Buffer.from(info.credential.publicKey),
    Buffer.from(publicKey.bytes),
    publicKeyToString(publicKey),
    accountId,
    info.credential.counter,
    now,
  );
  return { accountId, credentialId, publicKey };
}

export interface AssertionHeaders {
  challengeId: string;
  credentialId: string;
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  userHandle?: string;
}

export async function verifyAssertion(
  config: Config,
  db: Db,
  headers: AssertionHeaders,
  method: string,
  path: string,
  body: string,
): Promise<{ accountId: string; credentialId: string }> {
  const nonce = consumeChallenge(db, headers.challengeId);
  if (!nonce) {
    const error = new Error("challenge is missing or expired");
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }
  const row = db
    .prepare("SELECT credential_id, public_key, near_account_id, sign_count FROM credentials WHERE credential_id = ?")
    .get(headers.credentialId) as
    | { credential_id: string; public_key: Buffer; near_account_id: string; sign_count: number }
    | undefined;
  if (!row) {
    const error = new Error("unknown passkey");
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }
  const response: AuthenticationResponseJSON = {
    id: headers.credentialId,
    rawId: headers.credentialId,
    type: "public-key",
    response: {
      clientDataJSON: headers.clientDataJSON,
      authenticatorData: headers.authenticatorData,
      signature: headers.signature,
      userHandle: headers.userHandle,
    },
    clientExtensionResults: {},
  };
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: bindChallenge(nonce, method, path, body),
    expectedOrigin: config.origins,
    expectedRPID: config.rpId,
    requireUserVerification: true,
    credential: {
      id: row.credential_id,
      publicKey: new Uint8Array(row.public_key),
      counter: row.sign_count,
    },
  });
  if (!verification.verified) {
    const error = new Error("passkey signature was rejected");
    (error as Error & { statusCode: number }).statusCode = 401;
    throw error;
  }
  db.prepare("UPDATE credentials SET sign_count = ? WHERE credential_id = ?").run(
    verification.authenticationInfo.newCounter,
    row.credential_id,
  );
  return { accountId: row.near_account_id, credentialId: row.credential_id };
}

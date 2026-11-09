import fs from "node:fs";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Config } from "./config";
import type { Db } from "./db";
import {
  depositsFromOutcome,
  emailHash,
  listEscrow,
  markClaimed,
  markRefunded,
  readOpenDeposit,
  paymentsFromOutcome,
  recordDeposits,
  recordDirectPayments,
  releaseOnChain,
  transfersFromOutcome,
} from "./escrow";
import { mailConfigured, sendMail } from "./mail";
import { accountIdForEmail, accountBalance, callView, fetchTx, provisionAccount } from "./near";
import { consumeEmailSession, issueOtp, verifyOtp } from "./otp";

const email = z.string().trim().email().transform((value) => value.toLowerCase());
const publicKey = z.string().regex(/^(ed25519|secp256k1):[1-9A-HJ-NP-Za-km-z]+$/);
const txHash = z.string().trim().regex(/^[1-9A-HJ-NP-Za-km-z]{32,100}$/);

const registerBody = z.object({
  email,
  publicKey,
  emailToken: z.string().trim().min(16).max(256),
});

const otpSendBody = z.object({ email });
const otpVerifyBody = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/),
});

const nearAccountId = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^(?:[a-z0-9][a-z0-9._-]{0,62}\.(?:near|testnet)|[0-9a-f]{64})$/);

const depositBody = z.object({
  senderEmail: email,
  recipientEmail: email,
  txHash,
});

const transferBody = z
  .object({
    senderEmail: email,
    recipientEmail: email.optional(),
    recipientAccountId: nearAccountId.optional(),
    txHash,
  })
  .refine((body) => Boolean(body.recipientEmail || body.recipientAccountId), {
    message: "Choose a recipient.",
  });

const releaseBody = z.object({ email });
const reclaimBody = z.object({
  senderEmail: email,
  depositId: z.number().int().nonnegative(),
  txHash,
});

export type NearAccount = {
  email: string;
  accountId: string;
  publicKey: string;
  createdAt: string;
};

type AccountRow = {
  email: string;
  account_id: string;
  public_key: string;
  created_at: string;
};

function statusError(statusCode: number, message: string): Error {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

function accountFromRow(row: AccountRow | undefined): NearAccount | undefined {
  if (!row) return undefined;
  return {
    email: row.email,
    accountId: row.account_id,
    publicKey: row.public_key,
    createdAt: row.created_at,
  };
}

function readAccount(db: Db, accountEmail: string): NearAccount | undefined {
  const row = db
    .prepare("SELECT email, account_id, public_key, created_at FROM near_accounts WHERE email = ?")
    .get(accountEmail) as AccountRow | undefined;
  return accountFromRow(row);
}

function readAccountById(db: Db, accountId: string): NearAccount | undefined {
  const row = db
    .prepare("SELECT email, account_id, public_key, created_at FROM near_accounts WHERE account_id = ?")
    .get(accountId) as AccountRow | undefined;
  return accountFromRow(row);
}

export function registerNearWallet(app: FastifyInstance, config: Config, db: Db): void {
  app.get("/ethw", async (_request, reply) => reply.redirect("/"));

  app.get("/wallet.js", async (_request, reply) => {
    const script = fs.readFileSync(path.join(__dirname, "..", "public", "wallet.js"), "utf8");
    return reply.type("application/javascript").send(script);
  });

  app.get("/ragraphic.jpg", async (_request, reply) => {
    const image = fs.readFileSync(path.join(__dirname, "..", "public", "ragraphic.jpg"));
    return reply.type("image/jpeg").send(image);
  });

  app.get("/copyicon.png", async (_request, reply) => {
    const image = fs.readFileSync(path.join(__dirname, "..", "public", "copyicon.png"));
    return reply.type("image/png").send(image);
  });

  app.get("/ethw/api/config", async () => ({
    network: config.nearNetwork,
    rpc: "/ethw/api/rpc",
    token: config.tokenAccount || null,
    symbol: config.tokenSymbol,
    decimals: config.tokenDecimals,
    escrow: config.escrowAccount || null,
    mailReady: mailConfigured(config),
  }));

  app.get("/ethw/api/account", async (request) => {
    const query = z.object({ email }).parse(request.query);
    const account = readAccount(db, query.email);
    if (!account) return { registered: false };
    return { registered: true, ...account };
  });

  app.get("/ethw/api/balance", async (request) => {
    const query = z.object({ accountId: z.string().trim().min(2).max(64) }).parse(request.query);
    let near: string;
    try {
      near = await accountBalance(config.nearRpcUrl, query.accountId);
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "could not read the NEAR balance");
    }
    if (!config.tokenAccount) return { near, token: null };
    try {
      const token = await callView(config.nearRpcUrl, config.tokenAccount, "ft_balance_of", {
        account_id: query.accountId,
      });
      return { near, token: typeof token === "string" ? token : "0" };
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "could not read the token balance");
    }
  });

  app.post("/ethw/api/otp/send", async (request) => {
    if (!mailConfigured(config)) throw statusError(503, "email sending is not configured on the server");
    const body = otpSendBody.parse(request.body);
    if (readAccount(db, body.email)) throw statusError(409, "that email already has a wallet; open it instead");
    let issued: { code: string; cooldownMs: number };
    try {
      issued = issueOtp(db, body.email);
    } catch (error) {
      const known = error as Error & { statusCode?: number };
      throw statusError(known.statusCode ?? 500, known.message);
    }
    try {
      await sendMail(config, {
        to: body.email,
        subject: "Your RaOpenwallet code",
        text: `Your RaOpenwallet verification code is ${issued.code}.\n\nIt expires in 10 minutes.`,
      });
    } catch (error) {
      db.prepare("DELETE FROM email_otps WHERE email = ?").run(body.email);
      throw statusError(502, error instanceof Error ? error.message : "could not send the email");
    }
    return {
      sent: true,
      cooldownMs: issued.cooldownMs,
      ...(config.emailDevMode ? { devCode: issued.code } : {}),
    };
  });

  app.post("/ethw/api/otp/verify", async (request) => {
    const body = otpVerifyBody.parse(request.body);
    try {
      const emailToken = verifyOtp(db, body.email, body.code);
      return { email: body.email, emailToken };
    } catch (error) {
      const known = error as Error & { statusCode?: number };
      throw statusError(known.statusCode ?? 500, known.message);
    }
  });

  app.post("/ethw/api/register", async (request) => {
    const body = registerBody.parse(request.body);
    const accountId = accountIdForEmail(body.email, config.nearNetwork);
    const existing = readAccount(db, body.email);
    if (existing) {
      if (existing.publicKey !== body.publicKey) throw statusError(409, "that email is already registered");
      return { email: existing.email, accountId: existing.accountId };
    }
    try {
      consumeEmailSession(db, body.email, body.emailToken);
    } catch (error) {
      const known = error as Error & { statusCode?: number };
      throw statusError(known.statusCode ?? 500, known.message);
    }
    const taken = db.prepare("SELECT email FROM near_accounts WHERE account_id = ?").get(accountId) as
      | { email: string }
      | undefined;
    if (taken) throw statusError(409, "that NEAR account already belongs to another email");
    try {
      await provisionAccount(config, accountId, body.publicKey);
    } catch (error) {
      const known = error as Error & { statusCode?: number };
      throw statusError(known.statusCode ?? 502, known.message);
    }
    const createdAt = new Date().toISOString();
    db.prepare(
      `INSERT INTO near_accounts (email, account_id, public_key, created_at)
       VALUES (?, ?, ?, ?)`,
    ).run(body.email, accountId, body.publicKey, createdAt);
    return { email: body.email, accountId };
  });

  app.get("/ethw/api/escrow", async (request) => {
    const query = z.object({ email }).parse(request.query);
    return listEscrow(db, query.email);
  });

  app.post("/ethw/api/transfer", async (request) => {
    if (!config.tokenAccount) throw statusError(400, "Set NEAR_TOKEN_ACCOUNT on the server");
    const body = transferBody.parse(request.body);
    const sender = readAccount(db, body.senderEmail);
    if (!sender) throw statusError(404, "sender email is not registered");
    const registered = body.recipientEmail
      ? readAccount(db, body.recipientEmail)
      : readAccountById(db, body.recipientAccountId ?? "");
    if (body.recipientEmail && !registered) throw statusError(404, "recipient email is not registered");
    const recipientAccountId = registered?.accountId ?? body.recipientAccountId ?? "";
    const recipientLabel = registered?.email ?? recipientAccountId;
    if (!recipientAccountId || recipientAccountId === sender.accountId || recipientLabel === sender.email) {
      throw statusError(400, "Choose a different recipient.");
    }
    let outcome;
    try {
      outcome = await fetchTx(config.nearRpcUrl, body.txHash, sender.accountId);
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "could not read the transfer");
    }
    if (outcome.transaction?.signer_id !== sender.accountId) {
      throw statusError(400, "that transaction was not signed by this wallet");
    }
    const parsed = transfersFromOutcome(outcome, config.tokenAccount, sender.accountId, recipientAccountId);
    if (parsed.length === 0) throw statusError(400, "that transaction does not pay this account");
    recordDirectPayments(
      db,
      parsed.map((transfer) => ({
        recipientEmail: recipientLabel,
        senderEmail: sender.email,
        senderAddress: sender.accountId,
        amount: transfer.amount,
        txHash: body.txHash,
        logIndex: transfer.logIndex,
      })),
    );
    return listEscrow(db, sender.email);
  });

  app.post("/ethw/api/escrow/deposit", async (request) => {
    if (!config.escrowAccount) throw statusError(400, "Set NEAR_ESCROW_ACCOUNT on the server");
    const body = depositBody.parse(request.body);
    const sender = readAccount(db, body.senderEmail);
    if (!sender) throw statusError(404, "sender email is not registered");
    let outcome;
    try {
      outcome = await fetchTx(config.nearRpcUrl, body.txHash, sender.accountId);
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "could not read the deposit");
    }
    if (outcome.transaction?.signer_id !== sender.accountId) {
      throw statusError(400, "that transaction was not signed by this wallet");
    }
    const hash = emailHash(body.recipientEmail);
    const parsed = depositsFromOutcome(outcome, config.escrowAccount, hash).filter(
      (deposit) => deposit.from === sender.accountId && deposit.amount !== "0",
    );
    if (parsed.length === 0) throw statusError(400, "that transaction does not deposit to this email");
    recordDeposits(
      db,
      parsed.map((deposit) => ({
        recipientEmail: body.recipientEmail,
        emailHash: hash,
        senderEmail: sender.email,
        senderAddress: deposit.from,
        amount: deposit.amount,
        txHash: body.txHash,
        logIndex: deposit.logIndex,
        depositId: deposit.depositId,
        unlockAt: deposit.unlockAt,
      })),
    );
    return listEscrow(db, sender.email);
  });

  app.post("/ethw/api/escrow/reclaim", async (request) => {
    if (!config.escrowAccount) throw statusError(400, "Set NEAR_ESCROW_ACCOUNT on the server");
    const body = reclaimBody.parse(request.body);
    const sender = readAccount(db, body.senderEmail);
    if (!sender) throw statusError(404, "sender email is not registered");
    const open = readOpenDeposit(db, body.depositId);
    if (!open || open.senderEmail !== sender.email) throw statusError(404, "that payment is not waiting");
    if (!open.unlockAt || Date.parse(open.unlockAt) > Date.now()) {
      throw statusError(400, "that payment can be pulled back after one week");
    }
    let outcome;
    try {
      outcome = await fetchTx(config.nearRpcUrl, body.txHash, sender.accountId);
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "could not read the reclaim");
    }
    const paid = paymentsFromOutcome(outcome, config.escrowAccount).some(
      (payment) =>
        payment.depositId === body.depositId &&
        payment.emailHash === open.emailHash &&
        payment.to === sender.accountId,
    );
    if (!paid || outcome.transaction?.signer_id !== sender.accountId) {
      throw statusError(400, "that transaction does not reclaim this payment");
    }
    markRefunded(db, body.depositId, body.txHash);
    return listEscrow(db, sender.email);
  });

  app.post("/ethw/api/escrow/release", async (request) => {
    const body = releaseBody.parse(request.body);
    const account = readAccount(db, body.email);
    if (!account) throw statusError(404, "that email is not registered");
    const pending = listEscrow(db, body.email).incoming;
    if (pending.length === 0) throw statusError(404, "nothing to collect");
    if (!config.escrowAccount || !config.operatorAccount || !config.operatorKey) {
      throw statusError(503, "Set NEAR_ESCROW_ACCOUNT, NEAR_OPERATOR_ACCOUNT, and NEAR_OPERATOR_KEY on the server");
    }
    let claimTx: string;
    try {
      claimTx = await releaseOnChain(config, emailHash(body.email), account.accountId);
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "escrow release failed");
    }
    markClaimed(db, body.email, claimTx);
    return { txHash: claimTx, ...listEscrow(db, body.email) };
  });

  app.post("/ethw/api/rpc", async (request, reply) => {
    if (!request.body || typeof request.body !== "object") throw statusError(400, "expected a JSON-RPC body");
    let response: Response;
    try {
      response = await fetch(config.nearRpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request.body),
      });
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "NEAR RPC is unreachable");
    }
    const text = await response.text();
    return reply.code(response.status).type("application/json").send(text);
  });
}

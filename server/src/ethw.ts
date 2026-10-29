import fs from "node:fs";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Config } from "./config";
import type { Db } from "./db";
import { depositsFromReceipt, emailHash, fetchReceipt, listEscrow, markClaimed, recordDeposits, releaseOnChain } from "./escrow";

const email = z.string().trim().email().transform((value) => value.toLowerCase());
const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/);
const publicKey = z.string().regex(/^0x[0-9a-fA-F]{128}$/);

const registerBody = z.object({
  email,
  address,
  credentialId: z.string().trim().min(8).max(512),
  publicKey,
});

const depositBody = z.object({
  senderEmail: email,
  recipientEmail: email,
  txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
});

const releaseBody = z.object({ email });

export type EthAccount = {
  email: string;
  address: string;
  credentialId: string;
  publicKey: string;
  createdAt: string;
};

type AccountRow = {
  email: string;
  address: string;
  credential_id: string;
  public_key: string;
  created_at: string;
};

function statusError(statusCode: number, message: string): Error {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

function readAccount(db: Db, accountEmail: string): EthAccount | undefined {
  const row = db
    .prepare(
      "SELECT email, address, credential_id, public_key, created_at FROM eth_accounts WHERE email = ?",
    )
    .get(accountEmail) as AccountRow | undefined;
  if (!row) return undefined;
  return {
    email: row.email,
    address: row.address,
    credentialId: row.credential_id,
    publicKey: row.public_key,
    createdAt: row.created_at,
  };
}

export function registerEthWallet(app: FastifyInstance, config: Config, db: Db): void {
  app.get("/ethw", async (_request, reply) => reply.redirect("/"));

  app.get("/ethw.js", async (_request, reply) => {
    const script = fs.readFileSync(path.join(__dirname, "..", "public", "ethw.js"), "utf8");
    return reply.type("application/javascript").send(script);
  });

  app.get("/ethw/api/config", async () => ({
    chainId: 84532,
    rpc: "/ethw/api/rpc",
    erc20: config.erc20Address || null,
    symbol: config.erc20Symbol,
    paymaster: config.basePaymaster,
    escrow: config.escrowAddress || null,
  }));

  app.get("/ethw/api/account", async (request) => {
    const query = z.object({ email }).parse(request.query);
    const account = readAccount(db, query.email);
    if (!account) return { registered: false };
    return { registered: true, ...account };
  });

  app.post("/ethw/api/register", async (request) => {
    const body = registerBody.parse(request.body);
    const existing = readAccount(db, body.email);
    if (existing) {
      if (existing.credentialId !== body.credentialId || existing.publicKey.toLowerCase() !== body.publicKey.toLowerCase()) {
        throw statusError(409, "that email is already registered");
      }
      return { email: existing.email, address: existing.address };
    }
    const taken = db.prepare("SELECT email FROM eth_accounts WHERE lower(address) = lower(?)").get(body.address) as
      | { email: string }
      | undefined;
    if (taken) throw statusError(409, "that passkey already belongs to another email");
    const createdAt = new Date().toISOString();
    db.prepare(
      `INSERT INTO eth_accounts (email, address, credential_id, public_key, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(body.email, body.address, body.credentialId, body.publicKey, createdAt);
    return { email: body.email, address: body.address };
  });

  app.get("/ethw/api/escrow", async (request) => {
    const query = z.object({ email }).parse(request.query);
    return listEscrow(db, query.email);
  });

  app.post("/ethw/api/escrow/deposit", async (request) => {
    if (!config.escrowAddress) throw statusError(400, "Set ESCROW_ADDRESS on the server");
    const body = depositBody.parse(request.body);
    const sender = readAccount(db, body.senderEmail);
    if (!sender) throw statusError(404, "sender email is not registered");
    let receipt;
    try {
      receipt = await fetchReceipt(config.baseRpcUrl, body.txHash);
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "could not read the deposit");
    }
    const hash = emailHash(body.recipientEmail);
    const parsed = depositsFromReceipt(receipt, config.escrowAddress, hash).filter(
      (deposit) => deposit.from === sender.address.toLowerCase() && deposit.amount !== "0",
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
        txHash: body.txHash.toLowerCase(),
        logIndex: deposit.logIndex,
      })),
    );
    return listEscrow(db, sender.email);
  });

  app.post("/ethw/api/escrow/release", async (request) => {
    const body = releaseBody.parse(request.body);
    const account = readAccount(db, body.email);
    if (!account) throw statusError(404, "that email is not registered");
    const pending = listEscrow(db, body.email).incoming;
    if (pending.length === 0) throw statusError(404, "nothing to collect");
    if (!config.escrowAddress || !/^0x[0-9a-fA-F]{64}$/.test(config.escrowOperatorKey)) {
      throw statusError(503, "Set ESCROW_ADDRESS and ESCROW_OPERATOR_KEY on the server");
    }
    let claimTx: string;
    try {
      claimTx = await releaseOnChain(config, emailHash(body.email), account.address);
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
      response = await fetch(config.baseRpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request.body),
      });
    } catch (error) {
      throw statusError(502, error instanceof Error ? error.message : "Base RPC is unreachable");
    }
    const text = await response.text();
    return reply.code(response.status).type("application/json").send(text);
  });
}

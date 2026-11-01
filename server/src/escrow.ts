import { keccak_256 } from "@noble/hashes/sha3";
import type { Config } from "./config";
import type { Db } from "./db";

export const CLAIM_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

export type EscrowRow = {
  id: number;
  depositId: number | null;
  recipientEmail: string;
  senderEmail: string;
  senderAddress: string;
  amount: string;
  txHash: string;
  createdAt: string;
  unlockAt: string | null;
  reclaimable: boolean;
};

type DepositRow = {
  id: number;
  deposit_id: number | null;
  recipient_email: string;
  sender_email: string;
  sender_address: string;
  amount: string;
  tx_hash: string;
  created_at: string;
  unlock_at: string | null;
};

export type ReceiptLog = {
  address: string;
  topics: string[];
  data: string;
  logIndex?: string;
};

export type Receipt = {
  status?: string;
  transactionHash?: string;
  logs?: ReceiptLog[];
};

export type ParsedDeposit = {
  depositId: number;
  emailHash: string;
  from: string;
  amount: string;
  unlockAt: number;
  logIndex: number;
};

function keccakHex(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return `0x${Buffer.from(keccak_256(bytes)).toString("hex")}`;
}

export const DEPOSIT_TOPIC = keccakHex("Deposited(uint256,bytes32,address,uint256,uint64)");
export const RECLAIM_TOPIC = keccakHex("Reclaimed(uint256,address,uint256)");

export function emailHash(email: string): string {
  return keccakHex(email.trim().toLowerCase());
}

function toRow(row: DepositRow): EscrowRow {
  const unlockAt = row.unlock_at;
  const reclaimable = Boolean(
    row.deposit_id !== null && unlockAt && Date.parse(unlockAt) <= Date.now(),
  );
  return {
    id: row.id,
    depositId: row.deposit_id,
    recipientEmail: row.recipient_email,
    senderEmail: row.sender_email,
    senderAddress: row.sender_address,
    amount: row.amount,
    txHash: row.tx_hash,
    createdAt: row.created_at,
    unlockAt,
    reclaimable,
  };
}

export function depositsFromReceipt(receipt: Receipt, escrow: string, expectedHash: string): ParsedDeposit[] {
  if (!receipt.status || BigInt(receipt.status) !== 1n) return [];
  const wanted = expectedHash.toLowerCase();
  const contract = escrow.toLowerCase();
  const found: ParsedDeposit[] = [];
  for (const log of receipt.logs ?? []) {
    if (log.address.toLowerCase() !== contract) continue;
    if (log.topics.length < 4) continue;
    if (log.topics[0].toLowerCase() !== DEPOSIT_TOPIC) continue;
    if (log.topics[2].toLowerCase() !== wanted) continue;
    const data = log.data.replace(/^0x/, "");
    if (data.length < 128) continue;
    const amount = BigInt(`0x${data.slice(0, 64)}`).toString(10);
    const unlockAt = Number(BigInt(`0x${data.slice(64, 128)}`));
    found.push({
      depositId: Number(BigInt(log.topics[1])),
      emailHash: wanted,
      from: `0x${log.topics[3].slice(-40).toLowerCase()}`,
      amount,
      unlockAt,
      logIndex: log.logIndex === undefined ? found.length : Number(BigInt(log.logIndex)),
    });
  }
  return found;
}

export function reclaimFromReceipt(receipt: Receipt, escrow: string, depositId: number, sender: string): boolean {
  if (!receipt.status || BigInt(receipt.status) !== 1n) return false;
  const contract = escrow.toLowerCase();
  const idTopic = `0x${BigInt(depositId).toString(16).padStart(64, "0")}`;
  const fromTopic = `0x${sender.slice(2).toLowerCase().padStart(64, "0")}`;
  for (const log of receipt.logs ?? []) {
    if (log.address.toLowerCase() !== contract) continue;
    if (log.topics.length < 3) continue;
    if (log.topics[0].toLowerCase() !== RECLAIM_TOPIC) continue;
    if (log.topics[1].toLowerCase() !== idTopic) continue;
    if (log.topics[2].toLowerCase() !== fromTopic) continue;
    return true;
  }
  return false;
}

export async function fetchReceipt(rpcUrl: string, txHash: string): Promise<Receipt> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getTransactionReceipt",
      params: [txHash],
    }),
  });
  const body = (await response.json()) as { error?: { message?: string }; result?: Receipt | null };
  if (!response.ok || body.error) throw new Error(body.error?.message || "Base RPC did not return a receipt");
  if (!body.result) throw new Error("transaction is not on Base Sepolia yet");
  return body.result;
}

export function recordDeposits(
  db: Db,
  rows: Array<{
    recipientEmail: string;
    emailHash: string;
    senderEmail: string;
    senderAddress: string;
    amount: string;
    txHash: string;
    logIndex: number;
    depositId: number;
    unlockAt: number;
  }>,
): number {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO escrow_deposits
      (recipient_email, email_hash, sender_email, sender_address, amount, tx_hash, log_index, created_at, deposit_id, unlock_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const createdAt = new Date().toISOString();
  let count = 0;
  const write = db.transaction(() => {
    for (const row of rows) {
      const info = insert.run(
        row.recipientEmail,
        row.emailHash,
        row.senderEmail,
        row.senderAddress,
        row.amount,
        row.txHash,
        row.logIndex,
        createdAt,
        row.depositId,
        new Date(row.unlockAt * 1000).toISOString(),
      );
      count += info.changes;
    }
  });
  write();
  return count;
}

export function listEscrow(db: Db, email: string): { incoming: EscrowRow[]; outgoing: EscrowRow[] } {
  const incoming = db
    .prepare(
      `SELECT id, deposit_id, recipient_email, sender_email, sender_address, amount, tx_hash, created_at, unlock_at
       FROM escrow_deposits
       WHERE recipient_email = ? AND claimed_at IS NULL AND refunded_at IS NULL
       ORDER BY id`,
    )
    .all(email) as DepositRow[];
  const outgoing = db
    .prepare(
      `SELECT id, deposit_id, recipient_email, sender_email, sender_address, amount, tx_hash, created_at, unlock_at
       FROM escrow_deposits
       WHERE sender_email = ? AND claimed_at IS NULL AND refunded_at IS NULL
       ORDER BY id`,
    )
    .all(email) as DepositRow[];
  return { incoming: incoming.map(toRow), outgoing: outgoing.map(toRow) };
}

export function markClaimed(db: Db, email: string, claimTx: string): void {
  db.prepare(
    `UPDATE escrow_deposits SET claimed_at = ?, claim_tx = ?
     WHERE recipient_email = ? AND claimed_at IS NULL AND refunded_at IS NULL`,
  ).run(new Date().toISOString(), claimTx, email);
}

export function markRefunded(db: Db, depositId: number, refundTx: string): void {
  db.prepare(
    `UPDATE escrow_deposits SET refunded_at = ?, refund_tx = ?
     WHERE deposit_id = ? AND claimed_at IS NULL AND refunded_at IS NULL`,
  ).run(new Date().toISOString(), refundTx, depositId);
}

export function readOpenDeposit(
  db: Db,
  depositId: number,
): { senderEmail: string; senderAddress: string; unlockAt: string | null } | undefined {
  return db
    .prepare(
      `SELECT sender_email as senderEmail, sender_address as senderAddress, unlock_at as unlockAt
       FROM escrow_deposits
       WHERE deposit_id = ? AND claimed_at IS NULL AND refunded_at IS NULL`,
    )
    .get(depositId) as
    | { senderEmail: string; senderAddress: string; unlockAt: string | null }
    | undefined;
}

export async function releaseOnChain(config: Config, hash: string, to: string): Promise<string> {
  const viem = await import("viem");
  const accounts = await import("viem/accounts");
  const chains = await import("viem/chains");
  const account = accounts.privateKeyToAccount(config.escrowOperatorKey as `0x${string}`);
  const transport = viem.http(config.baseRpcUrl);
  const wallet = viem.createWalletClient({ account, chain: chains.baseSepolia, transport });
  const txHash = await wallet.sendTransaction({
    to: config.escrowAddress as `0x${string}`,
    data: viem.encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "release",
          stateMutability: "nonpayable",
          inputs: [
            { name: "emailHash", type: "bytes32" },
            { name: "to", type: "address" },
          ],
          outputs: [],
        },
      ],
      functionName: "release",
      args: [hash as `0x${string}`, to as `0x${string}`],
    }),
  });
  const reader = viem.createPublicClient({ chain: chains.baseSepolia, transport });
  const receipt = await reader.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") throw new Error("escrow release reverted");
  return txHash;
}

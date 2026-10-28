import { keccak_256 } from "@noble/hashes/sha3";
import type { Config } from "./config";
import type { Db } from "./db";

export type EscrowRow = {
  id: number;
  recipientEmail: string;
  senderEmail: string;
  senderAddress: string;
  amount: string;
  txHash: string;
  createdAt: string;
};

type DepositRow = {
  id: number;
  recipient_email: string;
  sender_email: string;
  sender_address: string;
  amount: string;
  tx_hash: string;
  created_at: string;
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
  emailHash: string;
  from: string;
  amount: string;
  logIndex: number;
};

function keccakHex(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return `0x${Buffer.from(keccak_256(bytes)).toString("hex")}`;
}

export const DEPOSIT_TOPIC = keccakHex("Deposited(bytes32,address,uint256)");

export function emailHash(email: string): string {
  return keccakHex(email.trim().toLowerCase());
}

function toRow(row: DepositRow): EscrowRow {
  return {
    id: row.id,
    recipientEmail: row.recipient_email,
    senderEmail: row.sender_email,
    senderAddress: row.sender_address,
    amount: row.amount,
    txHash: row.tx_hash,
    createdAt: row.created_at,
  };
}

export function depositsFromReceipt(receipt: Receipt, escrow: string, expectedHash: string): ParsedDeposit[] {
  if (!receipt.status || BigInt(receipt.status) !== 1n) return [];
  const wanted = expectedHash.toLowerCase();
  const contract = escrow.toLowerCase();
  const found: ParsedDeposit[] = [];
  for (const log of receipt.logs ?? []) {
    if (log.address.toLowerCase() !== contract) continue;
    if (log.topics.length < 3) continue;
    if (log.topics[0].toLowerCase() !== DEPOSIT_TOPIC) continue;
    if (log.topics[1].toLowerCase() !== wanted) continue;
    found.push({
      emailHash: wanted,
      from: `0x${log.topics[2].slice(-40).toLowerCase()}`,
      amount: BigInt(log.data).toString(10),
      logIndex: log.logIndex === undefined ? found.length : Number(BigInt(log.logIndex)),
    });
  }
  return found;
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
  }>,
): number {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO escrow_deposits
      (recipient_email, email_hash, sender_email, sender_address, amount, tx_hash, log_index, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      `SELECT id, recipient_email, sender_email, sender_address, amount, tx_hash, created_at
       FROM escrow_deposits WHERE recipient_email = ? AND claimed_at IS NULL ORDER BY id`,
    )
    .all(email) as DepositRow[];
  const outgoing = db
    .prepare(
      `SELECT id, recipient_email, sender_email, sender_address, amount, tx_hash, created_at
       FROM escrow_deposits WHERE sender_email = ? AND claimed_at IS NULL ORDER BY id`,
    )
    .all(email) as DepositRow[];
  return { incoming: incoming.map(toRow), outgoing: outgoing.map(toRow) };
}

export function markClaimed(db: Db, email: string, claimTx: string): void {
  db.prepare(
    `UPDATE escrow_deposits SET claimed_at = ?, claim_tx = ? WHERE recipient_email = ? AND claimed_at IS NULL`,
  ).run(new Date().toISOString(), claimTx, email);
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

import type { Db } from "./db";
import { emailHash, releaseOnNear, type TxOutcome } from "./near";
import type { Config } from "./config";

export { emailHash };

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
  claimedAt?: string | null;
  direction?: "in" | "out";
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
  claimed_at?: string | null;
};

export type ParsedDeposit = {
  depositId: number;
  emailHash: string;
  from: string;
  amount: string;
  unlockAt: number;
  logIndex: number;
};

export type ParsedPayment = {
  depositId: number;
  emailHash: string;
  to: string;
  amount: string;
};

const DEPOSIT_LOG = /^deposited id=(\d+) hash=([0-9a-f]{64}) from=(\S+) amount=(\d+) unlock_at_ns=(\d+)$/;
const PAID_LOG = /^paid id=(\d+) hash=([0-9a-f]{64}) to=(\S+) amount=(\d+)$/;

function failed(status: TxOutcome["status"]): boolean {
  return Boolean(status && typeof status === "object" && "Failure" in status);
}

function outcomeFailed(outcome: TxOutcome): boolean {
  if (failed(outcome.status)) return true;
  return (outcome.receipts_outcome ?? []).some((receipt) => failed(receipt.outcome?.status));
}

function escrowLogs(outcome: TxOutcome, escrow: string): string[] {
  const logs: string[] = [];
  for (const receipt of outcome.receipts_outcome ?? []) {
    if (receipt.outcome?.executor_id !== escrow) continue;
    if (failed(receipt.outcome.status)) continue;
    logs.push(...(receipt.outcome.logs ?? []));
  }
  return logs;
}

function toRow(row: DepositRow): EscrowRow {
  const unlockAt = row.unlock_at;
  const reclaimable = Boolean(row.deposit_id !== null && unlockAt && Date.parse(unlockAt) <= Date.now());
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
    claimedAt: row.claimed_at ?? null,
  };
}

export function depositsFromOutcome(outcome: TxOutcome, escrow: string, expectedHash: string): ParsedDeposit[] {
  if (outcomeFailed(outcome)) return [];
  const wanted = expectedHash.toLowerCase();
  const found: ParsedDeposit[] = [];
  for (const line of escrowLogs(outcome, escrow)) {
    const match = DEPOSIT_LOG.exec(line.trim());
    if (!match || match[2] !== wanted) continue;
    const unlockNs = BigInt(match[5]);
    found.push({
      depositId: Number(match[1]),
      emailHash: wanted,
      from: match[3],
      amount: match[4],
      unlockAt: Number(unlockNs / 1_000_000_000n),
      logIndex: found.length,
    });
  }
  return found;
}

export type ParsedTransfer = {
  from: string;
  to: string;
  amount: string;
  logIndex: number;
};

/** NEP-141 `ft_transfer` events on the token account, limited to one sender and receiver. */
export function transfersFromOutcome(outcome: TxOutcome, token: string, from: string, to: string): ParsedTransfer[] {
  if (outcomeFailed(outcome)) return [];
  const found: ParsedTransfer[] = [];
  let logIndex = 0;
  for (const receipt of outcome.receipts_outcome ?? []) {
    if (receipt.outcome?.executor_id !== token) continue;
    if (failed(receipt.outcome.status)) continue;
    for (const line of receipt.outcome.logs ?? []) {
      if (!line.startsWith("EVENT_JSON:")) continue;
      let event: { event?: string; data?: Array<{ old_owner_id?: string; new_owner_id?: string; amount?: string }> };
      try {
        event = JSON.parse(line.slice("EVENT_JSON:".length)) as typeof event;
      } catch {
        continue;
      }
      if (event.event !== "ft_transfer" || !Array.isArray(event.data)) continue;
      for (const row of event.data) {
        const index = logIndex;
        logIndex += 1;
        if (row.old_owner_id !== from || row.new_owner_id !== to || !row.amount || row.amount === "0") continue;
        found.push({ from, to, amount: row.amount, logIndex: index });
      }
    }
  }
  return found;
}

export function paymentsFromOutcome(outcome: TxOutcome, escrow: string): ParsedPayment[] {
  if (outcomeFailed(outcome)) return [];
  const found: ParsedPayment[] = [];
  for (const line of escrowLogs(outcome, escrow)) {
    const match = PAID_LOG.exec(line.trim());
    if (!match) continue;
    found.push({
      depositId: Number(match[1]),
      emailHash: match[2],
      to: match[3],
      amount: match[4],
    });
  }
  return found;
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

export function listEscrow(db: Db, email: string): {
  incoming: EscrowRow[];
  outgoing: EscrowRow[];
  history: EscrowRow[];
} {
  const incoming = db
    .prepare(
      `SELECT id, deposit_id, recipient_email, sender_email, sender_address, amount, tx_hash, created_at, unlock_at, claimed_at
       FROM escrow_deposits
       WHERE recipient_email = ? AND claimed_at IS NULL AND refunded_at IS NULL
       ORDER BY id`,
    )
    .all(email) as DepositRow[];
  const outgoing = db
    .prepare(
      `SELECT id, deposit_id, recipient_email, sender_email, sender_address, amount, tx_hash, created_at, unlock_at, claimed_at
       FROM escrow_deposits
       WHERE sender_email = ? AND claimed_at IS NULL AND refunded_at IS NULL
       ORDER BY id`,
    )
    .all(email) as DepositRow[];
  const history = db
    .prepare(
      `SELECT id, deposit_id, recipient_email, sender_email, sender_address, amount, tx_hash, created_at, unlock_at, claimed_at,
              CASE WHEN sender_email = ? THEN 'out' ELSE 'in' END AS direction
       FROM escrow_deposits
       WHERE claimed_at IS NOT NULL AND refunded_at IS NULL
         AND (recipient_email = ? OR sender_email = ?)
       ORDER BY CASE WHEN sender_email = ? THEN created_at ELSE claimed_at END DESC, id DESC`,
    )
    .all(email, email, email, email) as Array<DepositRow & { direction: "in" | "out" }>;
  return {
    incoming: incoming.map(toRow),
    outgoing: outgoing.map(toRow),
    history: history.map((row) => ({ ...toRow(row), direction: row.direction })),
  };
}

/** A direct wallet-to-wallet payment. It is already settled, so it belongs in history. */
export function recordDirectPayments(
  db: Db,
  rows: Array<{
    recipientEmail: string;
    senderEmail: string;
    senderAddress: string;
    amount: string;
    txHash: string;
    logIndex: number;
  }>,
): number {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO escrow_deposits
      (recipient_email, email_hash, sender_email, sender_address, amount, tx_hash, log_index, created_at, claimed_at, claim_tx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const createdAt = new Date().toISOString();
  let count = 0;
  const write = db.transaction(() => {
    for (const row of rows) {
      const info = insert.run(
        row.recipientEmail,
        emailHash(row.recipientEmail),
        row.senderEmail,
        row.senderAddress,
        row.amount,
        row.txHash,
        row.logIndex,
        createdAt,
        createdAt,
        row.txHash,
      );
      count += info.changes;
    }
  });
  write();
  return count;
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
): { senderEmail: string; senderAddress: string; emailHash: string; unlockAt: string | null } | undefined {
  return db
    .prepare(
      `SELECT sender_email as senderEmail, sender_address as senderAddress, email_hash as emailHash, unlock_at as unlockAt
       FROM escrow_deposits
       WHERE deposit_id = ? AND claimed_at IS NULL AND refunded_at IS NULL`,
    )
    .get(depositId) as
    | { senderEmail: string; senderAddress: string; emailHash: string; unlockAt: string | null }
    | undefined;
}

export async function releaseOnChain(config: Config, hash: string, to: string): Promise<string> {
  const outcome = await releaseOnNear(config, hash, to);
  const paid = paymentsFromOutcome(outcome, config.escrowAccount).some(
    (payment) => payment.emailHash === hash && payment.to === to,
  );
  if (!paid) throw new Error("escrow release did not pay the wallet");
  const txHash = outcome.transaction?.hash;
  if (!txHash) throw new Error("escrow release did not return a transaction hash");
  return txHash;
}

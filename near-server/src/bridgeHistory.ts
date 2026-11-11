import { bridgeRecordStatus, fetchIntentsStatus } from "./bridge";
import type { Db } from "./db";
import type { EscrowRow } from "./escrow";

export type BridgeSend = {
  senderEmail: string;
  senderAddress: string;
  recipient: string;
  label: string;
  amount: string;
  txHash: string;
  depositAddress: string;
};

export type BridgeHistoryRow = EscrowRow & {
  kind: "bridge";
  status: string;
  done: boolean;
};

type BridgeRow = {
  id: number;
  sender_email: string;
  sender_address: string;
  recipient: string;
  label: string;
  amount: string;
  tx_hash: string;
  deposit_address: string;
  status: string;
  created_at: string;
  completed_at: string | null;
};

function displayRecipient(row: Pick<BridgeRow, "recipient" | "label">): string {
  const label = row.label.trim();
  if (label && label.toLowerCase() !== row.recipient.toLowerCase()) return label;
  return row.recipient.length > 12 ? `${row.recipient.slice(0, 6)}…${row.recipient.slice(-4)}` : row.recipient;
}

function toHistory(row: BridgeRow): BridgeHistoryRow {
  const done = row.completed_at != null || row.status === "refunded" || row.status === "failed";
  return {
    id: row.id,
    depositId: null,
    recipientEmail: displayRecipient(row),
    senderEmail: row.sender_email,
    senderAddress: row.sender_address,
    amount: row.amount,
    txHash: row.tx_hash,
    createdAt: row.created_at,
    unlockAt: null,
    reclaimable: false,
    claimedAt: row.completed_at,
    direction: "out",
    kind: "bridge",
    status: row.status,
    done,
  };
}

export function recordBridgeSend(db: Db, send: BridgeSend): void {
  db.prepare(
    `INSERT OR IGNORE INTO bridge_sends
      (sender_email, sender_address, recipient, label, amount, tx_hash, deposit_address, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'processing', ?)`,
  ).run(
    send.senderEmail,
    send.senderAddress,
    send.recipient,
    send.label,
    send.amount,
    send.txHash,
    send.depositAddress,
    new Date().toISOString(),
  );
}

export function listBridgeHistory(db: Db, email: string): BridgeHistoryRow[] {
  const rows = db
    .prepare(
      `SELECT id, sender_email, sender_address, recipient, label, amount, tx_hash, deposit_address, status, created_at, completed_at
       FROM bridge_sends WHERE sender_email = ? ORDER BY created_at DESC, id DESC`,
    )
    .all(email) as BridgeRow[];
  return rows.map(toHistory);
}

export async function refreshBridgeSends(
  db: Db,
  readStatus: (depositAddress: string) => Promise<string> = fetchIntentsStatus,
): Promise<void> {
  const open = db
    .prepare(
      `SELECT id, deposit_address, status FROM bridge_sends
       WHERE completed_at IS NULL AND status NOT IN ('refunded', 'failed')`,
    )
    .all() as Array<{ id: number; deposit_address: string; status: string }>;
  for (const row of open) {
    let apiStatus: string;
    try {
      apiStatus = await readStatus(row.deposit_address);
    } catch {
      continue;
    }
    const next = bridgeRecordStatus(apiStatus);
    if (next.complete) {
      db.prepare(
        `UPDATE bridge_sends SET status = 'completed', completed_at = ? WHERE id = ? AND completed_at IS NULL`,
      ).run(new Date().toISOString(), row.id);
      continue;
    }
    if (next.status !== row.status) {
      db.prepare("UPDATE bridge_sends SET status = ? WHERE id = ?").run(next.status, row.id);
    }
  }
}

export function mergeHistory(payments: EscrowRow[], bridges: BridgeHistoryRow[]): Array<EscrowRow | BridgeHistoryRow> {
  const time = (row: EscrowRow) => {
    const raw = row.direction === "out" ? row.createdAt : row.claimedAt || row.createdAt;
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  return [...payments, ...bridges].sort((left, right) => time(right) - time(left) || right.id - left.id);
}

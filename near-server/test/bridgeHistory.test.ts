import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bridgeRecordStatus } from "../src/bridge";
import { listBridgeHistory, mergeHistory, recordBridgeSend, refreshBridgeSends } from "../src/bridgeHistory";
import { openDatabase } from "../src/db";
import type { EscrowRow } from "../src/escrow";

const deposit = "a".repeat(64);

function payment(createdAt: string): EscrowRow {
  return {
    id: 1,
    depositId: null,
    recipientEmail: "ada@example.com",
    senderEmail: "bob@example.com",
    senderAddress: "bob.near",
    amount: "1000000",
    txHash: "pay",
    createdAt,
    unlockAt: null,
    reclaimable: false,
    claimedAt: createdAt,
    direction: "in",
  };
}

describe("bridge history", () => {
  it("treats SUCCESS as complete and keeps processing open", () => {
    assert.deepEqual(bridgeRecordStatus("SUCCESS"), { status: "completed", done: true, complete: true });
    assert.deepEqual(bridgeRecordStatus("completed"), { status: "completed", done: true, complete: true });
    assert.equal(bridgeRecordStatus("PROCESSING").done, false);
    assert.equal(bridgeRecordStatus("REFUNDED").done, true);
    assert.equal(bridgeRecordStatus("FAILED").complete, false);
  });

  it("records a bridge and stops polling after it completes", async () => {
    const db = openDatabase(":memory:");
    recordBridgeSend(db, {
      senderEmail: "ada@example.com",
      senderAddress: "ada.near",
      recipient: "0x1111111111111111111111111111111111111111",
      label: "vitalik.eth",
      amount: "500000",
      txHash: "bridge-tx",
      depositAddress: deposit,
    });
    let calls = 0;
    await refreshBridgeSends(db, async () => {
      calls += 1;
      return "PROCESSING";
    });
    assert.equal(calls, 1);
    assert.equal(listBridgeHistory(db, "ada@example.com")[0]?.status, "processing");
    assert.equal(listBridgeHistory(db, "ada@example.com")[0]?.done, false);
    assert.equal(listBridgeHistory(db, "ada@example.com")[0]?.recipientEmail, "vitalik.eth");

    await refreshBridgeSends(db, async () => "SUCCESS");
    const done = listBridgeHistory(db, "ada@example.com")[0];
    assert.equal(done?.status, "completed");
    assert.equal(done?.done, true);
    assert.ok(done?.claimedAt);

    calls = 0;
    await refreshBridgeSends(db, async () => {
      calls += 1;
      return "FAILED";
    });
    assert.equal(calls, 0);
    assert.equal(listBridgeHistory(db, "ada@example.com")[0]?.status, "completed");
    db.close();
  });

  it("stops polling a refund without marking it complete", async () => {
    const db = openDatabase(":memory:");
    recordBridgeSend(db, {
      senderEmail: "ada@example.com",
      senderAddress: "ada.near",
      recipient: "0x2222222222222222222222222222222222222222",
      label: "0x2222222222222222222222222222222222222222",
      amount: "500000",
      txHash: "refund-tx",
      depositAddress: "b".repeat(64),
    });
    await refreshBridgeSends(db, async () => "REFUNDED");
    const row = listBridgeHistory(db, "ada@example.com")[0];
    assert.equal(row?.status, "refunded");
    assert.equal(row?.done, true);
    assert.equal(row?.claimedAt, null);
    let calls = 0;
    await refreshBridgeSends(db, async () => {
      calls += 1;
      return "SUCCESS";
    });
    assert.equal(calls, 0);
    db.close();
  });

  it("lists a bridge ahead of an older payment", () => {
    const bridge = listBridgeHistory(openDatabase(":memory:"), "nobody@example.com");
    assert.deepEqual(bridge, []);
    const merged = mergeHistory(
      [payment("2026-11-11T00:00:00.000Z")],
      [
        {
          ...payment("2026-11-11T22:00:00.000Z"),
          id: 2,
          kind: "bridge",
          status: "processing",
          done: false,
          direction: "out",
        },
      ],
    );
    assert.equal(merged[0]?.id, 2);
    assert.equal(merged[1]?.id, 1);
  });
});

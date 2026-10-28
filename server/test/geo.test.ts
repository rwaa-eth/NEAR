import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeRing, presenceVerdict, ringSelfIntersects } from "../src/geo";

describe("rings", () => {
  it("closes an open ring", () => {
    const ring = normalizeRing([
      [0, 0],
      [0, 0.001],
      [0.001, 0],
    ]);
    assert.equal(ring.length, 4);
    assert.deepEqual(ring[0], ring[3]);
  });

  it("rejects a self-crossing ring", () => {
    assert.throws(() =>
      normalizeRing([
        [0, 0],
        [1, 1],
        [0, 1],
        [1, 0],
        [0, 0],
      ]),
    );
  });

  it("accepts a simple square", () => {
    const ring = [
      { lng: 0, lat: 0 },
      { lng: 1, lat: 0 },
      { lng: 1, lat: 1 },
      { lng: 0, lat: 1 },
      { lng: 0, lat: 0 },
    ];
    assert.equal(ringSelfIntersects(ring), false);
  });
});

describe("presence", () => {
  it("treats a coarse fix as inconclusive", () => {
    assert.equal(presenceVerdict(10, 400, 150), "inconclusive");
  });

  it("stays home inside the radius", () => {
    assert.equal(presenceVerdict(40, 80, 150), "home");
  });

  it("is away beyond the accuracy and the radius", () => {
    assert.equal(presenceVerdict(500, 50, 150), "away");
  });
});

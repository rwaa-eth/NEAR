import { createHash } from "node:crypto";

export const INCONCLUSIVE_ACCURACY_M = 300;

/** Stable hash of a normalized ring. The same coordinates always yield the same revision. */
export function geometryRev(ring: Array<[number, number]>): string {
  return createHash("sha256").update(JSON.stringify(ring)).digest("hex");
}

export interface LngLat {
  lng: number;
  lat: number;
}

export function haversineM(a: LngLat, b: LngLat): number {
  const radius = 6_371_000;
  const p1 = (a.lat * Math.PI) / 180;
  const p2 = (b.lat * Math.PI) / 180;
  const dp = ((b.lat - a.lat) * Math.PI) / 180;
  const dl = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
}

function cross(p: LngLat, q: LngLat, r: LngLat): number {
  return (q.lng - p.lng) * (r.lat - p.lat) - (q.lat - p.lat) * (r.lng - p.lng);
}

function segmentsCross(a: LngLat, b: LngLat, c: LngLat, d: LngLat): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

export function ringSelfIntersects(ring: LngLat[]): boolean {
  const edges = ring.length - 1;
  if (edges < 3) return false;
  for (let i = 0; i < edges; i += 1) {
    for (let j = i + 1; j < edges; j += 1) {
      if (j === i + 1) continue;
      if (i === 0 && j === edges - 1) continue;
      if (segmentsCross(ring[i], ring[i + 1], ring[j], ring[j + 1])) return true;
    }
  }
  return false;
}

export function normalizeRing(input: Array<[number, number]>): Array<[number, number]> {
  if (input.length < 3) throw new Error("a ring needs at least 3 points");
  for (const [lng, lat] of input) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("coordinates are out of range");
    }
  }
  const first = input[0];
  const last = input[input.length - 1];
  const ring = first[0] === last[0] && first[1] === last[1] ? input.slice() : [...input, first];
  const distinct = new Set(ring.slice(0, -1).map((point) => `${point[0]},${point[1]}`));
  if (distinct.size < 3) throw new Error("a ring needs at least 3 distinct points");
  const points = ring.map(([lng, lat]) => ({ lng, lat }));
  if (ringSelfIntersects(points)) throw new Error("the ring crosses itself");
  return ring;
}

export function centroid(ring: Array<[number, number]>): LngLat {
  const unique = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring.slice(0, -1) : ring;
  const sum = unique.reduce((acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }), { lng: 0, lat: 0 });
  return { lng: sum.lng / unique.length, lat: sum.lat / unique.length };
}

export function bounds(ring: Array<[number, number]>): { minLng: number; maxLng: number; minLat: number; maxLat: number } {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return { minLng, maxLng, minLat, maxLat };
}

export type PresenceVerdict = "home" | "away" | "inconclusive";

export function presenceVerdict(distanceM: number | null, accuracyM: number, radiusM: number): PresenceVerdict {
  if (distanceM == null || accuracyM > INCONCLUSIVE_ACCURACY_M) return "inconclusive";
  if (distanceM <= Math.max(radiusM, accuracyM)) return "home";
  return "away";
}

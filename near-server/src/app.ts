import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import { z, ZodError } from "zod";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import { loadConfig, type Config } from "./config";
import { openDatabase, type Db } from "./db";
import { issueChallenge, tokenOk, verifyAssertion, verifyRegistration, type AssertionHeaders } from "./auth";
import { bounds, centroid, geometryRev, haversineM, normalizeRing, presenceVerdict } from "./geo";
import { publicKeyToString } from "./accountId";
import { initPasskeyAccount } from "./relayer";
import { registerNearWallet } from "./wallet";

const registerBody = z.object({
  challengeId: z.string().uuid(),
  credential: z.object({
    id: z.string(),
    rawId: z.string(),
    type: z.literal("public-key"),
    response: z.object({
      clientDataJSON: z.string(),
      attestationObject: z.string(),
      transports: z.array(z.string()).optional(),
    }),
    clientExtensionResults: z.record(z.any()).optional(),
    authenticatorAttachment: z.string().optional(),
  }),
});

const parcelBody = z.object({
  id: z.string().uuid().optional(),
  ring: z.array(z.tuple([z.number(), z.number()])).min(3),
});

const presenceBody = z.object({
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  accuracyM: z.number().nonnegative(),
  recordedAt: z.string().min(1),
  homeLatitude: z.number().gte(-90).lte(90).optional(),
  homeLongitude: z.number().gte(-180).lte(180).optional(),
  homeRadiusM: z.number().positive().max(5000).optional(),
});

function statusError(statusCode: number, message: string): Error {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

function assetLinks(config: Config): unknown[] {
  if (config.fingerprints.length === 0) return [];
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls", "delegate_permission/common.get_login_creds"],
      target: {
        namespace: "android_app",
        package_name: config.packageName,
        sha256_cert_fingerprints: config.fingerprints,
      },
    },
  ];
}

export function buildApp(config: Config = loadConfig(), db: Db = openDatabase(config.sqlitePath)): FastifyInstance {
  const app = Fastify({ logger: false });
  app.decorateRequest("rawBody", "");

  app.addContentTypeParser("application/json", { parseAs: "string" }, (request, body, done) => {
    const raw = typeof body === "string" ? body : "";
    request.rawBody = raw;
    if (!raw) {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(raw));
    } catch (error) {
      done(error as Error, undefined);
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    const known = error as { statusCode?: number; message?: string };
    const statusCode = error instanceof ZodError ? 400 : (known.statusCode ?? 500);
    reply.code(statusCode >= 400 ? statusCode : 500).send({ error: known.message ?? "request failed" });
  });

  app.addHook("preHandler", async (request, reply) => {
    if (isPublic(request)) return;
    if (!tokenOk(request.headers.authorization, config.token)) {
      return reply.code(401).send({ error: "missing static token" });
    }
    const url = request.routeOptions.url ?? "";
    if (url === "/v1/auth/challenge" || url === "/v1/auth/register") return;
    const headers = readAssertion(request);
    const verified = await verifyAssertion(config, db, headers, request.method, request.url, request.rawBody ?? "");
    request.accountId = verified.accountId;
    request.credentialId = verified.credentialId;
  });

  const walletPage = () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "public", "wallet.html"), "utf8");
    return html;
  };

  app.get("/", async (_request, reply) => reply.type("text/html").send(walletPage()));
  app.get("/send", async (_request, reply) => reply.type("text/html").send(walletPage()));

  app.get("/login", async (_request, reply) => {
    const html = fs
      .readFileSync(path.join(__dirname, "..", "public", "login.html"), "utf8")
      .replaceAll("__API_TOKEN__", config.token)
      .replaceAll("__RP_ID__", config.rpId);
    return reply.type("text/html").send(html);
  });

  app.get("/login.js", async (_request, reply) => {
    const script = fs.readFileSync(path.join(__dirname, "..", "public", "login.js"), "utf8");
    return reply.type("application/javascript").send(script);
  });

  app.get("/favicon.ico", async (_request, reply) => {
    const icon = fs.readFileSync(path.join(__dirname, "..", "public", "favicon.ico"));
    return reply.type("image/x-icon").send(icon);
  });

  app.get("/.well-known/assetlinks.json", async () => assetLinks(config));

  app.post("/v1/auth/challenge", async () => issueChallenge(db));

  app.post("/v1/auth/register", async (request) => {
    const body = registerBody.parse(request.body);
    const credential = {
      ...body.credential,
      clientExtensionResults: body.credential.clientExtensionResults ?? {},
    } as RegistrationResponseJSON;
    const registered = await verifyRegistration(config, db, body.challengeId, credential);
    const relayer = await initPasskeyAccount(config, registered.accountId, registered.publicKey);
    return {
      accountId: registered.accountId,
      credentialId: registered.credentialId,
      publicKey: publicKeyToString(registered.publicKey),
      relayer,
    };
  });

  app.post("/v1/auth/session", async (request) => ({
    accountId: request.accountId,
    credentialId: request.credentialId,
  }));

  app.get("/v1/auth/credential", async (request) => {
    const query = z.object({ rawId: z.string().optional() }).parse(request.query);
    if (query.rawId && query.rawId !== request.credentialId) throw statusError(403, "rawId does not match the signed passkey");
    const row = db
      .prepare("SELECT near_account_id, public_key_near FROM credentials WHERE credential_id = ?")
      .get(request.credentialId) as { near_account_id: string; public_key_near: string };
    return { accountId: row.near_account_id, publicKey: row.public_key_near };
  });

  app.post("/v1/parcels", async (request) => {
    const body = parcelBody.parse(request.body);
    let ring: Array<[number, number]>;
    try {
      ring = normalizeRing(body.ring);
    } catch (error) {
      throw statusError(400, error instanceof Error ? error.message : "invalid ring");
    }
    const box = bounds(ring);
    const center = centroid(ring);
    const now = new Date().toISOString();
    const owner = request.accountId ?? "";
    const revision = geometryRev(ring);
    const owned = db.prepare("SELECT id FROM parcels WHERE owner_account_id = ?").get(owner) as { id: string } | undefined;
    if (body.id) {
      const existing = db.prepare("SELECT owner_account_id FROM parcels WHERE id = ?").get(body.id) as
        | { owner_account_id: string }
        | undefined;
      if (existing && existing.owner_account_id !== owner) throw statusError(403, "parcel is owned by another account");
      if (!existing && owned) throw statusError(409, "this account already has a lot");
    }
    const id = owned?.id ?? body.id ?? randomUUID();
    const ringJson = JSON.stringify(ring);
    if (owned) {
      db.prepare(
        `UPDATE parcels
         SET ring_json = ?, geometry_rev = ?, min_lat = ?, max_lat = ?, min_lng = ?, max_lng = ?, updated_at = ?
         WHERE owner_account_id = ?`,
      ).run(ringJson, revision, box.minLat, box.maxLat, box.minLng, box.maxLng, now, owner);
    } else {
      db.prepare(
        `INSERT INTO parcels (
           id, owner_account_id, ring_json, geometry_rev, min_lat, max_lat, min_lng, max_lng, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, owner, ringJson, revision, box.minLat, box.maxLat, box.minLng, box.maxLng, now, now);
    }
    db.prepare(
      `INSERT INTO homes (owner_account_id, latitude, longitude, radius_m) VALUES (?, ?, ?, 150)
       ON CONFLICT(owner_account_id) DO UPDATE SET latitude = excluded.latitude, longitude = excluded.longitude`,
    ).run(owner, center.lat, center.lng);
    return { id, accountId: owner, ownerAccountId: owner, ring, geometryRev: revision };
  });

  app.get("/v1/lots/mine", async (request) => {
    const owner = request.accountId ?? "";
    const row = db
      .prepare("SELECT id, ring_json, geometry_rev, updated_at FROM parcels WHERE owner_account_id = ?")
      .get(owner) as { id: string; ring_json: string; geometry_rev: string; updated_at: string } | undefined;
    if (!row) return { accountId: owner, lot: null };
    return {
      accountId: owner,
      lot: {
        id: row.id,
        ring: JSON.parse(row.ring_json) as Array<[number, number]>,
        geometryRev: row.geometry_rev,
        updatedAt: row.updated_at,
      },
    };
  });

  app.get("/v1/parcels/nearby", async (request) => {
    const query = z
      .object({
        lat: z.coerce.number(),
        lng: z.coerce.number(),
        radiusM: z.coerce.number().positive().max(2000).default(150),
      })
      .parse(request.query);
    const pad = query.radiusM / 111_320 + 0.02;
    const rows = db
      .prepare(
        `SELECT id, owner_account_id, ring_json FROM parcels
         WHERE max_lat >= ? AND min_lat <= ? AND max_lng >= ? AND min_lng <= ?`,
      )
      .all(query.lat - pad, query.lat + pad, query.lng - pad, query.lng + pad) as Array<{
      id: string;
      owner_account_id: string;
      ring_json: string;
    }>;
    const here = { lat: query.lat, lng: query.lng };
    const parcels = rows
      .map((row) => {
        const ring = JSON.parse(row.ring_json) as Array<[number, number]>;
        return { id: row.id, owner: row.owner_account_id, ring };
      })
      .filter((parcel) => {
        const center = centroid(parcel.ring);
        if (haversineM(here, center) <= query.radiusM) return true;
        return parcel.ring.some(([lng, lat]) => haversineM(here, { lng, lat }) <= query.radiusM);
      })
      .map((parcel) => ({
        id: parcel.id,
        ring: parcel.ring,
        owned: parcel.owner === request.accountId,
      }));
    return { parcels };
  });

  app.post("/v1/presence", async (request) => {
    const body = presenceBody.parse(request.body);
    const owner = request.accountId ?? "";
    if (body.homeLatitude != null && body.homeLongitude != null) {
      db.prepare(
        `INSERT INTO homes (owner_account_id, latitude, longitude, radius_m) VALUES (?, ?, ?, ?)
         ON CONFLICT(owner_account_id) DO UPDATE SET
           latitude = excluded.latitude, longitude = excluded.longitude, radius_m = excluded.radius_m`,
      ).run(owner, body.homeLatitude, body.homeLongitude, body.homeRadiusM ?? 150);
    }
    const home = db.prepare("SELECT latitude, longitude, radius_m FROM homes WHERE owner_account_id = ?").get(owner) as
      | { latitude: number; longitude: number; radius_m: number }
      | undefined;
    const distance = home
      ? haversineM({ lat: body.latitude, lng: body.longitude }, { lat: home.latitude, lng: home.longitude })
      : null;
    const atHome = presenceVerdict(distance, body.accuracyM, home?.radius_m ?? 150);
    const id = randomUUID();
    db.prepare(
      `INSERT INTO presence_samples (id, owner_account_id, latitude, longitude, accuracy_m, at_home, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, owner, body.latitude, body.longitude, body.accuracyM, atHome, body.recordedAt);
    return { id, atHome, accuracyM: body.accuracyM };
  });

  registerNearWallet(app, config, db);

  return app;
}

function isPublic(request: FastifyRequest): boolean {
  const url = request.url.split("?")[0];
  return (
    url === "/" ||
    url === "/send" ||
    url === "/login" ||
    url === "/login.js" ||
    url === "/favicon.ico" ||
    url === "/.well-known/assetlinks.json" ||
    url === "/ethw" ||
    url === "/wallet.js" ||
    url === "/ragraphic.jpg" ||
    url.startsWith("/ethw/")
  );
}

function readAssertion(request: FastifyRequest): AssertionHeaders {
  const header = (name: string) => {
    const value = request.headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  const challengeId = header("x-challenge-id");
  const credentialId = header("x-credential-id");
  const clientDataJSON = header("x-client-data");
  const authenticatorData = header("x-authenticator-data");
  const signature = header("x-signature");
  if (!challengeId || !credentialId || !clientDataJSON || !authenticatorData || !signature) {
    throw statusError(401, "missing passkey signature");
  }
  return {
    challengeId,
    credentialId,
    clientDataJSON,
    authenticatorData,
    signature,
    userHandle: header("x-user-handle"),
  };
}

declare module "fastify" {
  interface FastifyRequest {
    rawBody: string;
    accountId?: string;
    credentialId?: string;
  }
}

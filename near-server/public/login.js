const token = document.querySelector('meta[name="api-token"]').content;
const rpId = document.querySelector('meta[name="rp-id"]').content;
const result = document.getElementById("result");

function bytesToB64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function b64urlToBytes(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function sha256(bytes) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

async function bindChallenge(nonceB64, method, path, body) {
  const nonce = b64urlToBytes(nonceB64);
  const bodyHash = await sha256(new TextEncoder().encode(body));
  const methodBytes = new TextEncoder().encode(method);
  const pathBytes = new TextEncoder().encode(path);
  const total = new Uint8Array(nonce.length + methodBytes.length + pathBytes.length + bodyHash.length);
  let offset = 0;
  total.set(nonce, offset);
  offset += nonce.length;
  total.set(methodBytes, offset);
  offset += methodBytes.length;
  total.set(pathBytes, offset);
  offset += pathBytes.length;
  total.set(bodyHash, offset);
  return bytesToB64url(await sha256(total));
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body != null) headers.set("Content-Type", "application/json");
  const response = await fetch(path, { ...options, headers });
  const text = await response.text();
  if (!response.ok) throw new Error(text || response.statusText);
  return text ? JSON.parse(text) : {};
}

function show(value) {
  result.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

document.getElementById("create").onclick = async () => {
  try {
    const challenge = await api("/v1/auth/challenge", { method: "POST", body: "" });
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: b64urlToBytes(challenge.nonce),
        rp: { name: "RWAA", id: rpId },
        user: {
          id: crypto.getRandomValues(new Uint8Array(32)),
          name: "rwaa",
          displayName: "RWAA",
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        attestation: "direct",
        timeout: 60000,
      },
    });
    const body = JSON.stringify({
      challengeId: challenge.challengeId,
      credential: {
        id: credential.id,
        rawId: bytesToB64url(new Uint8Array(credential.rawId)),
        type: credential.type,
        response: {
          clientDataJSON: bytesToB64url(new Uint8Array(credential.response.clientDataJSON)),
          attestationObject: bytesToB64url(new Uint8Array(credential.response.attestationObject)),
        },
        clientExtensionResults: credential.getClientExtensionResults(),
      },
    });
    show(await api("/v1/auth/register", { method: "POST", body }));
  } catch (error) {
    show(error.message);
  }
};

document.getElementById("signin").onclick = async () => {
  try {
    const challenge = await api("/v1/auth/challenge", { method: "POST", body: "" });
    const method = "POST";
    const path = "/v1/auth/session";
    const body = "";
    const webauthnChallenge = await bindChallenge(challenge.nonce, method, path, body);
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: b64urlToBytes(webauthnChallenge),
        rpId,
        userVerification: "required",
        timeout: 60000,
      },
    });
    const headers = {
      "X-Challenge-Id": challenge.challengeId,
      "X-Credential-Id": credential.id,
      "X-Client-Data": bytesToB64url(new Uint8Array(credential.response.clientDataJSON)),
      "X-Authenticator-Data": bytesToB64url(new Uint8Array(credential.response.authenticatorData)),
      "X-Signature": bytesToB64url(new Uint8Array(credential.response.signature)),
    };
    if (credential.response.userHandle) {
      headers["X-User-Handle"] = bytesToB64url(new Uint8Array(credential.response.userHandle));
    }
    show(await api(path, { method, body, headers }));
  } catch (error) {
    show(error.message);
  }
};

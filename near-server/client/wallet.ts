import { keccak_256 } from "@noble/hashes/sha3";
import { connect, keyStores, KeyPair, transactions } from "near-api-js";
import QRCode from "qrcode";
import { eip681Payment, payeeFromQr, type Eip681Payment } from "../src/payee";
import { mountAddressScanner } from "./scan";

type Config = {
  network: string;
  rpc: string;
  token: string | null;
  symbol: string;
  decimals: number;
  escrow: string | null;
  mailReady: boolean;
};

type Account = {
  email: string;
  accountId: string;
  publicKey: string;
  createdAt: string;
};

type EscrowRow = {
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
  kind?: "bridge";
  status?: string;
  done?: boolean;
};

type Detected =
  | { kind: "empty"; label: string; detail: string }
  | { kind: "email"; label: string; detail: string; email: string }
  | { kind: "phone"; label: string; detail: string }
  | { kind: "near"; label: string; detail: string; accountId: string }
  | { kind: "evm"; label: string; detail: string }
  | { kind: "ens"; label: string; detail: string }
  | { kind: "unknown"; label: string; detail: string };

const KEYS = "nearw.keys";
const PASSKEYS = "nearw.passkeys";
const EMAIL_KEY = "nearw.email";
const SENT_EMAILS = "nearw.sent-emails";
const PENDING_KEY = "nearw.pending";
const COLLECT_TIP_KEY = "nearw.collectTip";
const TRANSFER_GAS = 30n * 10n ** 12n;
const CALL_GAS = 80n * 10n ** 12n;

const setup = document.querySelector<HTMLElement>("#setup")!;
const wallet = document.querySelector<HTMLElement>("#wallet")!;
const sendView = document.querySelector<HTMLElement>("#send-view")!;
const sendDock = document.querySelector<HTMLElement>("#send-dock")!;
const statusEl = document.querySelector<HTMLElement>("#status")!;
statusEl.addEventListener("transitionend", (event) => {
  if (event.propertyName !== "opacity" || !statusEl.classList.contains("fade")) return;
  statusEl.classList.add("showing");
  statusEl.textContent = "";
  statusEl.classList.remove("fade");
  void statusEl.offsetWidth;
  statusEl.classList.remove("showing");
});
const emailInput = document.querySelector<HTMLInputElement>("#email")!;
const otpBox = document.querySelector<HTMLElement>("#otp-box")!;
const otpInput = document.querySelector<HTMLInputElement>("#otp")!;
const signupKeyField = document.querySelector<HTMLElement>("#signup-key-field")!;
const signupKeyInput = document.querySelector<HTMLInputElement>("#signup-key")!;
const useSignupKeyButton = document.querySelector<HTMLButtonElement>("#use-signup-key")!;
const otpDigits = [...document.querySelectorAll<HTMLElement>("#otp-slots .otp-digit")];
const inviteDigits = [...document.querySelectorAll<HTMLElement>("#signup-slots .otp-digit")];
const sendCodeButton = document.querySelector<HTMLButtonElement>("#send-code")!;
const retryButton = document.querySelector<HTMLButtonElement>("#retry-passkey")!;
const creatingWrap = document.querySelector<HTMLElement>("#creating-wrap")!;
const creatingButton = document.querySelector<HTMLButtonElement>("#creating")!;
const openButton = document.querySelector<HTMLButtonElement>("#open")!;
const openingButton = document.querySelector<HTMLButtonElement>("#opening")!;
const openWrap = document.querySelector<HTMLElement>("#open-wrap")!;
const accountBox = document.querySelector<HTMLElement>("#account")!;
const accountEmail = document.querySelector<HTMLElement>("#account-email")!;
const accountTrigger = document.querySelector<HTMLButtonElement>("#account-trigger")!;
const accountMenu = document.querySelector<HTMLElement>("#account-menu")!;
const me = document.querySelector<HTMLImageElement>("#me")!;
const nearBalance = document.querySelector<HTMLElement>("#eth")!;
const tokenLabel = document.querySelector<HTMLElement>("#token-label")!;
const tokenBalance = document.querySelector<HTMLElement>("#token")!;
const addressEl = document.querySelector<HTMLElement>("#address")!;
const copyAddressButton = document.querySelector<HTMLButtonElement>("#copy-address")!;
const explorer = document.querySelector<HTMLAnchorElement>("#explorer")!;
const qr = document.querySelector<HTMLCanvasElement>("#qr")!;
const collectSection = document.querySelector<HTMLElement>("#collect-section")!;
const incomingTip = document.querySelector<HTMLButtonElement>("#incoming-tip")!;
const incomingNote = document.querySelector<HTMLElement>("#incoming-note")!;
const incomingList = document.querySelector<HTMLElement>("#incoming")!;
const collectButton = document.querySelector<HTMLButtonElement>("#collect")!;
const collectingButton = document.querySelector<HTMLButtonElement>("#collecting")!;
const collectWrap = document.querySelector<HTMLElement>("#collect-wrap")!;
const historyList = document.querySelector<HTMLElement>("#history")!;
const outgoingSection = document.querySelector<HTMLElement>("#outgoing-section")!;
const outgoingList = document.querySelector<HTMLElement>("#outgoing")!;
const networkLabel = document.querySelector<HTMLElement>("#network-label")!;
const cashButtons = [...document.querySelectorAll<HTMLButtonElement>(".cash-lozenge")];
const cashModal = document.querySelector<HTMLElement>("#cash-modal")!;
const cashImage = document.querySelector<HTMLImageElement>("#cash-step")!;
const cashPrev = document.querySelector<HTMLButtonElement>("#cash-prev")!;
const cashNext = document.querySelector<HTMLButtonElement>("#cash-next")!;
const recipientInput = document.querySelector<HTMLInputElement>("#recipient")!;
const suggestList = document.querySelector<HTMLElement>("#recipient-suggest")!;
const recipientAvatar = document.querySelector<HTMLImageElement>("#recipient-avatar")!;
const kindChip = document.querySelector<HTMLElement>("#kind-chip")!;
const resolvedEl = document.querySelector<HTMLElement>("#resolved")!;
const quoteTimerEl = document.querySelector<HTMLElement>("#quote-timer")!;
const amountInput = document.querySelector<HTMLInputElement>("#amount")!;
const sendButton = document.querySelector<HTMLButtonElement>("#send")!;
const sendWrap = document.querySelector<HTMLElement>("#send-wrap")!;
const fundsNote = document.querySelector<HTMLElement>("#funds-note")!;
const paymentPanel = document.querySelector<HTMLElement>("#payment-request")!;
const paymentAmount = document.querySelector<HTMLElement>("#payment-amount")!;
const paymentUuidRow = document.querySelector<HTMLElement>("#payment-uuid-row")!;
const paymentUuid = document.querySelector<HTMLElement>("#payment-uuid")!;
const paymentLabelRow = document.querySelector<HTMLElement>("#payment-label-row")!;
const paymentLabel = document.querySelector<HTMLElement>("#payment-label")!;
const bridgeFeeNote = document.querySelector<HTMLElement>("#bridge-fee-note")!;

let config: Config = {
  network: "testnet",
  rpc: "/ethw/api/rpc",
  token: null,
  symbol: "USDT",
  decimals: 6,
  escrow: null,
  mailReady: false,
};
let current: { email: string; accountId: string; secret: string } | null = null;
let verified: { email: string; emailToken: string } | null = null;
let lookupTimer = 0;
let setupLookupTimer = 0;
let accountLookup = 0;
let knownAccount = false;
let suggestIndex = -1;
let otpBusy = false;
let otpAttempted = "";
let inviteAttempted = "";
let balanceTimer = 0;
let bridgePoll = 0;
let balanceInFlight = false;
let tokenBalanceRaw: bigint | null = null;
let sendReady: boolean | null = null;
let sendLabel = "Send";
let recipientToken = 0;
let paymentRequest: Eip681Payment | null = null;
let writingAmount = false;
let writingRecipient = false;
let quoteTimer = 0;
let quoteDeadline = 0;
const QUOTE_REFRESH_MS = 2 * 60 * 1000;
const NETWORK_WAIT = "Network error; wait a few seconds and try again.";
const gravatarCache = new Map<string, string>();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_BRIDGE_WHOLE = 10n;

function minimumBridgeAmount(): bigint {
  return MIN_BRIDGE_WHOLE * 10n ** BigInt(config.decimals);
}

function syncSetupButtons(): void {
  const ok = EMAIL_PATTERN.test(emailInput.value.trim());
  const known = ok && knownAccount;
  sendCodeButton.hidden = known;
  openWrap.hidden = !known;
  openButton.disabled = !known;
  sendCodeButton.disabled = !ok || !config.mailReady;
}

function scheduleAccountLookup(): void {
  knownAccount = false;
  syncSetupButtons();
  window.clearTimeout(setupLookupTimer);
  const email = emailInput.value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return;
  const generation = ++accountLookup;
  setupLookupTimer = window.setTimeout(() => {
    lookupKnownAccount(email, generation).catch((error: unknown) => {
      if (generation !== accountLookup) return;
      setStatus(explain(error));
    });
  }, 300);
}

async function lookupKnownAccount(email: string, generation: number): Promise<void> {
  const found = await api<{ registered: boolean }>(`/ethw/api/account?email=${encodeURIComponent(email)}`);
  if (generation !== accountLookup || emailInput.value.trim().toLowerCase() !== email) return;
  knownAccount = found.registered;
  syncSetupButtons();
}

let toastTimer = 0;

function setStatus(message: string): void {
  window.clearTimeout(toastTimer);
  statusEl.classList.add("showing");
  statusEl.classList.remove("fade");
  statusEl.textContent = message;
  void statusEl.offsetWidth;
  statusEl.classList.remove("showing");
  if (!message) return;
  toastTimer = window.setTimeout(() => statusEl.classList.add("fade"), 10_000);
}

function explain(error: unknown): string {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const match = message.match(/"ExecutionError":"((?:\\.|[^"\\])*)"/);
  if (!match) return isNetworkDrop(error) ? NETWORK_WAIT : message;
  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return message;
  }
}

/** Safari reports this when a request dies as the passkey sheet closes. */
function isNetworkDrop(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return /load failed|failed to fetch|networkerror|network request failed|internet connection appears to be offline/i.test(message);
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(path, {
        method: body === undefined ? "GET" : "POST",
        headers: body === undefined ? undefined : { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
      return payload as T;
    } catch (error) {
      last = error;
      if (!isNetworkDrop(error) || attempt === 2) break;
      await pause(400 * (attempt + 1));
    }
  }
  throw last instanceof Error ? last : new Error(NETWORK_WAIT);
}

function keys(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(KEYS) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function saveKey(accountId: string, secret: string): void {
  const next = keys();
  next[accountId] = secret;
  window.localStorage.setItem(KEYS, JSON.stringify(next));
}

function passkeys(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(PASSKEYS) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function sentEmails(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SENT_EMAILS) || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.includes("@"));
  } catch {
    return [];
  }
}

function rememberSentEmail(email: string): void {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return;
  const next = [normalized, ...sentEmails().filter((item) => item !== normalized)].slice(0, 100);
  window.localStorage.setItem(SENT_EMAILS, JSON.stringify(next));
}

function savePasskey(email: string, credentialId: string): void {
  const next = passkeys();
  next[email] = credentialId;
  window.localStorage.setItem(PASSKEYS, JSON.stringify(next));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function isTransientPasskey(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return /transient reason/i.test(message);
}

function isPasskeyCancel(error: unknown): boolean {
  if (isTransientPasskey(error)) return false;
  return error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "AbortError");
}

let passkeyQueue: Promise<unknown> = Promise.resolve();

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Windows Hello often rejects one prompt, then accepts the same request a moment later. */
async function withPasskeyRetry<T>(run: () => Promise<T>): Promise<T> {
  const next = passkeyQueue.then(async () => {
    const pauses = [0, 400];
    for (let attempt = 0; attempt < pauses.length; attempt += 1) {
      if (pauses[attempt] > 0) {
        setStatus("Passkey didn't respond. Trying again.");
        await pause(pauses[attempt]);
      }
      try {
        return await run();
      } catch (error) {
        if (!isTransientPasskey(error) || attempt === pauses.length - 1) throw error;
      }
    }
    throw new Error("Passkey didn't respond.");
  });
  passkeyQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function createPasskey(email: string): Promise<string> {
  if (!window.PublicKeyCredential) throw new Error("This browser cannot create a passkey.");
  const userId = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email)));
  return withPasskeyRetry(async () => {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "RaOpenwallet", id: window.location.hostname },
        user: { id: userId, name: email, displayName: email },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          residentKey: "required",
          requireResidentKey: true,
          userVerification: "required",
        },
        timeout: 60_000,
        attestation: "none",
      },
    });
    if (!credential || credential.type !== "public-key") throw new Error("Passkey setup was cancelled.");
    return bytesToBase64Url(new Uint8Array((credential as PublicKeyCredential).rawId));
  });
}

async function assertPasskey(credentialId: string): Promise<void> {
  await withPasskeyRetry(async () => {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rpId: window.location.hostname,
        allowCredentials: [{ type: "public-key", id: base64UrlToBytes(credentialId) as BufferSource }],
        userVerification: "required",
        timeout: 60_000,
      },
    });
    if (!assertion) throw new Error("Passkey sign-in was cancelled.");
  });
}

function emailHash(email: string): string {
  const digest = keccak_256(new TextEncoder().encode(email.trim().toLowerCase()));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatAmount(amount: string, decimals: number, maxDp = decimals): string {
  const digits = amount.replace(/^-/, "").replace(/\D/g, "").padStart(decimals + 1, "0");
  let whole = digits.slice(0, -decimals) || "0";
  let frac = digits.slice(-decimals);
  const places = Math.min(maxDp, frac.length);
  const keep = frac.slice(0, places);
  const roundUp = places < frac.length && frac[places] >= "5";
  if (roundUp) {
    const bumped = BigInt(whole) * 10n ** BigInt(places) + BigInt(keep || "0") + 1n;
    const text = bumped.toString().padStart(places + 1, "0");
    whole = text.slice(0, -places);
    frac = text.slice(-places);
  } else {
    frac = keep;
  }
  frac = frac.replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}

function parseAmount(text: string, decimals: number): bigint {
  const trimmed = text.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) throw new Error("Enter an amount.");
  const [whole, frac = ""] = trimmed.split(".");
  if (frac.length > decimals) throw new Error("Too many decimal places.");
  const value = BigInt(whole + frac.padEnd(decimals, "0"));
  if (value <= 0n) throw new Error("Enter an amount greater than zero.");
  return value;
}

function explorerBase(): string {
  return config.network === "mainnet" ? "https://nearblocks.io" : "https://testnet.nearblocks.io";
}

function applyNetwork(): void {
  const mainnet = config.network === "mainnet";
  networkLabel.textContent = mainnet ? "NEAR mainnet" : "NEAR testnet";
  recipientInput.placeholder = mainnet ? "email, +phone, or name.near" : "email, +phone, or name.testnet";
}

function pathIsSend(): boolean {
  return window.location.pathname === "/send";
}

function show(view: "setup" | "wallet" | "send"): void {
  setup.hidden = view !== "setup";
  wallet.hidden = view !== "wallet";
  sendView.hidden = view !== "send";
  sendDock.hidden = view !== "wallet";
  accountBox.hidden = !current;
  if (view === "setup") closeCashGuide();
}

function stopQuoteCountdown(): void {
  window.clearInterval(quoteTimer);
  quoteTimer = 0;
  quoteDeadline = 0;
  quoteTimerEl.hidden = true;
  quoteTimerEl.textContent = "";
}

function quoteCountdownLabel(remainingMs: number): string {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `Quote refreshes in ${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function startQuoteCountdown(): void {
  stopQuoteCountdown();
  quoteDeadline = Date.now() + QUOTE_REFRESH_MS;
  quoteTimerEl.hidden = false;
  const tick = (): void => {
    const left = quoteDeadline - Date.now();
    if (left > 0) {
      quoteTimerEl.textContent = quoteCountdownLabel(left);
      return;
    }
    stopQuoteCountdown();
    if (sendWrap.classList.contains("busy") || !pathIsSend()) return;
    quoteTimerEl.hidden = false;
    quoteTimerEl.textContent = "Refreshing the quote.";
    resolveRecipient().catch((error: unknown) => setStatus(explain(error)));
  };
  tick();
  quoteTimer = window.setInterval(tick, 1000);
}

function renderRoute(): void {
  if (!current) {
    show("setup");
    stopQuoteCountdown();
    return;
  }
  const sending = pathIsSend();
  show(sending ? "send" : "wallet");
  if (!sending) stopQuoteCountdown();
  if (sending && paymentRequest) {
    resolveRecipient().catch((error: unknown) => setStatus(explain(error)));
  }
}

function leaveSendAfterSuccess(): void {
  window.setTimeout(() => {
    if (!current || !pathIsSend()) return;
    window.history.pushState({}, "", "/");
    renderRoute();
  }, 2000);
}

async function gravatarUrl(email: string, size: number): Promise<string> {
  const key = `${email}|${size}`;
  const cached = gravatarCache.get(key);
  if (cached) return cached;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim().toLowerCase()));
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const url = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  gravatarCache.set(key, url);
  return url;
}

async function nearAccount() {
  if (!current) throw new Error("Open your wallet first.");
  const keyStore = new keyStores.InMemoryKeyStore();
  await keyStore.setKey(config.network, current.accountId, KeyPair.fromString(current.secret as never));
  const near = await connect({
    networkId: config.network,
    nodeUrl: new URL(config.rpc, window.location.origin).toString(),
    keyStore,
  });
  return near.account(current.accountId);
}

function showBalanceSpinner(el: HTMLElement, label: string): void {
  el.replaceChildren();
  const spin = document.createElement("span");
  spin.className = "amount-spin";
  spin.setAttribute("aria-label", label);
  el.append(spin);
}

function setBalance(el: HTMLElement, text: string): void {
  if (!el.querySelector(".amount-spin") && el.textContent === text) return;
  el.textContent = text;
}

async function refreshBalances(initial = false): Promise<boolean> {
  if (!current || (balanceInFlight && !initial)) return false;
  balanceInFlight = true;
  if (initial) {
    showBalanceSpinner(nearBalance, "Loading NEAR balance");
    showBalanceSpinner(tokenBalance, "Loading USDT balance");
  }
  try {
    const balances = await api<{ near: string; token: string | null }>(
      `/ethw/api/balance?accountId=${encodeURIComponent(current.accountId)}`,
    );
    const nextToken = balances.token === null ? "—" : formatAmount(balances.token, config.decimals, 2);
    const tokenChanged =
      !initial && !tokenBalance.querySelector(".amount-spin") && tokenBalance.textContent !== nextToken && nextToken !== "—";
    tokenBalanceRaw = balances.token === null ? null : BigInt(balances.token);
    setBalance(nearBalance, formatAmount(balances.near, 24, 3));
    setBalance(tokenBalance, nextToken);
    paintSendButton();
    return tokenChanged;
  } finally {
    balanceInFlight = false;
  }
}

function startBalanceRefresh(): void {
  window.clearInterval(balanceTimer);
  balanceTimer = window.setInterval(() => {
    refreshBalances()
      .then((tokenChanged) => {
        if (tokenChanged) return loadEscrow();
      })
      .catch(() => undefined);
  }, 10_000);
}

function stopBalanceRefresh(): void {
  window.clearInterval(balanceTimer);
  balanceTimer = 0;
}

function stopBridgePoll(): void {
  window.clearInterval(bridgePoll);
  bridgePoll = 0;
}

function syncBridgePoll(rows: EscrowRow[]): void {
  const open = rows.some((row) => row.kind === "bridge" && !row.done);
  if (!open) {
    stopBridgePoll();
    return;
  }
  if (bridgePoll) return;
  bridgePoll = window.setInterval(() => {
    loadEscrow().catch(() => undefined);
  }, 10_000);
}

function bridgeStatusLabel(status: string): string {
  if (status === "completed") return "Complete";
  const words = status.split("_").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function partyLabel(email: string, accountId: string): string {
  return email || accountId;
}

function unlockLabel(row: EscrowRow): string {
  if (!row.unlockAt) return "pull-back after one week";
  const unlockMs = Date.parse(row.unlockAt);
  if (Number.isNaN(unlockMs) || unlockMs <= Date.now()) return "ready to pull back";
  const days = Math.max(1, Math.ceil((unlockMs - Date.now()) / (24 * 60 * 60 * 1000)));
  return `pull-back in ${days} day${days === 1 ? "" : "s"}`;
}

function historySent(row: EscrowRow): boolean {
  return row.direction === "out" || (row.direction == null && row.senderEmail === current?.email);
}

function historyInstant(row: EscrowRow): Date | null {
  const raw = historySent(row) ? row.createdAt : row.claimedAt || row.createdAt;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function dayLabel(date: Date): string {
  const today = new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const days = Math.round((todayStart - start) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString(undefined, sameYear ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" });
}

function renderHistory(rows: EscrowRow[]): void {
  historyList.replaceChildren();
  if (rows.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No payments yet.";
    historyList.append(item);
    return;
  }
  let shownDay = "";
  for (const row of rows) {
    const when = historyInstant(row);
    const key = when ? `${when.getFullYear()}-${when.getMonth()}-${when.getDate()}` : "";
    if (key !== shownDay) {
      shownDay = key;
      const head = document.createElement("li");
      head.className = "day";
      head.textContent = when ? dayLabel(when) : "Undated";
      historyList.append(head);
    }
    const item = document.createElement("li");
    if (when) {
      const time = document.createElement("time");
      time.className = "when";
      time.dateTime = when.toISOString();
      time.textContent = when.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
      item.append(time);
    }
    const sent = historySent(row);
    const text = document.createElement("span");
    const who = sent
      ? `to ${partyLabel(row.recipientEmail, "")}`
      : `from ${partyLabel(row.senderEmail, row.senderAddress)}`;
    text.textContent = `${sent ? "-" : "+"}${formatAmount(row.amount, config.decimals)} ${config.symbol} ${who}`;
    item.append(text);
    if (row.txHash) {
      const link = document.createElement("a");
      link.href = `${explorerBase()}/txns/${row.txHash}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = " tx";
      item.append(link);
    }
    if (row.kind === "bridge" && row.status) {
      const status = document.createElement("span");
      status.className = "bridge-status";
      status.textContent = ` · ${bridgeStatusLabel(row.status)}`;
      item.append(status);
    }
    historyList.append(item);
  }
}

function renderRows(
  list: HTMLElement,
  rows: EscrowRow[],
  empty: string,
  label: (row: EscrowRow) => string,
  reclaim = false,
): void {
  list.replaceChildren();
  if (rows.length === 0) {
    const item = document.createElement("li");
    item.textContent = empty;
    list.append(item);
    return;
  }
  for (const row of rows) {
    const item = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = label(row);
    item.append(text);
    if (row.txHash) {
      const link = document.createElement("a");
      link.href = `${explorerBase()}/txns/${row.txHash}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = " tx";
      item.append(link);
    }
    if (reclaim && row.reclaimable && row.depositId !== null) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-ghost";
      button.textContent = "Pull back";
      button.addEventListener("click", () => {
        reclaimEscrow(row).catch((error: unknown) => setStatus(explain(error)));
      });
      item.append(button);
    } else if (reclaim) {
      const note = document.createElement("span");
      note.textContent = ` · ${unlockLabel(row)}`;
      item.append(note);
    }
    list.append(item);
  }
}

async function loadEscrow(): Promise<void> {
  if (!current) return;
  const result = await api<{ incoming: EscrowRow[]; outgoing: EscrowRow[]; history: EscrowRow[] }>(
    `/ethw/api/escrow?email=${encodeURIComponent(current.email)}`,
  );
  collectSection.hidden = result.incoming.length === 0;
  collectWrap.hidden = result.incoming.length === 0;
  incomingNote.hidden = result.incoming.length === 0;
  incomingNote.textContent = result.incoming.length ? "Held until you collect them into this wallet." : "";
  incomingTip.hidden = window.localStorage.getItem(COLLECT_TIP_KEY) === "1" || result.incoming.length === 0;
  renderRows(incomingList, result.incoming, "", (row) => {
    return `${formatAmount(row.amount, config.decimals)} ${config.symbol} from ${partyLabel(row.senderEmail, row.senderAddress)}`;
  });
  renderHistory(result.history);
  syncBridgePoll(result.history);
  outgoingSection.hidden = result.outgoing.length === 0;
  if (result.outgoing.length > 0) {
    renderRows(
      outgoingList,
      result.outgoing,
      "",
      (row) => `${formatAmount(row.amount, config.decimals)} ${config.symbol} to ${partyLabel(row.recipientEmail, "")}`,
      true,
    );
  }
}

async function showWallet(email: string, accountId: string, secret: string): Promise<void> {
  current = { email, accountId, secret };
  window.localStorage.setItem(EMAIL_KEY, email);
  accountEmail.textContent = email;
  me.src = await gravatarUrl(email, 68);
  addressEl.textContent = accountId.length > 10 ? `${accountId.slice(0, 5)} ... ${accountId.slice(-5)}` : accountId;
  addressEl.title = accountId;
  explorer.href = `${explorerBase()}/address/${accountId}`;
  tokenLabel.textContent = config.symbol;
  await QRCode.toCanvas(qr, accountId, { width: 124, margin: 1 });
  renderRoute();
  startBalanceRefresh();
  try {
    await refreshBalances(true);
  } catch (error) {
    tokenBalanceRaw = null;
    setBalance(nearBalance, "—");
    setBalance(tokenBalance, "—");
    paintSendButton();
    setStatus(explain(error));
  }
  await loadEscrow();
}

function setCreating(active: boolean): void {
  creatingWrap.hidden = !active;
  creatingWrap.classList.toggle("busy", active);
  creatingButton.disabled = true;
  creatingButton.setAttribute("aria-busy", active ? "true" : "false");
  otpInput.disabled = active;
  if (active) useSignupKeyButton.hidden = true;
  else if (!signupKeyField.hidden) useSignupKeyButton.hidden = false;
}

function paintOtp(): void {
  const digits = otpInput.value;
  const cursor = digits.length < 6 ? digits.length : 5;
  const focused = document.activeElement === otpInput;
  otpDigits.forEach((slot, index) => {
    slot.textContent = digits[index] ?? "";
    slot.classList.toggle("filled", index < digits.length);
    slot.classList.toggle("active", focused && index === cursor);
  });
}

function paintInvite(): void {
  const letters = signupKeyInput.value;
  const cursor = letters.length < 8 ? letters.length : 7;
  const focused = document.activeElement === signupKeyInput;
  inviteDigits.forEach((slot, index) => {
    slot.textContent = letters[index] ?? "";
    slot.classList.toggle("filled", index < letters.length);
    slot.classList.toggle("active", focused && index === cursor);
  });
}

function onInviteInput(): void {
  const letters = signupKeyInput.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  if (signupKeyInput.value !== letters) signupKeyInput.value = letters;
  paintInvite();
  if (letters.length < 8) inviteAttempted = "";
  if (letters.length === 8 && letters !== inviteAttempted && !otpBusy) {
    inviteAttempted = letters;
    createWallet().catch((error: unknown) => setStatus(explain(error)));
  }
}

function onOtpInput(): void {
  const digits = otpInput.value.replace(/\D/g, "").slice(0, 6);
  if (otpInput.value !== digits) otpInput.value = digits;
  paintOtp();
  if (digits.length < 6) otpAttempted = "";
  if (digits.length === 6 && digits !== otpAttempted && !otpBusy) {
    otpAttempted = digits;
    verifyCode().catch((error: unknown) => setStatus(explain(error)));
  }
}

async function sendCode(): Promise<void> {
  const email = emailInput.value.trim().toLowerCase();
  if (!email) {
    setStatus("Enter an email.");
    return;
  }
  setStatus("Sending a code.");
  const result = await api<{ devCode?: string }>("/ethw/api/otp/send", { email });
  otpBox.hidden = false;
  verified = null;
  otpAttempted = "";
  otpInput.value = "";
  signupKeyField.hidden = true;
  signupKeyInput.value = "";
  inviteAttempted = "";
  useSignupKeyButton.hidden = true;
  setCreating(false);
  paintOtp();
  paintInvite();
  otpInput.focus();
  setStatus(result.devCode ? `Development code ${result.devCode}` : "Check your email for the code.");
}

async function verifyCode(): Promise<void> {
  if (otpBusy) return;
  const email = emailInput.value.trim().toLowerCase();
  const code = otpInput.value.trim();
  if (code.length !== 6) return;
  otpBusy = true;
  setCreating(true);
  try {
    const result = await api<{ emailToken: string }>("/ethw/api/otp/verify", { email, code });
    verified = { email, emailToken: result.emailToken };
    retryButton.hidden = true;
    const escrow = await api<{ incoming: unknown[] }>(`/ethw/api/escrow?email=${encodeURIComponent(email)}`);
    if (escrow.incoming.length > 0) {
      signupKeyField.hidden = true;
      useSignupKeyButton.hidden = true;
      setStatus("Email verified. Setting up your passkey.");
      await createWallet();
      return;
    }
    signupKeyField.hidden = false;
    useSignupKeyButton.hidden = false;
    setCreating(false);
    paintInvite();
    setStatus("Enter the invite code.");
    signupKeyInput.focus();
  } catch (error) {
    setCreating(false);
    throw error;
  } finally {
    otpBusy = false;
  }
}

function pendingKey(): { publicKey: string; secret: string } {
  const saved = window.sessionStorage.getItem(PENDING_KEY);
  if (saved) return JSON.parse(saved) as { publicKey: string; secret: string };
  const pair = KeyPair.fromRandom("ed25519");
  const created = { publicKey: pair.getPublicKey().toString(), secret: pair.toString() };
  window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(created));
  return created;
}

async function createWallet(): Promise<void> {
  if (!verified) {
    setStatus("Verify the email first.");
    return;
  }
  const signupKey = signupKeyField.hidden ? "" : signupKeyInput.value;
  if (!signupKeyField.hidden && !/^[A-Z]{8}$/.test(signupKey)) {
    setStatus("Enter the invite code.");
    return;
  }
  retryButton.hidden = true;
  setCreating(true);
  try {
    if (!passkeys()[verified.email]) {
      setStatus("Confirm the passkey prompt.");
      savePasskey(verified.email, await createPasskey(verified.email));
    }
    setStatus("Creating the NEAR account.");
    const key = pendingKey();
    const created = await api<{ email: string; accountId: string }>("/ethw/api/register", {
      email: verified.email,
      publicKey: key.publicKey,
      emailToken: verified.emailToken,
      ...(signupKey ? { signupKey } : {}),
    });
    saveKey(created.accountId, key.secret);
    window.sessionStorage.removeItem(PENDING_KEY);
    setStatus(`Account ${created.accountId} is ready.`);
    await showWallet(created.email, created.accountId, key.secret);
  } catch (error) {
    setCreating(false);
    retryButton.hidden = false;
    if (isPasskeyCancel(error)) {
      setStatus("Passkey setup was cancelled. Retry when you are ready.");
      return;
    }
    setStatus(explain(error));
  }
}

function setOpening(active: boolean): void {
  openWrap.classList.toggle("busy", active);
  openButton.hidden = active;
  openingButton.hidden = !active;
  openingButton.setAttribute("aria-busy", active ? "true" : "false");
  if (!active) syncSetupButtons();
}

async function openWallet(): Promise<void> {
  const email = emailInput.value.trim().toLowerCase();
  if (!email) {
    setStatus("Enter an email.");
    return;
  }
  setOpening(true);
  try {
    const found = await api<{ registered: boolean; accountId?: string }>(
      `/ethw/api/account?email=${encodeURIComponent(email)}`,
    );
    if (!found.registered || !found.accountId) {
      setStatus("That email has no wallet yet. Send a code to create one.");
      return;
    }
    const secret = keys()[found.accountId];
    if (!secret) {
      setStatus("This wallet was created on another device. The key stays in that browser.");
      return;
    }
    setStatus("Confirm the passkey prompt.");
    try {
      const existing = passkeys()[email];
      if (existing) await assertPasskey(existing);
      else savePasskey(email, await createPasskey(email));
    } catch (error) {
      if (isPasskeyCancel(error)) {
        setStatus("Passkey sign-in was cancelled.");
        return;
      }
      throw error;
    }
    setStatus("");
    await showWallet(email, found.accountId, secret);
  } finally {
    setOpening(false);
  }
}

function logout(): void {
  current = null;
  tokenBalanceRaw = null;
  stopBalanceRefresh();
  stopBridgePoll();
  paintSendButton();
  window.localStorage.removeItem(EMAIL_KEY);
  accountMenu.hidden = true;
  show("setup");
  setStatus("Logged out on this device. The key is still saved here.");
}

const RETURN_NEAR_RESERVE = 1_000_000_000_000_000_000_000n;

async function emptyWallet(): Promise<void> {
  if (!current) return;
  accountMenu.hidden = true;
  accountTrigger.setAttribute("aria-expanded", "false");
  const agreed = window.confirm(`Send all ${config.symbol} and NEAR in this wallet back to the operator account?`);
  if (!agreed) return;
  try {
    await confirmSendPasskey();
    const target = await api<{ accountId: string }>("/ethw/api/return-target", {});
    if (target.accountId === current.accountId) {
      setStatus("This wallet is the operator account.");
      return;
    }
    const before = await api<{ token: string | null; spendable: string }>(
      `/ethw/api/balance?accountId=${encodeURIComponent(current.accountId)}`,
    );
    const account = await nearAccount();
    const tokenAmount = before.token && before.token !== "0" ? before.token : "";
    if (tokenAmount) {
      if (!config.token) throw new Error("Set NEAR_TOKEN_ACCOUNT on the server.");
      setStatus(`Sending ${config.symbol} back.`);
      await account.functionCall({
        contractId: config.token,
        methodName: "ft_transfer",
        args: { receiver_id: target.accountId, amount: tokenAmount, memo: null },
        gas: TRANSFER_GAS,
        attachedDeposit: 1n,
      });
    }
    const after = await api<{ spendable: string }>(
      `/ethw/api/balance?accountId=${encodeURIComponent(current.accountId)}`,
    );
    const spendable = BigInt(after.spendable || "0");
    if (spendable > RETURN_NEAR_RESERVE) {
      setStatus("Sending NEAR back.");
      await account.sendMoney(target.accountId, spendable - RETURN_NEAR_RESERVE);
    } else if (!tokenAmount) {
      setStatus("Nothing to send.");
      return;
    }
    await refreshBalances();
    setStatus("Sent the wallet balance back to the operator account. A little NEAR stays behind to pay the fee.");
  } catch (error) {
    if (isPasskeyCancel(error)) {
      setStatus("Passkey sign-in was cancelled.");
      return;
    }
    throw error;
  }
}

function isEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function isEnsName(value: string): boolean {
  return /^[^\s@]+\.eth$/i.test(value.trim());
}

type EnsResult = { direction: "forward" | "reverse"; name: string | null; address: string | null };

const ensCache = new Map<string, EnsResult>();
let resolvedEns: { query: string; address: string } | null = null;

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

async function lookupEns(query: string): Promise<EnsResult> {
  const key = query.trim().toLowerCase();
  const cached = ensCache.get(key);
  if (cached) return cached;
  const found = await api<EnsResult>(`/ethw/api/ens?q=${encodeURIComponent(query.trim())}`);
  ensCache.set(key, found);
  return found;
}

function ethereumIdentity(input: string, ens: EnsResult): string {
  const typed = input.trim();
  if (isEnsName(typed) && ens.address) return `${typed} is ${shortAddress(ens.address)}`;
  if (isEvmAddress(typed) && ens.name) return `${ens.name} is ${shortAddress(typed)}`;
  if (isEvmAddress(typed)) return shortAddress(typed);
  return "";
}

function ethereumLine(input: string, ens: EnsResult, detail: string): string {
  const who = ethereumIdentity(input, ens);
  if (!who) return detail;
  return `${who}. ${detail}`;
}

async function ethereumPayee(): Promise<string> {
  const raw = recipientInput.value.trim();
  if (isEvmAddress(raw)) return raw;
  if (!isEnsName(raw)) throw new Error("Choose an Ethereum address or a .eth name.");
  if (resolvedEns && resolvedEns.query.toLowerCase() === raw.toLowerCase() && isEvmAddress(resolvedEns.address)) {
    return resolvedEns.address;
  }
  const ens = await lookupEns(raw);
  if (!ens.address || !isEvmAddress(ens.address)) throw new Error("That ENS name has no Ethereum address.");
  resolvedEns = { query: raw, address: ens.address };
  return ens.address;
}

function detectRecipient(raw: string): Detected {
  const value = raw.trim();
  if (!value) return { kind: "empty", label: "Recipient", detail: "" };
  if (isEvmAddress(value)) return { kind: "evm", label: "Ethereum", detail: "" };
  if (value.includes("@")) return { kind: "email", label: "Email", detail: "", email: value.toLowerCase() };
  if (value.startsWith("+")) return { kind: "phone", label: "Phone", detail: "Phone payouts are not wired up yet." };
  if (isEnsName(value)) return { kind: "ens", label: "ENS", detail: "" };
  if (/^[a-z0-9][a-z0-9._-]*\.(near|testnet)$/.test(value) || /^[0-9a-f]{64}$/.test(value)) {
    return { kind: "near", label: "NEAR account", detail: value, accountId: value };
  }
  return { kind: "unknown", label: "Recipient", detail: "Use an email or a NEAR account id." };
}

function hideSuggestions(): void {
  suggestList.hidden = true;
  suggestList.replaceChildren();
  recipientInput.setAttribute("aria-expanded", "false");
  suggestIndex = -1;
}

function matchingSentEmails(query: string): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return sentEmails().filter((email) => email.startsWith(needle) && email !== needle);
}

function chooseSuggestion(email: string): void {
  recipientInput.value = email;
  hideSuggestions();
  recipientInput.dispatchEvent(new Event("input"));
}

function paintSuggestions(): void {
  const matches = matchingSentEmails(recipientInput.value);
  if (matches.length === 0) {
    hideSuggestions();
    return;
  }
  suggestList.replaceChildren();
  matches.forEach((email) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggest-item";
    button.setAttribute("role", "option");
    button.textContent = email;
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      chooseSuggestion(email);
    });
    item.append(button);
    suggestList.append(item);
  });
  suggestList.hidden = false;
  recipientInput.setAttribute("aria-expanded", "true");
  suggestIndex = -1;
}

function moveSuggestion(direction: 1 | -1): void {
  const items = [...suggestList.querySelectorAll<HTMLButtonElement>(".suggest-item")];
  if (items.length === 0) return;
  suggestIndex = Math.min(items.length - 1, Math.max(0, suggestIndex + direction));
  items.forEach((item, index) => item.classList.toggle("active", index === suggestIndex));
  items[suggestIndex].scrollIntoView({ block: "nearest" });
}

function emailSendNotice(email: string, escrowed: boolean, amountText: string): void {
  if (!current) return;
  const subject = `Sending you ${amountText} ${config.symbol}`;
  const lead = escrowed
    ? `I'm sending you ${amountText} ${config.symbol}. It is held in escrow until you collect it.`
    : `I'm sending you ${amountText} ${config.symbol}.`;
  const next = escrowed
    ? `Create a wallet at ${window.location.origin} using ${email}, then collect it.`
    : `Open your wallet at ${window.location.origin} to see it.`;
  const body = [lead, "", next, "", `This is from ${current.email} (${current.accountId}).`].join("\n");
  const link = document.createElement("a");
  link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
}

type BridgeTransaction = {
  receiverId: string;
  actions: Array<{ methodName: string; args: string; gas: string; deposit: string }>;
};

type BridgePlan = {
  nativeFee: string;
  tokenFee: string;
  receiveAmount: string;
  swapOut: string;
  bridgedToken: string;
  affordable: boolean;
  swapTransactions: BridgeTransaction[];
  transactions: BridgeTransaction[];
  timeEstimate: number;
  depositAddress?: string;
  sendAmount?: string;
};

type SignedOutcome = {
  transaction: { hash: string };
  receipts_outcome?: Array<{ outcome?: { executor_id?: string; logs?: string[] } }>;
};

function bytesFromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bridgeShortfall(plan: BridgePlan): string {
  if (plan.nativeFee !== "0") {
    return `The bridge fee is ${formatAmount(plan.nativeFee, 24, 4)} NEAR. This wallet does not have enough NEAR to pay it.`;
  }
  return "This wallet needs a little NEAR left to pay the network fee.";
}

function bridgeFeeText(plan: BridgePlan): string {
  const fee = `${formatAmount(plan.tokenFee, config.decimals, 4)} ${config.symbol}`;
  const receive = formatAmount(plan.receiveAmount, config.decimals, 4);
  return `Bridging fee is ${fee}. Recipient will receive ${receive} ${config.symbol}, expected time 5-15 minutes.`;
}

function spendAmount(): bigint | null {
  try {
    return parseAmount(amountInput.value, config.decimals);
  } catch {
    return null;
  }
}

function fundsShort(): boolean {
  const amount = spendAmount();
  if (amount === null || tokenBalanceRaw === null) return false;
  return amount > tokenBalanceRaw;
}

function paintSendButton(): void {
  const short = fundsShort();
  fundsNote.hidden = !short;
  if (sendWrap.classList.contains("busy")) return;
  if (sendReady === null) {
    if (short) sendButton.disabled = true;
    return;
  }
  sendButton.disabled = !sendReady || short;
  sendButton.textContent = sendLabel;
}

function setSendEnabled(enabled: boolean, label = "Send"): void {
  sendReady = enabled;
  sendLabel = label;
  paintSendButton();
}

const fitMax = new WeakMap<HTMLElement, number>();

function textWidth(el: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(el);
  const width = range.getBoundingClientRect().width;
  range.detach();
  return width;
}

function fitToWidth(el: HTMLElement): void {
  if (!el.isConnected || el.hidden || el.closest("[hidden]")) return;
  if (!el.textContent?.trim()) {
    el.style.fontSize = "";
    return;
  }
  if (!fitMax.has(el)) fitMax.set(el, Number.parseFloat(getComputedStyle(el).fontSize) || 14);
  const max = fitMax.get(el) ?? 14;
  const min = 8;
  const fits = (): boolean => textWidth(el) <= Math.max(0, el.clientWidth - 1);
  el.style.fontSize = `${max}px`;
  if (el.clientWidth <= 0 || fits()) return;
  let low = min;
  let high = max;
  for (let step = 0; step < 16; step += 1) {
    const mid = (low + high) / 2;
    el.style.fontSize = `${mid}px`;
    if (fits()) low = mid;
    else high = mid;
  }
  el.style.fontSize = `${low}px`;
}

function fitSendLines(): void {
  fitToWidth(bridgeFeeNote);
  fitToWidth(paymentAmount);
  fitToWidth(paymentUuid);
  fitToWidth(paymentLabel);
}

function scheduleFitSendLines(): void {
  requestAnimationFrame(() => fitSendLines());
}

new ResizeObserver(() => fitSendLines()).observe(sendView);

function showBridgeFee(fee: bigint | null): void {
  if (fee === null || fee <= 0n) {
    bridgeFeeNote.hidden = true;
    bridgeFeeNote.textContent = "";
    return;
  }
  bridgeFeeNote.hidden = false;
  bridgeFeeNote.textContent = `(Includes +${formatAmount(fee.toString(), config.decimals)} ${config.symbol} fee)`;
  scheduleFitSendLines();
}

function renderPaymentRequest(): void {
  const request = paymentRequest;
  paymentPanel.hidden = !request;
  if (!request) {
    showBridgeFee(null);
    return;
  }
  paymentAmount.textContent = `${request.amount} ${config.symbol}`;
  paymentUuid.textContent = request.uuid;
  paymentUuidRow.hidden = !request.uuid;
  paymentLabel.textContent = request.label;
  paymentLabelRow.hidden = !request.label;
  scheduleFitSendLines();
}

function invoiceFor(address: string): Eip681Payment | null {
  if (!paymentRequest?.usdt) return null;
  return paymentRequest.address.toLowerCase() === address.trim().toLowerCase() ? paymentRequest : null;
}

function applyEip681(payment: Eip681Payment): void {
  if (!payment.usdt) {
    setStatus("That payment request is not for USDT.");
    return;
  }
  paymentRequest = payment;
  writingRecipient = true;
  recipientInput.value = payment.address;
  writingRecipient = false;
  writingAmount = true;
  amountInput.value = payment.amount;
  writingAmount = false;
  paintSendButton();
  renderPaymentRequest();
  hideSuggestions();
  window.clearTimeout(lookupTimer);
  lookupTimer = window.setTimeout(() => {
    resolveRecipient().catch((error: unknown) => setStatus(explain(error)));
  }, 300);
  setStatus("Payment request scanned.");
}

async function resolveRecipient(): Promise<void> {
  const token = ++recipientToken;
  stopQuoteCountdown();
  const detected = detectRecipient(recipientInput.value);
  kindChip.dataset.kind = detected.kind;
  kindChip.textContent = detected.label;
  if (detected.kind === "empty") {
    recipientAvatar.hidden = true;
    resolvedEl.textContent = "";
    setSendEnabled(false);
    return;
  }
  if (detected.kind === "evm" || detected.kind === "ens") {
    recipientAvatar.hidden = true;
    if (config.network !== "mainnet") {
      resolvedEl.textContent = "Bridging to Ethereum is available on NEAR mainnet.";
      setSendEnabled(false, "Bridge");
      return;
    }
    if (!config.token) {
      resolvedEl.textContent = "USDT is not configured on this server.";
      setSendEnabled(false, "Bridge");
      return;
    }
    const query = recipientInput.value.trim();
    resolvedEl.textContent = detected.kind === "ens" ? "Looking up that ENS name." : "Checking the Ethereum name.";
    setSendEnabled(false, "Bridge");
    let ens: EnsResult;
    try {
      ens = await lookupEns(query);
    } catch (error) {
      if (token !== recipientToken) return;
      if (detected.kind === "ens") {
        resolvedEns = null;
        resolvedEl.textContent = explain(error);
        setSendEnabled(false, "Bridge");
        return;
      }
      ens = { direction: "reverse", name: null, address: query };
    }
    if (token !== recipientToken) return;
    const address = detected.kind === "ens" ? ens.address ?? "" : query;
    if (!isEvmAddress(address)) {
      resolvedEns = null;
      resolvedEl.textContent = "That ENS name has no Ethereum address.";
      setSendEnabled(false, "Bridge");
      return;
    }
    resolvedEns = { query, address };
    const invoice = invoiceFor(address);
    let amount: bigint;
    try {
      amount = parseAmount(invoice ? invoice.amount : amountInput.value, config.decimals);
    } catch {
      resolvedEl.textContent = ethereumLine(query, ens, "Enter an amount to bridge USDT.");
      setSendEnabled(false, "Bridge");
      return;
    }
    if (amount < minimumBridgeAmount()) {
      resolvedEl.textContent = ethereumLine(query, ens, `The minimum bridge amount is ${MIN_BRIDGE_WHOLE} ${config.symbol}.`);
      setSendEnabled(false, "Bridge");
      return;
    }
    if (!current && !invoice) {
      showBridgeFee(null);
      resolvedEl.textContent = ethereumLine(query, ens, "Open your wallet before bridging.");
      setSendEnabled(false, "Bridge");
      return;
    }
    resolvedEl.textContent = ethereumLine(query, ens, "Checking the bridge fee.");
    try {
      const plan = await api<BridgePlan>("/ethw/api/bridge", {
        ...(current ? { accountId: current.accountId } : {}),
        recipient: address,
        amount: amount.toString(),
        exactOut: Boolean(invoice),
        quoteOnly: !current,
      });
      if (token !== recipientToken) return;
      if (invoice && plan.sendAmount) {
        const gross = BigInt(plan.sendAmount);
        writingAmount = true;
        amountInput.value = formatAmount(plan.sendAmount, config.decimals);
        writingAmount = false;
        showBridgeFee(gross - amount);
      } else {
        showBridgeFee(null);
      }
      if (!current) {
        resolvedEl.textContent = ethereumLine(query, ens, "Open your wallet before bridging.");
        setSendEnabled(false, "Bridge");
        startQuoteCountdown();
        return;
      }
      resolvedEl.textContent = ethereumLine(query, ens, plan.affordable ? bridgeFeeText(plan) : bridgeShortfall(plan));
      setSendEnabled(plan.affordable, "Bridge");
      startQuoteCountdown();
    } catch (error) {
      if (token !== recipientToken) return;
      resolvedEl.textContent = ethereumLine(query, ens, explain(error));
      setSendEnabled(false, "Bridge");
    }
    return;
  }
  if (detected.kind === "phone" || detected.kind === "unknown") {
    recipientAvatar.hidden = true;
    resolvedEl.textContent = detected.detail;
    setSendEnabled(false, detected.kind === "phone" ? "SMS coming soon" : "Send");
    return;
  }
  if (detected.kind === "near") {
    recipientAvatar.hidden = true;
    resolvedEl.textContent = detected.accountId;
    setSendEnabled(Boolean(config.token));
    return;
  }
  if (!EMAIL_PATTERN.test(detected.email)) {
    recipientAvatar.hidden = true;
    resolvedEl.textContent = "";
    setSendEnabled(false);
    return;
  }
  recipientAvatar.hidden = false;
  recipientAvatar.src = await gravatarUrl(detected.email, 76);
  const account = await api<{ registered: boolean; accountId?: string }>(
    `/ethw/api/account?email=${encodeURIComponent(detected.email)}`,
  );
  if (token !== recipientToken) return;
  resolvedEl.textContent = account.registered
    ? `Registered · ${account.accountId}`
    : config.escrow
      ? "Not registered. A send is held until they open a wallet and collect it."
      : "Not registered. Escrow is not configured on this server.";
  setSendEnabled(Boolean(config.token && (account.registered || config.escrow)));
}

async function ensureGas(): Promise<void> {
  if (!current) return;
  await api("/ethw/api/gas", { email: current.email });
}

async function confirmSendPasskey(): Promise<void> {
  if (!current) return;
  setStatus("Confirm the passkey prompt.");
  const existing = passkeys()[current.email];
  if (existing) {
    await assertPasskey(existing);
    return;
  }
  savePasskey(current.email, await createPasskey(current.email));
}

async function sendToken(): Promise<void> {
  if (!current) return;
  const detected = detectRecipient(recipientInput.value);
  if (detected.kind === "empty" || detected.kind === "phone" || detected.kind === "unknown") {
    throw new Error(detected.kind === "phone" ? "Phone payouts are not wired up yet." : "Choose an email, a NEAR account, or an Ethereum address.");
  }
  const invoice =
    paymentRequest && recipientInput.value.trim().toLowerCase() === paymentRequest.address.toLowerCase() && paymentRequest.usdt
      ? paymentRequest
      : null;
  const amount = parseAmount(invoice ? invoice.amount : amountInput.value, config.decimals);
  sendButton.disabled = true;
  sendWrap.classList.add("busy");
  sendButton.setAttribute("aria-busy", "true");
  let sent = false;
  let holdStatus = false;
  try {
    await confirmSendPasskey();
    await pause(400);
    await ensureGas();
    const account = await nearAccount();
    if (detected.kind === "email") {
      if (!config.token) throw new Error("Set NEAR_TOKEN_ACCOUNT on the server.");
      const recipient = await api<{ registered: boolean; accountId?: string }>(
        `/ethw/api/account?email=${encodeURIComponent(detected.email)}`,
      );
      if (recipient.registered && recipient.accountId) {
        if (recipient.accountId === current.accountId) throw new Error("Choose a different recipient.");
        const outcome = await account.functionCall({
          contractId: config.token,
          methodName: "ft_transfer",
          args: { receiver_id: recipient.accountId, amount: amount.toString(), memo: null },
          gas: TRANSFER_GAS,
          attachedDeposit: 1n,
        });
        const hash = outcome.transaction.hash;
        await api("/ethw/api/transfer", {
          senderEmail: current.email,
          recipientEmail: detected.email,
          txHash: hash,
        });
        rememberSentEmail(detected.email);
        const sentLabel = formatAmount(amount.toString(), config.decimals);
        setStatus(`Sent ${sentLabel} ${config.symbol} to ${detected.email}. ${hash}`);
        emailSendNotice(detected.email, false, sentLabel);
      } else {
        if (!config.escrow) throw new Error("Set NEAR_ESCROW_ACCOUNT on the server.");
        const outcome = await account.functionCall({
          contractId: config.token,
          methodName: "ft_transfer_call",
          args: {
            receiver_id: config.escrow,
            amount: amount.toString(),
            memo: null,
            msg: emailHash(detected.email),
          },
          gas: CALL_GAS,
          attachedDeposit: 1n,
        });
        const hash = outcome.transaction.hash;
        await api("/ethw/api/escrow/deposit", {
          senderEmail: current.email,
          recipientEmail: detected.email,
          txHash: hash,
        });
        rememberSentEmail(detected.email);
        const heldLabel = formatAmount(amount.toString(), config.decimals);
        setStatus(`Held for ${detected.email}. ${hash}`);
        emailSendNotice(detected.email, true, heldLabel);
      }
    } else if (detected.kind === "near") {
      if (!config.token) throw new Error("Set NEAR_TOKEN_ACCOUNT on the server.");
      if (detected.accountId === current.accountId) throw new Error("Choose a different recipient.");
      const outcome = await account.functionCall({
        contractId: config.token,
        methodName: "ft_transfer",
        args: { receiver_id: detected.accountId, amount: amount.toString(), memo: null },
        gas: TRANSFER_GAS,
        attachedDeposit: 1n,
      });
      const hash = outcome.transaction.hash;
      await api("/ethw/api/transfer", {
        senderEmail: current.email,
        recipientAccountId: detected.accountId,
        txHash: hash,
      });
      setStatus(`Sent ${formatAmount(amount.toString(), config.decimals)} ${config.symbol} to ${detected.accountId}. ${hash}`);
    } else if (detected.kind === "evm" || detected.kind === "ens") {
      if (amount < minimumBridgeAmount()) {
        throw new Error(`The minimum bridge amount is ${MIN_BRIDGE_WHOLE} ${config.symbol}.`);
      }
      const recipient = await ethereumPayee();
      const destination = detected.kind === "ens" ? recipientInput.value.trim() : recipient;
      const sent = await bridgeToEthereum(account, recipient, amount, destination, Boolean(invoice));
      const sentLabel = formatAmount(sent.sendAmount, config.decimals);
      if (invoice) {
        paymentRequest = null;
        renderPaymentRequest();
        writingRecipient = true;
        recipientInput.value = "";
        writingRecipient = false;
        writingAmount = true;
        amountInput.value = "";
        writingAmount = false;
      }
      const recorded = sent.recorded ? "" : " It will show in history once the transfer can be read.";
      setStatus(`Bridging ${sentLabel} ${config.symbol} to ${destination}. Ethereum receives it after NEAR Intents finishes.${recorded} ${sent.hash}`);
    } else {
      throw new Error("Choose an email, a NEAR account, or an Ethereum address.");
    }
    leaveSendAfterSuccess();
    sent = true;
    await refreshBalances();
    await loadEscrow();
  } catch (error) {
    if (isPasskeyCancel(error)) {
      setStatus("Passkey sign-in was cancelled.");
      return;
    }
    if (isNetworkDrop(error)) {
      holdStatus = true;
      setStatus(NETWORK_WAIT);
      const ethereum = detected.kind === "evm" || detected.kind === "ens";
      setSendEnabled(true, ethereum ? "Bridge" : "Send");
      return;
    }
    throw error;
  } finally {
    sendWrap.classList.remove("busy");
    sendButton.removeAttribute("aria-busy");
    if (!sent && !holdStatus) resolveRecipient().catch((error: unknown) => setStatus(explain(error)));
  }
}

async function signBridgeTransaction(
  account: Awaited<ReturnType<typeof nearAccount>>,
  tx: BridgeTransaction,
): Promise<SignedOutcome> {
  const outcome = await account.signAndSendTransaction({
    receiverId: tx.receiverId,
    actions: tx.actions.map((action) =>
      transactions.functionCall(action.methodName, bytesFromBase64(action.args), BigInt(action.gas), BigInt(action.deposit)),
    ),
  });
  return outcome as SignedOutcome;
}

async function rememberBridge(body: {
  senderEmail: string;
  recipient: string;
  label: string;
  depositAddress: string;
  txHash: string;
}): Promise<void> {
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await api("/ethw/api/bridge/submitted", body);
      return;
    } catch (error) {
      last = error;
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }
  }
  throw last instanceof Error ? last : new Error("could not save the bridge");
}

async function bridgeToEthereum(
  account: Awaited<ReturnType<typeof nearAccount>>,
  recipient: string,
  amount: bigint,
  label: string,
  exactOut = false,
): Promise<{ hash: string; recorded: boolean; sendAmount: string }> {
  if (!current) throw new Error("Open your wallet first.");
  setStatus("Preparing the bridge.");
  const plan = await api<BridgePlan>("/ethw/api/bridge", {
    accountId: current.accountId,
    recipient,
    amount: amount.toString(),
    commit: true,
    exactOut,
  });
  const sendAmount = plan.sendAmount ?? amount.toString();
  if (exactOut && paymentRequest) {
    writingAmount = true;
    amountInput.value = formatAmount(sendAmount, config.decimals);
    writingAmount = false;
    showBridgeFee(BigInt(sendAmount) - amount);
  }
  if (!plan.affordable || plan.transactions.length === 0) {
    throw new Error(bridgeShortfall(plan));
  }
  let hash = "";
  for (let index = 0; index < plan.transactions.length; index += 1) {
    const tx = plan.transactions[index]!;
    const sending = tx.actions.some((action) => action.methodName === "ft_transfer");
    setStatus(sending ? "Sending USDT to Ethereum." : "Preparing the bridge account.");
    let outcome: SignedOutcome;
    try {
      outcome = await signBridgeTransaction(account, tx);
    } catch (error) {
      if (!isNetworkDrop(error)) throw error;
      if (sending) {
        throw new Error("The connection dropped while sending. Check the USDT balance before pressing Bridge again.");
      }
      await pause(600);
      outcome = await signBridgeTransaction(account, tx);
    }
    hash = outcome.transaction.hash;
  }
  let recorded = false;
  if (plan.depositAddress && hash) {
    try {
      await rememberBridge({
        senderEmail: current.email,
        recipient,
        label,
        depositAddress: plan.depositAddress,
        txHash: hash,
      });
      recorded = true;
    } catch {
      recorded = false;
    }
  }
  return { hash, recorded, sendAmount };
}

const COLLECT_ATTEMPTS = 5;

function setCollecting(active: boolean): void {
  collectWrap.classList.toggle("busy", active);
  collectButton.hidden = active;
  collectingButton.hidden = !active;
  collectingButton.setAttribute("aria-busy", active ? "true" : "false");
}

async function collectEscrow(): Promise<void> {
  if (!current) return;
  setCollecting(true);
  setStatus("Collecting the escrow balance.");
  try {
    let lastError: unknown;
    for (let attempt = 0; attempt < COLLECT_ATTEMPTS; attempt += 1) {
      try {
        const result = await api<{ txHash: string }>("/ethw/api/escrow/release", { email: current.email });
        setStatus(`Collected. ${result.txHash}`);
        await refreshBalances();
        await loadEscrow();
        return;
      } catch (error) {
        lastError = error;
        if (attempt < COLLECT_ATTEMPTS - 1) await pause(1000);
      }
    }
    throw lastError;
  } finally {
    setCollecting(false);
  }
}

async function reclaimEscrow(row: EscrowRow): Promise<void> {
  if (!current || !config.escrow || row.depositId === null) return;
  await ensureGas();
  const account = await nearAccount();
  setStatus("Pulling the payment back.");
  const outcome = await account.functionCall({
    contractId: config.escrow,
    methodName: "reclaim",
    args: { email_hash: emailHash(row.recipientEmail), deposit_id: row.depositId },
    gas: CALL_GAS,
    attachedDeposit: 0n,
  });
  await api("/ethw/api/escrow/reclaim", {
    senderEmail: current.email,
    depositId: row.depositId,
    txHash: outcome.transaction.hash,
  });
  setStatus(`Pulled back. ${outcome.transaction.hash}`);
  await refreshBalances();
  await loadEscrow();
}

sendCodeButton.addEventListener("click", () => {
  sendCode().catch((error: unknown) => setStatus(explain(error)));
});
otpInput.addEventListener("input", () => onOtpInput());
otpInput.addEventListener("focus", () => paintOtp());
otpInput.addEventListener("blur", () => paintOtp());
signupKeyInput.addEventListener("input", () => onInviteInput());
signupKeyInput.addEventListener("focus", () => paintInvite());
signupKeyInput.addEventListener("blur", () => paintInvite());
retryButton.addEventListener("click", () => {
  createWallet().catch((error: unknown) => setStatus(explain(error)));
});
useSignupKeyButton.addEventListener("click", () => {
  createWallet().catch((error: unknown) => setStatus(explain(error)));
});
openButton.addEventListener("click", () => {
  openWallet().catch((error: unknown) => setStatus(explain(error)));
});
emailInput.addEventListener("input", () => {
  if (!otpBox.hidden) {
    otpBox.hidden = true;
    verified = null;
    otpInput.value = "";
  }
  scheduleAccountLookup();
});
collectButton.addEventListener("click", () => {
  collectEscrow().catch((error: unknown) => setStatus(explain(error)));
});
accountTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  accountMenu.hidden = !accountMenu.hidden;
  accountTrigger.setAttribute("aria-expanded", accountMenu.hidden ? "false" : "true");
});
document.querySelector("#empty-wallet")!.addEventListener("click", (event) => {
  event.stopPropagation();
  emptyWallet().catch((error: unknown) => setStatus(explain(error)));
});
document.querySelector("#logout")!.addEventListener("click", () => logout());
copyAddressButton.addEventListener("click", () => {
  if (!current) return;
  navigator.clipboard.writeText(current.accountId).then(
    () => setStatus("Account id copied."),
    () => setStatus(current?.accountId ?? ""),
  );
});
incomingTip.addEventListener("mouseenter", () => window.localStorage.setItem(COLLECT_TIP_KEY, "1"));
incomingTip.addEventListener("focus", () => window.localStorage.setItem(COLLECT_TIP_KEY, "1"));
document.querySelector("#brand-home")!.addEventListener("click", () => {
  if (pathIsSend()) window.history.pushState({}, "", "/");
  renderRoute();
});
document.querySelector("#open-send")!.addEventListener("click", () => {
  if (!pathIsSend()) window.history.pushState({}, "", "/send");
  renderRoute();
  recipientInput.focus();
});
document.querySelector("#send-back")!.addEventListener("click", () => {
  window.history.pushState({}, "", "/");
  renderRoute();
});
window.addEventListener("popstate", () => renderRoute());
document.addEventListener("click", () => {
  accountMenu.hidden = true;
});
recipientInput.addEventListener("input", () => {
  if (writingRecipient) return;
  const payment = eip681Payment(recipientInput.value);
  if (payment) {
    applyEip681(payment);
    return;
  }
  if (paymentRequest && recipientInput.value.trim().toLowerCase() !== paymentRequest.address.toLowerCase()) {
    paymentRequest = null;
    renderPaymentRequest();
  }
  paintSuggestions();
  window.clearTimeout(lookupTimer);
  lookupTimer = window.setTimeout(() => {
    resolveRecipient().catch((error: unknown) => setStatus(explain(error)));
  }, 300);
});
amountInput.addEventListener("input", () => {
  if (writingAmount) return;
  paintSendButton();
  if (paymentRequest) {
    paymentRequest = null;
    renderPaymentRequest();
  }
  const kind = detectRecipient(recipientInput.value).kind;
  if (kind !== "evm" && kind !== "ens") return;
  window.clearTimeout(lookupTimer);
  lookupTimer = window.setTimeout(() => {
    resolveRecipient().catch((error: unknown) => setStatus(explain(error)));
  }, 300);
});
recipientInput.addEventListener("keydown", (event) => {
  if (suggestList.hidden) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveSuggestion(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    moveSuggestion(-1);
  } else if (event.key === "Enter" && suggestIndex >= 0) {
    event.preventDefault();
    const chosen = suggestList.querySelectorAll<HTMLButtonElement>(".suggest-item")[suggestIndex];
    if (chosen?.textContent) chooseSuggestion(chosen.textContent);
  } else if (event.key === "Escape") {
    hideSuggestions();
  }
});
recipientInput.addEventListener("blur", () => hideSuggestions());
const CASH_LAST = 10;
let cashLang: "en" | "sp" = "en";
let cashIndex = 0;
let cashOpening = false;

function cashStepSrc(index: number): string {
  const name = index === CASH_LAST ? "cash" : String(index + 1);
  return `/${cashLang}/${cashLang}-${name}.png`;
}

function renderCashStep(): void {
  cashImage.src = cashStepSrc(cashIndex);
  const step = cashIndex === CASH_LAST ? "cash" : String(cashIndex + 1);
  cashImage.alt = cashLang === "sp" ? `Paso ${step}` : `Step ${step}`;
  cashPrev.disabled = cashIndex === 0;
  cashNext.disabled = cashIndex === CASH_LAST;
}

function closeCashGuide(): void {
  cashModal.hidden = true;
}

async function openCashGuide(): Promise<void> {
  if (cashOpening) return;
  cashOpening = true;
  for (const button of cashButtons) button.disabled = true;
  try {
    const region = await api<{ latam: boolean }>("/ethw/api/region");
    cashLang = region.latam ? "sp" : "en";
  } catch {
    cashLang = "en";
  } finally {
    cashOpening = false;
    for (const button of cashButtons) button.disabled = false;
  }
  cashIndex = 0;
  renderCashStep();
  cashModal.hidden = false;
}

for (const button of cashButtons) {
  button.addEventListener("click", () => {
    openCashGuide().catch((error: unknown) => setStatus(explain(error)));
  });
}
cashPrev.addEventListener("click", () => {
  if (cashIndex === 0) return;
  cashIndex -= 1;
  renderCashStep();
});
cashNext.addEventListener("click", () => {
  if (cashIndex === CASH_LAST) return;
  cashIndex += 1;
  renderCashStep();
});
document.querySelector("#cash-close")!.addEventListener("click", () => closeCashGuide());
cashModal.addEventListener("click", (event) => {
  if (event.target === cashModal) closeCashGuide();
});
document.addEventListener("keydown", (event) => {
  if (cashModal.hidden) return;
  if (event.key === "Escape") closeCashGuide();
  else if (event.key === "ArrowRight") cashNext.click();
  else if (event.key === "ArrowLeft") cashPrev.click();
});
sendButton.addEventListener("click", () => {
  sendToken().catch((error: unknown) => setStatus(explain(error)));
});
mountAddressScanner((payload) => {
  const payment = eip681Payment(payload);
  if (payment) {
    applyEip681(payment);
    return;
  }
  const payee = payeeFromQr(payload);
  if (!payee) return;
  if (paymentRequest) {
    paymentRequest = null;
    renderPaymentRequest();
  }
  writingRecipient = true;
  recipientInput.value = payee;
  writingRecipient = false;
  recipientInput.dispatchEvent(new Event("input"));
  setStatus(isEvmAddress(payee) ? "Ethereum address scanned." : "Address scanned.");
});

void api<Config>("/ethw/api/config")
  .then(async (loaded) => {
    config = loaded;
    applyNetwork();
    tokenLabel.textContent = config.symbol;
    syncSetupButtons();
    if (!config.mailReady) {
      setStatus("Set RESEND_API_KEY, SMTP_URL, or EMAIL_DEV_MODE on the server to verify new wallets.");
    }
    const saved = window.localStorage.getItem(EMAIL_KEY);
    if (saved) {
      emailInput.value = saved;
      const email = saved.trim().toLowerCase();
      if (EMAIL_PATTERN.test(email)) {
        const generation = ++accountLookup;
        lookupKnownAccount(email, generation)
          .then(() => {
            if (generation === accountLookup && knownAccount) setStatus("Press Open wallet to sign in.");
          })
          .catch((error: unknown) => {
            if (generation === accountLookup) setStatus(explain(error));
          });
      } else {
        syncSetupButtons();
      }
    }
  })
  .catch((error: unknown) => setStatus(explain(error)));

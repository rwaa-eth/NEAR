import { keccak_256 } from "@noble/hashes/sha3";
import { connect, keyStores, KeyPair } from "near-api-js";
import QRCode from "qrcode";

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
};

type Detected =
  | { kind: "empty"; label: string; detail: string }
  | { kind: "email"; label: string; detail: string; email: string }
  | { kind: "phone"; label: string; detail: string }
  | { kind: "near"; label: string; detail: string; accountId: string }
  | { kind: "unknown"; label: string; detail: string };

const KEYS = "nearw.keys";
const EMAIL_KEY = "nearw.email";
const PENDING_KEY = "nearw.pending";
const COLLECT_TIP_KEY = "nearw.collectTip";
const TRANSFER_GAS = 30n * 10n ** 12n;
const CALL_GAS = 80n * 10n ** 12n;

const setup = document.querySelector<HTMLElement>("#setup")!;
const wallet = document.querySelector<HTMLElement>("#wallet")!;
const sendView = document.querySelector<HTMLElement>("#send-view")!;
const sendDock = document.querySelector<HTMLElement>("#send-dock")!;
const statusEl = document.querySelector<HTMLElement>("#status")!;
const emailInput = document.querySelector<HTMLInputElement>("#email")!;
const otpBox = document.querySelector<HTMLElement>("#otp-box")!;
const otpInput = document.querySelector<HTMLInputElement>("#otp")!;
const sendCodeButton = document.querySelector<HTMLButtonElement>("#send-code")!;
const verifyCodeButton = document.querySelector<HTMLButtonElement>("#verify-code")!;
const retryButton = document.querySelector<HTMLButtonElement>("#retry-passkey")!;
const openButton = document.querySelector<HTMLButtonElement>("#open")!;
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
const historyList = document.querySelector<HTMLElement>("#history")!;
const outgoingList = document.querySelector<HTMLElement>("#outgoing")!;
const gasEl = document.querySelector<HTMLElement>("#gas")!;
const recipientInput = document.querySelector<HTMLInputElement>("#recipient")!;
const recipientAvatar = document.querySelector<HTMLImageElement>("#recipient-avatar")!;
const kindChip = document.querySelector<HTMLElement>("#kind-chip")!;
const resolvedEl = document.querySelector<HTMLElement>("#resolved")!;
const amountInput = document.querySelector<HTMLInputElement>("#amount")!;
const sendButton = document.querySelector<HTMLButtonElement>("#send")!;

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
let recipientToken = 0;
const gravatarCache = new Map<string, string>();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function syncSetupButtons(): void {
  const ok = EMAIL_PATTERN.test(emailInput.value.trim());
  openButton.disabled = !ok;
  sendCodeButton.disabled = !ok || !config.mailReady;
}

function setStatus(message: string): void {
  statusEl.textContent = message;
}

function explain(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload as T;
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

function emailHash(email: string): string {
  const digest = keccak_256(new TextEncoder().encode(email.trim().toLowerCase()));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatAmount(amount: string, decimals: number): string {
  const digits = amount.replace(/^\-/, "").replace(/\D/g, "").padStart(decimals + 1, "0");
  const whole = digits.slice(0, -decimals) || "0";
  const frac = digits.slice(-decimals).replace(/0+$/, "");
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

function pathIsSend(): boolean {
  return window.location.pathname === "/send";
}

function show(view: "setup" | "wallet" | "send"): void {
  setup.hidden = view !== "setup";
  wallet.hidden = view !== "wallet";
  sendView.hidden = view !== "send";
  sendDock.hidden = view !== "wallet";
  accountBox.hidden = !current;
}

function renderRoute(): void {
  if (!current) {
    show("setup");
    return;
  }
  show(pathIsSend() ? "send" : "wallet");
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

async function refreshBalances(): Promise<void> {
  if (!current) return;
  const balances = await api<{ near: string; token: string | null }>(
    `/ethw/api/balance?accountId=${encodeURIComponent(current.accountId)}`,
  );
  nearBalance.textContent = formatAmount(balances.near, 24);
  tokenBalance.textContent = balances.token === null ? "—" : formatAmount(balances.token, config.decimals);
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
  collectButton.hidden = result.incoming.length === 0;
  incomingNote.hidden = result.incoming.length === 0;
  incomingNote.textContent = result.incoming.length ? "Held until you collect them into this wallet." : "";
  incomingTip.hidden = window.localStorage.getItem(COLLECT_TIP_KEY) === "1" || result.incoming.length === 0;
  renderRows(incomingList, result.incoming, "", (row) => {
    return `${formatAmount(row.amount, config.decimals)} ${config.symbol} from ${partyLabel(row.senderEmail, row.senderAddress)}`;
  });
  renderRows(
    historyList,
    result.history,
    "No collected payments yet.",
    (row) => `${formatAmount(row.amount, config.decimals)} ${config.symbol} from ${partyLabel(row.senderEmail, row.senderAddress)}`,
  );
  renderRows(
    outgoingList,
    result.outgoing,
    "Nothing waiting.",
    (row) => `${formatAmount(row.amount, config.decimals)} ${config.symbol} to ${partyLabel(row.recipientEmail, "")}`,
    true,
  );
}

async function showWallet(email: string, accountId: string, secret: string): Promise<void> {
  current = { email, accountId, secret };
  window.localStorage.setItem(EMAIL_KEY, email);
  accountEmail.textContent = email;
  me.src = await gravatarUrl(email, 68);
  addressEl.textContent = accountId;
  explorer.href = `${explorerBase()}/address/${accountId}`;
  tokenLabel.textContent = config.symbol;
  gasEl.textContent = "Network fees are paid from your NEAR balance.";
  await QRCode.toCanvas(qr, accountId, { width: 124, margin: 1 });
  renderRoute();
  await refreshBalances();
  await loadEscrow();
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
  setStatus(result.devCode ? `Development code ${result.devCode}` : "Check your email for the code.");
}

async function verifyCode(): Promise<void> {
  const email = emailInput.value.trim().toLowerCase();
  const result = await api<{ emailToken: string }>("/ethw/api/otp/verify", { email, code: otpInput.value.trim() });
  verified = { email, emailToken: result.emailToken };
  retryButton.hidden = false;
  setStatus("Email verified. Creating the NEAR account.");
  await createWallet();
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
  const key = pendingKey();
  const created = await api<{ email: string; accountId: string }>("/ethw/api/register", {
    email: verified.email,
    publicKey: key.publicKey,
    emailToken: verified.emailToken,
  });
  saveKey(created.accountId, key.secret);
  window.sessionStorage.removeItem(PENDING_KEY);
  setStatus(`Account ${created.accountId} is ready.`);
  await showWallet(created.email, created.accountId, key.secret);
}

async function openWallet(): Promise<void> {
  const email = emailInput.value.trim().toLowerCase();
  if (!email) {
    setStatus("Enter an email.");
    return;
  }
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
  setStatus("");
  await showWallet(email, found.accountId, secret);
}

function logout(): void {
  current = null;
  window.localStorage.removeItem(EMAIL_KEY);
  accountMenu.hidden = true;
  show("setup");
  setStatus("Logged out on this device. The key is still saved here.");
}

function detectRecipient(raw: string): Detected {
  const value = raw.trim();
  if (!value) return { kind: "empty", label: "Recipient", detail: "" };
  if (value.includes("@")) return { kind: "email", label: "Email", detail: "", email: value.toLowerCase() };
  if (value.startsWith("+")) return { kind: "phone", label: "Phone", detail: "Phone payouts are not wired up yet." };
  if (/^[a-z0-9][a-z0-9._-]*\.(near|testnet)$/.test(value) || /^[0-9a-f]{64}$/.test(value)) {
    return { kind: "near", label: "NEAR account", detail: value, accountId: value };
  }
  return { kind: "unknown", label: "Recipient", detail: "Use an email or a NEAR account id." };
}

function setSendEnabled(enabled: boolean, label = "Send"): void {
  sendButton.disabled = !enabled;
  sendButton.textContent = label;
}

async function resolveRecipient(): Promise<void> {
  const token = ++recipientToken;
  const detected = detectRecipient(recipientInput.value);
  kindChip.dataset.kind = detected.kind;
  kindChip.textContent = detected.label;
  if (detected.kind === "empty") {
    recipientAvatar.hidden = true;
    resolvedEl.textContent = "";
    setSendEnabled(false);
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
  setSendEnabled(Boolean(config.token && config.escrow));
}

async function sendToken(): Promise<void> {
  if (!current) return;
  const detected = detectRecipient(recipientInput.value);
  const amount = parseAmount(amountInput.value, config.decimals);
  const account = await nearAccount();
  setStatus("Confirm the transaction in this browser.");
  sendButton.disabled = true;
  try {
    if (detected.kind === "email") {
      if (!config.token || !config.escrow) throw new Error("Set NEAR_TOKEN_ACCOUNT and NEAR_ESCROW_ACCOUNT on the server.");
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
      setStatus(`Held for ${detected.email}. ${hash}`);
    } else if (detected.kind === "near") {
      if (!config.token) throw new Error("Set NEAR_TOKEN_ACCOUNT on the server.");
      const outcome = await account.functionCall({
        contractId: config.token,
        methodName: "ft_transfer",
        args: { receiver_id: detected.accountId, amount: amount.toString(), memo: null },
        gas: TRANSFER_GAS,
        attachedDeposit: 1n,
      });
      setStatus(`Sent. ${outcome.transaction.hash}`);
    } else {
      throw new Error("Choose an email or a NEAR account.");
    }
    await refreshBalances();
    await loadEscrow();
  } finally {
    sendButton.disabled = false;
  }
}

async function collectEscrow(): Promise<void> {
  if (!current) return;
  collectButton.disabled = true;
  setStatus("Collecting the escrow balance.");
  try {
    const result = await api<{ txHash: string }>("/ethw/api/escrow/release", { email: current.email });
    setStatus(`Collected. ${result.txHash}`);
    await refreshBalances();
    await loadEscrow();
  } finally {
    collectButton.disabled = false;
  }
}

async function reclaimEscrow(row: EscrowRow): Promise<void> {
  if (!current || !config.escrow || row.depositId === null) return;
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
verifyCodeButton.addEventListener("click", () => {
  verifyCode().catch((error: unknown) => setStatus(explain(error)));
});
retryButton.addEventListener("click", () => {
  createWallet().catch((error: unknown) => setStatus(explain(error)));
});
openButton.addEventListener("click", () => {
  openWallet().catch((error: unknown) => setStatus(explain(error)));
});
emailInput.addEventListener("input", () => {
  syncSetupButtons();
});
collectButton.addEventListener("click", () => {
  collectEscrow().catch((error: unknown) => setStatus(explain(error)));
});
accountTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  accountMenu.hidden = !accountMenu.hidden;
  accountTrigger.setAttribute("aria-expanded", accountMenu.hidden ? "false" : "true");
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
  window.clearTimeout(lookupTimer);
  lookupTimer = window.setTimeout(() => {
    resolveRecipient().catch((error: unknown) => setStatus(explain(error)));
  }, 300);
});
sendButton.addEventListener("click", () => {
  sendToken().catch((error: unknown) => setStatus(explain(error)));
});

void api<Config>("/ethw/api/config")
  .then(async (loaded) => {
    config = loaded;
    tokenLabel.textContent = config.symbol;
    syncSetupButtons();
    if (!config.mailReady) {
      setStatus("Set RESEND_API_KEY, SMTP_URL, or EMAIL_DEV_MODE on the server to verify new wallets.");
    }
    const saved = window.localStorage.getItem(EMAIL_KEY);
    if (saved) {
      emailInput.value = saved;
      await openWallet();
    }
  })
  .catch((error: unknown) => setStatus(explain(error)));

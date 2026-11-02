import {
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  formatEther,
  formatUnits,
  http,
  keccak256,
  parseUnits,
  toBytes,
  type Address,
  type Hex,
} from "viem";
import { baseSepolia } from "viem/chains";
import {
  createBundlerClient,
  createWebAuthnCredential,
  toCoinbaseSmartAccount,
  toWebAuthnAccount,
} from "viem/account-abstraction";
import QRCode from "qrcode";

type Config = {
  chainId: number;
  rpc: string;
  erc20: Address | null;
  symbol: string;
  paymaster: boolean;
  escrow: Address | null;
  mailReady: boolean;
};

type EscrowRow = {
  id: number;
  depositId: number | null;
  recipientEmail: string;
  senderEmail: string;
  senderAddress: string;
  amount: string;
  txHash: string;
  unlockAt: string | null;
  reclaimable: boolean;
  claimedAt?: string | null;
};

type StoredAccount = {
  email: string;
  address: Address;
  credentialId: string;
  publicKey: Hex;
};

const emailInput = document.querySelector<HTMLInputElement>("#email")!;
const sendCodeButton = document.querySelector<HTMLButtonElement>("#send-code")!;
const verifyCodeButton = document.querySelector<HTMLButtonElement>("#verify-code")!;
const retryPasskeyButton = document.querySelector<HTMLButtonElement>("#retry-passkey")!;
const openButton = document.querySelector<HTMLButtonElement>("#open")!;
const otpBox = document.querySelector<HTMLElement>("#otp-box")!;
const otpInput = document.querySelector<HTMLInputElement>("#otp")!;
const otpNote = document.querySelector<HTMLElement>("#otp-note")!;
const setup = document.querySelector<HTMLElement>("#setup")!;
const wallet = document.querySelector<HTMLElement>("#wallet")!;
const sendView = document.querySelector<HTMLElement>("#send-view")!;
const sendDock = document.querySelector<HTMLElement>("#send-dock")!;
const brandHome = document.querySelector<HTMLButtonElement>("#brand-home")!;
const openSendButton = document.querySelector<HTMLButtonElement>("#open-send")!;
const sendBackButton = document.querySelector<HTMLButtonElement>("#send-back")!;
const addressEl = document.querySelector<HTMLElement>("#address")!;
const copyAddressButton = document.querySelector<HTMLButtonElement>("#copy-address")!;
const explorer = document.querySelector<HTMLAnchorElement>("#explorer")!;
const qr = document.querySelector<HTMLCanvasElement>("#qr")!;
const ethEl = document.querySelector<HTMLElement>("#eth")!;
const tokenLabel = document.querySelector<HTMLElement>("#token-label")!;
const tokenEl = document.querySelector<HTMLElement>("#token")!;
const accountEl = document.querySelector<HTMLElement>("#account")!;
const accountEmailEl = document.querySelector<HTMLElement>("#account-email")!;
const accountTrigger = document.querySelector<HTMLButtonElement>("#account-trigger")!;
const accountMenu = document.querySelector<HTMLElement>("#account-menu")!;
const logoutButton = document.querySelector<HTMLButtonElement>("#logout")!;
const me = document.querySelector<HTMLImageElement>("#me")!;
const recipientInput = document.querySelector<HTMLInputElement>("#recipient")!;
const recipientAvatar = document.querySelector<HTMLImageElement>("#recipient-avatar")!;
const kindChip = document.querySelector<HTMLElement>("#kind-chip")!;
const resolvedEl = document.querySelector<HTMLElement>("#resolved")!;
const amountInput = document.querySelector<HTMLInputElement>("#amount")!;
const sendButton = document.querySelector<HTMLButtonElement>("#send")!;
const incomingList = document.querySelector<HTMLElement>("#incoming")!;
const outgoingList = document.querySelector<HTMLElement>("#outgoing")!;
const historyList = document.querySelector<HTMLElement>("#history")!;
const incomingNote = document.querySelector<HTMLElement>("#incoming-note")!;
const incomingTip = document.querySelector<HTMLButtonElement>("#incoming-tip")!;
const collectButton = document.querySelector<HTMLButtonElement>("#collect")!;
const gasEl = document.querySelector<HTMLElement>("#gas")!;
const statusEl = document.querySelector<HTMLElement>("#status")!;
const COLLECT_TIP_KEY = "ethw.seenCollectTip";

type RecipientKind = "empty" | "email" | "phone" | "evm" | "near" | "unknown";

type RecipientLookup = {
  email: string;
  account: StoredAccount | null;
};

type DetectedRecipient = {
  kind: RecipientKind;
  label: string;
  detail: string;
};

let config: Config;
let current: StoredAccount | null = null;
let decimals = 6;
let lookupTimer = 0;
let balanceTimer = 0;
let userAvatarToken = 0;
let recipientToken = 0;
let lookedUp: RecipientLookup | null = null;
let emailToken: string | null = null;
let verifiedEmail: string | null = null;
const gravatarCache = new Map<string, string>();

const client = () =>
  createPublicClient({
    chain: baseSepolia,
    transport: http(new URL(config.rpc, window.location.origin).toString()),
  });

function setStatus(message: string): void {
  statusEl.textContent = message;
}

function explain(error: unknown): string {
  if (error && typeof error === "object" && "shortMessage" in error) {
    return String((error as { shortMessage: string }).shortMessage);
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

function errorText(error: unknown): string {
  const parts: string[] = [];
  let currentError: unknown = error;
  for (let depth = 0; currentError && depth < 4; depth += 1) {
    if (typeof currentError === "string") {
      parts.push(currentError);
      break;
    }
    if (typeof currentError !== "object") break;
    const record = currentError as { shortMessage?: unknown; message?: unknown; details?: unknown; cause?: unknown };
    if (record.shortMessage) parts.push(String(record.shortMessage));
    if (record.message) parts.push(String(record.message));
    if (record.details) parts.push(String(record.details));
    currentError = record.cause;
  }
  return parts.join(" ");
}

async function explainSend(error: unknown): Promise<string> {
  const text = errorText(error).toLowerCase();
  const gasFailure =
    text.includes("aa21") ||
    text.includes("pay prefund") ||
    text.includes("insufficient funds") ||
    text.includes("missing or invalid parameters");
  if (gasFailure && current && !config.paymaster) {
    try {
      const balance = await client().getBalance({ address: current.address });
      if (balance === 0n) return "no gas in account";
    } catch {
      if (text.includes("aa21") || text.includes("pay prefund") || text.includes("insufficient funds")) {
        return "no gas in account";
      }
    }
  }
  return explain(error);
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T & { error?: string }) : ({} as T & { error?: string });
  if (!response.ok) throw new Error(payload.error || response.statusText);
  return payload;
}

async function loadAccount(email: string): Promise<StoredAccount | null> {
  const result = await api<{ registered: boolean } & Partial<StoredAccount>>(
    `/ethw/api/account?email=${encodeURIComponent(email)}`,
  );
  if (!result.registered || !result.address || !result.credentialId || !result.publicKey || !result.email) {
    return null;
  }
  return {
    email: result.email,
    address: result.address,
    credentialId: result.credentialId,
    publicKey: result.publicKey,
  };
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function isNearAddress(value: string): boolean {
  const raw = value.trim().toLowerCase();
  if (/^[0-9a-f]{64}$/.test(raw)) return true;
  if (!/^[a-z0-9._-]+$/.test(raw)) return false;
  if (raw.length < 2 || raw.length > 64) return false;
  return (
    raw.endsWith(".near") ||
    raw.endsWith(".testnet") ||
    raw.endsWith(".tg") ||
    raw.includes(".")
  );
}

function isPhoneNumber(value: string): boolean {
  const raw = value.trim();
  if (raw.includes("@") || raw.startsWith("0x")) return false;
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) return false;
  return /^\+?[\d\s().-]{8,22}$/.test(raw);
}

function detectRecipient(value: string): DetectedRecipient {
  const raw = value.trim();
  if (!raw) {
    return { kind: "empty", label: "Recipient", detail: "" };
  }
  if (isEmail(raw)) {
    return { kind: "email", label: "Email", detail: "Escrow or direct send on Base Sepolia" };
  }
  if (isEvmAddress(raw)) {
    return {
      kind: "evm",
      label: "EVM · Base Sepolia",
      detail: "Detected as an Ethereum-compatible address on this wallet’s network",
    };
  }
  if (isPhoneNumber(raw)) {
    return { kind: "phone", label: "SMS", detail: "Phone delivery is coming soon" };
  }
  if (isNearAddress(raw)) {
    return { kind: "near", label: "NEAR", detail: "NEAR transfers are coming soon" };
  }
  return {
    kind: "unknown",
    label: "Unrecognized",
    detail: "Use an email, +phone, 0x address, or name.near",
  };
}

function pathIsSend(): boolean {
  return window.location.pathname === "/send" || window.location.pathname.endsWith("/send");
}

function renderRoute(): void {
  const onSend = pathIsSend();
  if (onSend && !current) {
    window.history.replaceState({}, "", "/");
    setup.hidden = false;
    wallet.hidden = true;
    sendView.hidden = true;
    sendDock.hidden = true;
    return;
  }
  setup.hidden = onSend || Boolean(current);
  wallet.hidden = onSend || !current;
  sendView.hidden = !onSend;
  sendDock.hidden = !current || onSend;
  if (onSend && current) syncSendButton();
}

function goHome(): void {
  if (window.location.pathname !== "/") {
    window.history.pushState({}, "", "/");
  }
  renderRoute();
}

function goSend(): void {
  if (!current) {
    setStatus("Open your wallet before sending.");
    return;
  }
  if (!pathIsSend()) {
    window.history.pushState({}, "", "/send");
  }
  renderRoute();
  recipientInput.focus();
}

async function gravatarUrl(email: string, size: number): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const key = `${normalized}|${size}`;
  const cached = gravatarCache.get(key);
  if (cached) return cached;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const url = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  gravatarCache.set(key, url);
  return url;
}

function setAccountMenuOpen(open: boolean): void {
  accountMenu.hidden = !open;
  accountTrigger.setAttribute("aria-expanded", open ? "true" : "false");
}

async function showUserAvatar(email: string): Promise<void> {
  const token = ++userAvatarToken;
  const trimmed = email.trim();
  if (!trimmed) {
    accountEl.hidden = true;
    accountEmailEl.textContent = "";
    setAccountMenuOpen(false);
    me.removeAttribute("src");
    return;
  }
  const url = await gravatarUrl(trimmed, 72);
  if (token !== userAvatarToken) return;
  me.src = url;
  accountEmailEl.textContent = trimmed;
  accountEl.hidden = false;
}

function isPasskeyCancel(error: unknown): boolean {
  const text = errorText(error).toLowerCase();
  return (
    text.includes("cancelled") ||
    text.includes("canceled") ||
    text.includes("notallowed") ||
    text.includes("the operation either timed out") ||
    text.includes("abort")
  );
}

function stopBalanceRefresh(): void {
  window.clearInterval(balanceTimer);
  balanceTimer = 0;
}

function startBalanceRefresh(): void {
  stopBalanceRefresh();
  balanceTimer = window.setInterval(() => {
    if (!current || document.hidden) return;
    refreshBalances({ quiet: true }).catch(() => undefined);
  }, 10_000);
}

function amountLabel(): string | null {
  const raw = amountInput.value.trim();
  if (!/^\d+(\.\d+)?$/.test(raw) || Number(raw) <= 0) return null;
  return raw;
}

function emailSendNotice(email: string, escrowed: boolean): void {
  if (!current) return;
  const amount = amountLabel();
  if (!amount) {
    setStatus("Enter an amount greater than zero.");
    return;
  }
  const subject = `Sending you ${amount} ${config.symbol}`;
  const lead = escrowed
    ? `I'm sending you ${amount} ${config.symbol}. It is held in escrow until you collect it.`
    : `I'm sending you ${amount} ${config.symbol}.`;
  const next = escrowed
    ? `Create a wallet at ${window.location.origin} using ${email}, then collect it.`
    : `Create a wallet at ${window.location.origin} using ${email} so you can receive it.`;
  const body = [lead, "", next, "", `This is from ${current.email} (${current.address}).`].join("\n");
  const link = document.createElement("a");
  link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  link.click();
  setStatus(`Email ready for ${email}: ${amount} ${config.symbol}.`);
}

function shortAddress(value: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function partyLabel(email: string, address: string): string {
  const trimmed = email.trim();
  if (trimmed) return trimmed;
  if (address) return shortAddress(address);
  return "Unknown";
}

async function copyAddress(): Promise<void> {
  if (!current) return;
  try {
    await navigator.clipboard.writeText(current.address);
    copyAddressButton.textContent = "Copied";
    window.setTimeout(() => {
      copyAddressButton.textContent = "Copy";
    }, 1200);
  } catch {
    setStatus("Could not copy the address.");
  }
}

function markCollectTipSeen(): void {
  window.localStorage.setItem(COLLECT_TIP_KEY, "1");
}

function syncCollectTip(hasIncoming: boolean): void {
  const seen = window.localStorage.getItem(COLLECT_TIP_KEY) === "1";
  incomingTip.hidden = !hasIncoming || seen;
}

async function showWallet(account: StoredAccount): Promise<void> {
  current = account;
  window.localStorage.setItem("ethw.email", account.email);
  emailInput.value = account.email;
  addressEl.textContent = shortAddress(account.address);
  addressEl.title = account.address;
  explorer.href = `https://sepolia.basescan.org/address/${account.address}`;
  tokenLabel.textContent = config.symbol;
  gasEl.textContent = config.paymaster ? "Gas is sponsored on Base Sepolia." : "";
  renderRoute();
  syncSendButton();
  await QRCode.toCanvas(qr, account.address, { width: 124, margin: 1 });
  await showUserAvatar(account.email);
  await refreshBalances();
  await loadEscrow();
  startBalanceRefresh();
}

function logout(): void {
  current = null;
  stopBalanceRefresh();
  window.localStorage.removeItem("ethw.email");
  clearEmailVerification();
  setAccountMenuOpen(false);
  setStatus("");
  if (pathIsSend()) {
    window.history.replaceState({}, "", "/");
  }
  renderRoute();
  showUserAvatar("").catch((error: unknown) => setStatus(explain(error)));
}

async function refreshBalances(options: { quiet?: boolean } = {}): Promise<void> {
  if (!current) return;
  if (!options.quiet) {
    ethEl.textContent = "…";
    tokenEl.textContent = "…";
  }
  try {
    const rpc = client();
    const wei = await rpc.getBalance({ address: current.address });
    ethEl.textContent = formatEther(wei);
    if (!config.erc20) {
      tokenEl.textContent = "Set ERC20_ADDRESS on the server";
      return;
    }
    decimals = await rpc.readContract({
      address: config.erc20,
      abi: erc20Abi,
      functionName: "decimals",
    });
    const raw = await rpc.readContract({
      address: config.erc20,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [current.address],
    });
    tokenEl.textContent = formatUnits(raw, decimals);
  } catch (error) {
    if (options.quiet) return;
    ethEl.textContent = "unavailable";
    tokenEl.textContent = "unavailable";
    setStatus(explain(error));
  }
}

async function smartAccount() {
  if (!current) throw new Error("Open a wallet first.");
  const owner = toWebAuthnAccount({
    credential: { id: current.credentialId, publicKey: current.publicKey },
    rpId: window.location.hostname,
  });
  return toCoinbaseSmartAccount({
    client: client(),
    owners: [owner],
    version: "1.1",
  });
}

function clearEmailVerification(): void {
  emailToken = null;
  verifiedEmail = null;
  otpBox.hidden = true;
  otpInput.value = "";
  otpInput.disabled = false;
  retryPasskeyButton.hidden = true;
  verifyCodeButton.hidden = false;
}

async function sendCode(): Promise<void> {
  const email = emailInput.value.trim();
  if (!email) {
    setStatus("Enter an email.");
    return;
  }
  if (!config.mailReady) {
    setStatus("Email sending is not configured on the server.");
    return;
  }
  clearEmailVerification();
  setStatus("Sending a verification code.");
  sendCodeButton.disabled = true;
  try {
    const result = await api<{ sent: boolean; devCode?: string }>("/ethw/api/otp/send", { email });
    otpBox.hidden = false;
    otpNote.textContent = result.devCode
      ? `Dev mode code: ${result.devCode}`
      : "We emailed a code so only the mailbox owner can create this wallet.";
    setStatus("Enter the code from your email.");
    otpInput.focus();
  } finally {
    sendCodeButton.disabled = false;
  }
}

async function verifyCode(): Promise<void> {
  const email = emailInput.value.trim();
  const code = otpInput.value.trim();
  if (!email) {
    setStatus("Enter an email.");
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    setStatus("Enter the 6-digit code.");
    return;
  }
  verifyCodeButton.disabled = true;
  try {
    const result = await api<{ email: string; emailToken: string }>("/ethw/api/otp/verify", { email, code });
    emailToken = result.emailToken;
    verifiedEmail = result.email;
    verifyCodeButton.hidden = true;
    otpInput.disabled = true;
    setStatus("Email verified. Setting up your passkey.");
    await createWallet();
  } catch (error) {
    setStatus(explain(error));
  } finally {
    verifyCodeButton.disabled = false;
  }
}

async function createWallet(): Promise<void> {
  const email = emailInput.value.trim();
  if (!email) {
    setStatus("Enter an email.");
    return;
  }
  if (!emailToken || verifiedEmail !== email.trim().toLowerCase()) {
    setStatus("Verify your email before creating a wallet.");
    return;
  }
  retryPasskeyButton.hidden = true;
  setStatus("Confirm the passkey prompt.");
  try {
    const credential = await createWebAuthnCredential({
      name: email,
      authenticatorSelection: {
        residentKey: "required",
        requireResidentKey: true,
        userVerification: "required",
      },
    });
    const account = await toCoinbaseSmartAccount({
      client: client(),
      owners: [toWebAuthnAccount({ credential })],
      version: "1.1",
    });
    const saved = await api<{ email: string; address: Address }>("/ethw/api/register", {
      email,
      address: account.address,
      credentialId: credential.id,
      publicKey: credential.publicKey,
      emailToken,
    });
    clearEmailVerification();
    otpInput.disabled = false;
    setStatus("Wallet created.");
    await showWallet({
      email: saved.email,
      address: saved.address,
      credentialId: credential.id,
      publicKey: credential.publicKey,
    });
  } catch (error) {
    if (isPasskeyCancel(error)) {
      setStatus("Passkey setup was cancelled. Retry when you are ready.");
      retryPasskeyButton.hidden = false;
      return;
    }
    setStatus(explain(error));
    retryPasskeyButton.hidden = false;
  }
}

async function openWallet(): Promise<void> {
  const email = emailInput.value.trim();
  if (!email) {
    setStatus("Enter the email you registered.");
    return;
  }
  const account = await loadAccount(email);
  if (!account) {
    setStatus("No wallet is registered for that email.");
    return;
  }
  setStatus("");
  await showWallet(account);
}

function setSendAction(kind: RecipientKind, registered = true): void {
  if (kind === "phone") {
    sendButton.textContent = "SMS coming soon";
    sendButton.disabled = true;
    return;
  }
  if (kind === "near") {
    sendButton.textContent = "NEAR coming soon";
    sendButton.disabled = true;
    return;
  }
  if (kind === "empty" || kind === "unknown") {
    sendButton.textContent = "Send";
    sendButton.disabled = true;
    return;
  }
  sendButton.textContent = "Send";
  sendButton.disabled = kind === "email" && !registered ? false : !config.erc20;
}

function unlockLabel(row: EscrowRow): string {
  if (!row.unlockAt) return "pull-back after one week";
  const unlockMs = Date.parse(row.unlockAt);
  if (Number.isNaN(unlockMs)) return "pull-back after one week";
  if (unlockMs <= Date.now()) return "ready to pull back";
  const days = Math.max(1, Math.ceil((unlockMs - Date.now()) / (24 * 60 * 60 * 1000)));
  return days === 1 ? "pull-back in 1 day" : `pull-back in ${days} days`;
}

function renderEscrow(
  list: HTMLElement,
  rows: EscrowRow[],
  empty: string,
  describe: (row: EscrowRow) => string,
  options: { reclaim?: boolean } = {},
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
    item.append(`${describe(row)} · `);
    const link = document.createElement("a");
    link.href = `https://sepolia.basescan.org/tx/${row.txHash}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "transaction";
    item.append(link);
    if (options.reclaim) {
      item.append(` · ${unlockLabel(row)}`);
      if (row.reclaimable && row.depositId !== null) {
        item.append(" · ");
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Pull back";
        button.addEventListener("click", () => {
          reclaimEscrow(row).catch((error: unknown) => setStatus(explain(error)));
        });
        item.append(button);
      }
    }
    list.append(item);
  }
}

function tokenAmount(amount: string): string {
  try {
    return `${formatUnits(BigInt(amount), decimals)} ${config.symbol}`;
  } catch {
    return amount;
  }
}

async function loadEscrow(): Promise<void> {
  if (!current) return;
  const result = await api<{ incoming: EscrowRow[]; outgoing: EscrowRow[]; history: EscrowRow[] }>(
    `/ethw/api/escrow?email=${encodeURIComponent(current.email)}`,
  );
  renderEscrow(incomingList, result.incoming, "Nothing to collect.", (row) => {
    return `${tokenAmount(row.amount)} from ${partyLabel(row.senderEmail, row.senderAddress)}`;
  });
  renderEscrow(
    outgoingList,
    result.outgoing,
    "No payments waiting.",
    (row) => `${tokenAmount(row.amount)} to ${partyLabel(row.recipientEmail, "")} — not collected yet`,
    { reclaim: true },
  );
  renderEscrow(historyList, result.history, "No received payments yet.", (row) => {
    return `${tokenAmount(row.amount)} from ${partyLabel(row.senderEmail, row.senderAddress)}`;
  });
  if (!config.escrow && result.incoming.length > 0) {
    incomingNote.hidden = false;
    incomingNote.textContent = "Set ESCROW_ADDRESS and ESCROW_OPERATOR_KEY before these can be collected.";
  } else {
    incomingNote.hidden = true;
    incomingNote.textContent = "";
  }
  syncCollectTip(result.incoming.length > 0);
  collectButton.hidden = result.incoming.length === 0;
  if (result.incoming.length > 0) {
    const total = result.incoming.reduce((sum, row) => sum + BigInt(row.amount), 0n);
    setStatus(`You have ${formatUnits(total, decimals)} ${config.symbol} to collect.`);
  }
}

async function reclaimEscrow(row: EscrowRow): Promise<void> {
  if (!current || !config.escrow || row.depositId === null) return;
  if (!row.reclaimable) {
    setStatus("That payment can be pulled back after one week.");
    return;
  }
  setStatus("Confirm the passkey to pull the payment back.");
  const account = await smartAccount();
  const bundler = createBundlerClient({
    client: client(),
    transport: http(new URL(config.rpc, window.location.origin).toString()),
    chain: baseSepolia,
    paymaster: config.paymaster ? true : undefined,
  });
  const hash = await bundler.sendUserOperation({
    account,
    calls: [
      {
        to: config.escrow,
        data: encodeFunctionData({
          abi: [
            {
              type: "function",
              name: "reclaim",
              stateMutability: "nonpayable",
              inputs: [{ name: "depositId", type: "uint256" }],
              outputs: [],
            },
          ],
          functionName: "reclaim",
          args: [BigInt(row.depositId)],
        }),
      },
    ],
  });
  setStatus("Waiting for the pull-back.");
  const receipt = await bundler.waitForUserOperationReceipt({ hash });
  await api("/ethw/api/escrow/reclaim", {
    senderEmail: current.email,
    depositId: row.depositId,
    txHash: receipt.receipt.transactionHash,
  });
  setStatus(`Pulled back. ${receipt.receipt.transactionHash}`);
  await refreshBalances();
  await loadEscrow();
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

function syncSendButton(): void {
  const detected = detectRecipient(recipientInput.value);
  if (detected.kind === "email") {
    const raw = recipientInput.value.trim().toLowerCase();
    const unregistered = lookedUp?.email === raw && !lookedUp.account;
    setSendAction("email", !unregistered);
    return;
  }
  setSendAction(detected.kind);
}

function setKindChip(detected: DetectedRecipient): void {
  kindChip.dataset.kind = detected.kind;
  kindChip.textContent = detected.label;
}

async function resolveRecipient(): Promise<void> {
  const token = ++recipientToken;
  const raw = recipientInput.value.trim();
  const detected = detectRecipient(raw);
  setKindChip(detected);

  if (detected.kind === "empty") {
    lookedUp = null;
    resolvedEl.textContent = "";
    recipientAvatar.hidden = true;
    recipientAvatar.removeAttribute("src");
    setSendAction("empty");
    return;
  }

  if (detected.kind === "email") {
    const url = await gravatarUrl(raw, 80);
    if (token !== recipientToken) return;
    recipientAvatar.hidden = false;
    recipientAvatar.src = url;
    const account = await loadAccount(raw);
    if (token !== recipientToken) return;
    lookedUp = { email: raw.toLowerCase(), account };
    if (account) {
      resolvedEl.textContent = `Registered · ${account.address}`;
      setSendAction("email", true);
    } else {
      resolvedEl.textContent = config.escrow
        ? "Not registered. A send is held in escrow until they register and collect it."
        : "Not registered — they’ll need a wallet before collecting.";
      setSendAction("email", false);
    }
    return;
  }

  lookedUp = null;
  recipientAvatar.hidden = true;
  recipientAvatar.removeAttribute("src");
  resolvedEl.textContent = detected.detail;
  setSendAction(detected.kind);
}

async function depositEscrow(email: string): Promise<void> {
  if (!current || !config.erc20 || !config.escrow) return;
  let amount: bigint;
  try {
    amount = parseUnits(amountInput.value.trim(), decimals);
  } catch {
    setStatus("Enter an amount.");
    return;
  }
  if (amount <= 0n) {
    setStatus("Enter an amount greater than zero.");
    return;
  }
  setStatus("Confirm the passkey to put this in escrow.");
  sendButton.disabled = true;
  try {
    const account = await smartAccount();
    const bundler = createBundlerClient({
      client: client(),
      transport: http(new URL(config.rpc, window.location.origin).toString()),
      chain: baseSepolia,
      paymaster: config.paymaster ? true : undefined,
    });
    const hash = await bundler.sendUserOperation({
      account,
      calls: [
        {
          to: config.erc20,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [config.escrow, amount],
          }),
        },
        {
          to: config.escrow,
          data: encodeFunctionData({
            abi: [
              {
                type: "function",
                name: "deposit",
                stateMutability: "nonpayable",
                inputs: [
                  { name: "emailHash", type: "bytes32" },
                  { name: "amount", type: "uint256" },
                ],
                outputs: [],
              },
            ],
            functionName: "deposit",
            args: [keccak256(toBytes(email.trim().toLowerCase())), amount],
          }),
        },
      ],
    });
    setStatus("Waiting for the escrow deposit.");
    const receipt = await bundler.waitForUserOperationReceipt({ hash });
    await api("/ethw/api/escrow/deposit", {
      senderEmail: current.email,
      recipientEmail: email,
      txHash: receipt.receipt.transactionHash,
    });
    await refreshBalances();
    await loadEscrow();
    emailSendNotice(email, true);
  } catch (error) {
    setStatus(await explainSend(error));
  } finally {
    syncSendButton();
  }
}

async function sendToEvmAddress(to: `0x${string}`): Promise<void> {
  if (!current) return;
  if (!config.erc20) {
    setStatus("Set ERC20_ADDRESS on the server before sending.");
    return;
  }
  if (to.toLowerCase() === current.address.toLowerCase()) {
    setStatus("Choose a different recipient.");
    return;
  }
  let amount: bigint;
  try {
    amount = parseUnits(amountInput.value.trim(), decimals);
  } catch {
    setStatus("Enter an amount.");
    return;
  }
  if (amount <= 0n) {
    setStatus("Enter an amount greater than zero.");
    return;
  }
  setStatus("Confirm the passkey to send on Base Sepolia.");
  sendButton.disabled = true;
  try {
    const account = await smartAccount();
    const bundler = createBundlerClient({
      client: client(),
      transport: http(new URL(config.rpc, window.location.origin).toString()),
      chain: baseSepolia,
      paymaster: config.paymaster ? true : undefined,
    });
    const hash = await bundler.sendUserOperation({
      account,
      calls: [
        {
          to: config.erc20,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, amount],
          }),
        },
      ],
    });
    setStatus("Waiting for the transfer.");
    const receipt = await bundler.waitForUserOperationReceipt({ hash });
    const tx = receipt.receipt.transactionHash;
    setStatus(`Sent on Base Sepolia. ${tx}`);
    amountInput.value = "";
    await refreshBalances();
  } catch (error) {
    setStatus(await explainSend(error));
  } finally {
    syncSendButton();
  }
}

async function sendToken(): Promise<void> {
  if (!current) return;
  const raw = recipientInput.value.trim();
  const detected = detectRecipient(raw);
  await resolveRecipient();

  if (detected.kind === "phone") {
    setStatus("SMS delivery is not available yet. Use email or a 0x address.");
    return;
  }
  if (detected.kind === "near") {
    setStatus("NEAR transfers are not available yet. Use email or a Base Sepolia 0x address.");
    return;
  }
  if (detected.kind === "unknown" || detected.kind === "empty") {
    setStatus("Enter an email, phone, 0x address, or NEAR account.");
    return;
  }
  if (detected.kind === "evm") {
    await sendToEvmAddress(raw as `0x${string}`);
    return;
  }

  const recipient = lookedUp?.email === raw.toLowerCase() ? lookedUp.account : null;
  if (!lookedUp || lookedUp.email !== raw.toLowerCase()) return;
  if (!recipient) {
    if (config.escrow && config.erc20) await depositEscrow(raw);
    else emailSendNotice(raw, false);
    return;
  }
  if (recipient.address.toLowerCase() === current.address.toLowerCase()) {
    setStatus("Choose a different recipient.");
    return;
  }
  await sendToEvmAddress(recipient.address as `0x${string}`);
}

sendCodeButton.disabled = true;
openButton.disabled = true;
renderRoute();
setKindChip(detectRecipient(""));

sendCodeButton.addEventListener("click", () => {
  sendCode().catch((error: unknown) => setStatus(explain(error)));
});
verifyCodeButton.addEventListener("click", () => {
  verifyCode().catch((error: unknown) => setStatus(explain(error)));
});
retryPasskeyButton.addEventListener("click", () => {
  createWallet().catch((error: unknown) => setStatus(explain(error)));
});
openButton.addEventListener("click", () => {
  openWallet().catch((error: unknown) => setStatus(explain(error)));
});
emailInput.addEventListener("input", () => {
  if (verifiedEmail && verifiedEmail !== emailInput.value.trim().toLowerCase()) {
    clearEmailVerification();
    otpInput.disabled = false;
  }
});
collectButton.addEventListener("click", () => {
  collectEscrow().catch((error: unknown) => setStatus(explain(error)));
});
accountTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  setAccountMenuOpen(accountMenu.hidden);
});
logoutButton.addEventListener("click", () => {
  logout();
});
copyAddressButton.addEventListener("click", () => {
  copyAddress().catch((error: unknown) => setStatus(explain(error)));
});
incomingTip.addEventListener("mouseenter", () => {
  markCollectTipSeen();
});
incomingTip.addEventListener("focus", () => {
  markCollectTipSeen();
});
incomingTip.addEventListener("mouseleave", () => {
  if (window.localStorage.getItem(COLLECT_TIP_KEY) === "1") incomingTip.hidden = true;
});
incomingTip.addEventListener("blur", () => {
  if (window.localStorage.getItem(COLLECT_TIP_KEY) === "1") incomingTip.hidden = true;
});
brandHome.addEventListener("click", () => {
  goHome();
});
openSendButton.addEventListener("click", () => {
  goSend();
});
sendBackButton.addEventListener("click", () => {
  goHome();
});
window.addEventListener("popstate", () => {
  renderRoute();
});
document.addEventListener("click", () => {
  if (!accountMenu.hidden) setAccountMenuOpen(false);
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && current) {
    refreshBalances({ quiet: true }).catch(() => undefined);
  }
});
recipientInput.addEventListener("input", () => {
  const detected = detectRecipient(recipientInput.value);
  setKindChip(detected);
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
    sendCodeButton.disabled = !config.mailReady;
    openButton.disabled = false;
    if (!config.mailReady) {
      setStatus("Set RESEND_API_KEY or SMTP_URL on the server to verify new wallets.");
    }
    const saved = window.localStorage.getItem("ethw.email");
    if (!saved) {
      renderRoute();
      return;
    }
    emailInput.value = saved;
    const account = await loadAccount(saved);
    if (account) await showWallet(account);
    else renderRoute();
  })
  .catch((error: unknown) => setStatus(explain(error)));

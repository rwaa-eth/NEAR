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
};

type EscrowRow = {
  recipientEmail: string;
  senderEmail: string;
  senderAddress: string;
  amount: string;
  txHash: string;
};

type StoredAccount = {
  email: string;
  address: Address;
  credentialId: string;
  publicKey: Hex;
};

const emailInput = document.querySelector<HTMLInputElement>("#email")!;
const createButton = document.querySelector<HTMLButtonElement>("#create")!;
const openButton = document.querySelector<HTMLButtonElement>("#open")!;
const setup = document.querySelector<HTMLElement>("#setup")!;
const wallet = document.querySelector<HTMLElement>("#wallet")!;
const addressEl = document.querySelector<HTMLElement>("#address")!;
const explorer = document.querySelector<HTMLAnchorElement>("#explorer")!;
const qr = document.querySelector<HTMLCanvasElement>("#qr")!;
const ethEl = document.querySelector<HTMLElement>("#eth")!;
const tokenLabel = document.querySelector<HTMLElement>("#token-label")!;
const tokenEl = document.querySelector<HTMLElement>("#token")!;
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh")!;
const switchButton = document.querySelector<HTMLButtonElement>("#switch")!;
const me = document.querySelector<HTMLImageElement>("#me")!;
const recipientInput = document.querySelector<HTMLInputElement>("#recipient")!;
const recipientAvatar = document.querySelector<HTMLImageElement>("#recipient-avatar")!;
const resolvedEl = document.querySelector<HTMLElement>("#resolved")!;
const amountInput = document.querySelector<HTMLInputElement>("#amount")!;
const sendButton = document.querySelector<HTMLButtonElement>("#send")!;
const incomingList = document.querySelector<HTMLElement>("#incoming")!;
const outgoingList = document.querySelector<HTMLElement>("#outgoing")!;
const incomingNote = document.querySelector<HTMLElement>("#incoming-note")!;
const collectButton = document.querySelector<HTMLButtonElement>("#collect")!;
const gasEl = document.querySelector<HTMLElement>("#gas")!;
const statusEl = document.querySelector<HTMLElement>("#status")!;

type RecipientLookup = {
  email: string;
  account: StoredAccount | null;
};

let config: Config;
let current: StoredAccount | null = null;
let decimals = 6;
let lookupTimer = 0;
let meTimer = 0;
let userAvatarToken = 0;
let recipientToken = 0;
let lookedUp: RecipientLookup | null = null;
const gravatarCache = new Map<string, string>();

const placeholderAvatar =
  "https://www.gravatar.com/avatar/0000000000000000000000000000000000000000000000000000000000000000?d=mp&f=y&s=96";

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

async function showUserAvatar(email: string): Promise<void> {
  const token = ++userAvatarToken;
  const trimmed = email.trim();
  if (!trimmed) {
    me.src = placeholderAvatar;
    return;
  }
  const url = await gravatarUrl(trimmed, 96);
  if (token !== userAvatarToken) return;
  me.src = url;
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

async function showWallet(account: StoredAccount): Promise<void> {
  current = account;
  window.localStorage.setItem("ethw.email", account.email);
  emailInput.value = account.email;
  setup.hidden = true;
  wallet.hidden = false;
  addressEl.textContent = account.address;
  explorer.href = `https://sepolia.basescan.org/address/${account.address}`;
  tokenLabel.textContent = config.symbol;
  gasEl.textContent = config.paymaster
    ? ""
    : "";
  syncSendButton();
  await QRCode.toCanvas(qr, account.address, { width: 180, margin: 1 });
  await showUserAvatar(account.email);
  await refreshBalances();
  await loadEscrow();
}

async function refreshBalances(): Promise<void> {
  if (!current) return;
  ethEl.textContent = "…";
  tokenEl.textContent = "…";
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

async function createWallet(): Promise<void> {
  const email = emailInput.value.trim();
  if (!email) {
    setStatus("Enter an email.");
    return;
  }
  setStatus("Confirm the passkey prompt.");
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
  });
  setStatus("Wallet created.");
  await showWallet({
    email: saved.email,
    address: saved.address,
    credentialId: credential.id,
    publicKey: credential.publicKey,
  });
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

function setSendAction(registered: boolean): void {
  if (registered) {
    sendButton.textContent = "Send";
    sendButton.disabled = !config.erc20;
    return;
  }
  if (config.escrow && config.erc20) {
    sendButton.textContent = "Send to escrow";
    sendButton.disabled = false;
    return;
  }
  sendButton.textContent = "Email send notice";
  sendButton.disabled = false;
}

function renderEscrow(list: HTMLElement, rows: EscrowRow[], empty: string, describe: (row: EscrowRow) => string): void {
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
  const result = await api<{ incoming: EscrowRow[]; outgoing: EscrowRow[] }>(
    `/ethw/api/escrow?email=${encodeURIComponent(current.email)}`,
  );
  renderEscrow(incomingList, result.incoming, "Nothing to collect.", (row) => {
    return `${tokenAmount(row.amount)} from ${row.senderEmail}`;
  });
  renderEscrow(outgoingList, result.outgoing, "No payments waiting.", (row) => {
    return `${tokenAmount(row.amount)} to ${row.recipientEmail} — not collected yet`;
  });
  incomingNote.textContent = config.escrow
    ? ""
    : result.incoming.length > 0
      ? "Set ESCROW_ADDRESS and ESCROW_OPERATOR_KEY before these can be collected."
      : "Set ESCROW_ADDRESS on the server to hold payments for emails that have not registered.";
  collectButton.hidden = result.incoming.length === 0;
  if (result.incoming.length > 0) {
    const total = result.incoming.reduce((sum, row) => sum + BigInt(row.amount), 0n);
    setStatus(`You have ${formatUnits(total, decimals)} ${config.symbol} to collect.`);
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

function syncSendButton(): void {
  const raw = recipientInput.value.trim().toLowerCase();
  const unregistered = isEmail(raw) && lookedUp?.email === raw && !lookedUp.account;
  setSendAction(!unregistered);
}

async function resolveRecipient(): Promise<void> {
  const token = ++recipientToken;
  const raw = recipientInput.value.trim();
  if (!raw) {
    lookedUp = null;
    resolvedEl.textContent = "";
    recipientAvatar.hidden = true;
    recipientAvatar.removeAttribute("src");
    setSendAction(true);
    return;
  }
  const url = await gravatarUrl(raw, 80);
  if (token !== recipientToken) return;
  recipientAvatar.hidden = false;
  recipientAvatar.src = url;
  if (!isEmail(raw)) {
    lookedUp = null;
    resolvedEl.textContent = "";
    setSendAction(true);
    return;
  }
  const account = await loadAccount(raw);
  if (token !== recipientToken) return;
  lookedUp = { email: raw.toLowerCase(), account };
  if (account) {
    resolvedEl.textContent = `Registered · ${account.address}`;
    setSendAction(true);
  } else {
    resolvedEl.textContent = config.escrow
      ? "Not registered. A send is held in escrow until they register and collect it."
      : "Not registered";
    setSendAction(false);
  }
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

async function sendToken(): Promise<void> {
  if (!current) return;
  const raw = recipientInput.value.trim();
  if (!isEmail(raw)) {
    setStatus("Enter the recipient email.");
    return;
  }
  await resolveRecipient();
  const recipient = lookedUp?.email === raw.toLowerCase() ? lookedUp.account : null;
  if (!lookedUp || lookedUp.email !== raw.toLowerCase()) return;
  if (!recipient) {
    if (config.escrow && config.erc20) await depositEscrow(raw);
    else emailSendNotice(raw, false);
    return;
  }
  if (!config.erc20) {
    setStatus("Set ERC20_ADDRESS on the server before sending.");
    return;
  }
  if (recipient.address.toLowerCase() === current.address.toLowerCase()) {
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
  setStatus("Confirm the passkey to send.");
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
            args: [recipient.address, amount],
          }),
        },
      ],
    });
    setStatus("Waiting for the transfer.");
    const receipt = await bundler.waitForUserOperationReceipt({ hash });
    const tx = receipt.receipt.transactionHash;
    setStatus(`Sent. ${tx}`);
    amountInput.value = "";
    await refreshBalances();
  } catch (error) {
    setStatus(await explainSend(error));
  } finally {
    syncSendButton();
  }
}

createButton.disabled = true;
openButton.disabled = true;

createButton.addEventListener("click", () => {
  createWallet().catch((error: unknown) => setStatus(explain(error)));
});
openButton.addEventListener("click", () => {
  openWallet().catch((error: unknown) => setStatus(explain(error)));
});
refreshButton.addEventListener("click", () => {
  refreshBalances()
    .then(() => loadEscrow())
    .catch((error: unknown) => setStatus(explain(error)));
});
collectButton.addEventListener("click", () => {
  collectEscrow().catch((error: unknown) => setStatus(explain(error)));
});
switchButton.addEventListener("click", () => {
  current = null;
  window.localStorage.removeItem("ethw.email");
  wallet.hidden = true;
  setup.hidden = false;
  setStatus("");
  showUserAvatar(emailInput.value).catch((error: unknown) => setStatus(explain(error)));
});
emailInput.addEventListener("input", () => {
  window.clearTimeout(meTimer);
  meTimer = window.setTimeout(() => {
    showUserAvatar(emailInput.value).catch((error: unknown) => setStatus(explain(error)));
  }, 200);
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

me.src = placeholderAvatar;

void api<Config>("/ethw/api/config")
  .then(async (loaded) => {
    config = loaded;
    createButton.disabled = false;
    openButton.disabled = false;
    const saved = window.localStorage.getItem("ethw.email");
    if (!saved) return;
    emailInput.value = saved;
    const account = await loadAccount(saved);
    if (account) await showWallet(account);
  })
  .catch((error: unknown) => setStatus(explain(error)));

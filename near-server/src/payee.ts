const USDT_ASSET = "0xdac17f958d2ee523a2206206994597c13d831ec7";

export type Eip681Payment = {
  address: string;
  amount: string;
  label: string;
  uuid: string;
  usdt: boolean;
};

/** An `ethereum:` payment request with a decimal amount, as used by the ATM QR. */
export function eip681Payment(raw: string): Eip681Payment | null {
  const text = raw.trim();
  const match = text.match(/^ethereum:([^?\s]+)(?:\?([^\s]*))?$/i);
  if (!match) return null;
  const path = decodeURIComponent(match[1].split("@")[0]);
  const address = path.match(/0x[a-fA-F0-9]{40}/);
  if (!address) return null;
  const params = new URLSearchParams(match[2] ?? "");
  const amount = (params.get("amount") ?? "").trim();
  if (!/^\d+(\.\d+)?$/.test(amount)) return null;
  const [whole, frac = ""] = amount.split(".");
  if (BigInt(whole + (frac || "0")) <= 0n) return null;
  const asset = (params.get("req-asset") ?? params.get("asset") ?? "").trim();
  return {
    address: address[0],
    amount,
    label: (params.get("label") ?? "").trim(),
    uuid: (params.get("uuid") ?? "").trim(),
    usdt: !asset || asset.toLowerCase() === USDT_ASSET,
  };
}

/** Pull an email or account out of a QR payload. The picture itself never leaves the browser. */
export function payeeFromQr(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  const uri = text.match(/^(?:ethereum|near):([^\s?]+)/i);
  let body = uri ? decodeURIComponent(uri[1].split("@")[0]) : text;
  if (/^mailto:/i.test(body)) {
    return decodeURIComponent(body.slice("mailto:".length).split("?")[0]).trim().toLowerCase();
  }
  const evm = body.match(/0x[a-fA-F0-9]{40}/);
  if (evm) return evm[0];
  const named = body.match(/[a-z0-9][a-z0-9._-]{0,62}\.(?:near|testnet)\b/i);
  if (named) return named[0].toLowerCase();
  const implicit = body.match(/(?:^|[^0-9a-f])([0-9a-f]{64})(?:$|[^0-9a-f])/i);
  if (implicit) return implicit[1].toLowerCase();
  const email = body.match(/[^\s<>]+@[^\s<>]+\.[^\s<>]+/);
  if (email) return email[0].toLowerCase();
  return body.trim();
}

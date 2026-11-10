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

/**
 * Password gate for the private /sport area.
 *
 * The whole area is guarded by a single shared secret in `SPORT_PASSWORD`.
 * Rather than store a session server-side, a successful login mints a signed
 * token that carries its own expiry: `<unix-expiry>.<hmac>`, where the HMAC is
 * taken over the expiry with the password as the key. That means the expiry
 * cannot be edited by hand, and there is no session table to keep.
 *
 * Everything here uses Web Crypto (not `node:crypto`) so the same helpers run
 * unchanged in middleware on the edge runtime and in route handlers on Node.
 */

const TOKEN_VERSION = "v1";
const encoder = new TextEncoder();

/** Name of the cookie holding the signed session token. */
export const SPORT_COOKIE = "sport_session";

/** A week, so a browser I use regularly is not asking every day. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret(): string | null {
  const value = process.env.SPORT_PASSWORD;

  return value && value.length > 0 ? value : null;
}

/**
 * False when `SPORT_PASSWORD` is unset. Callers treat that as "this area does
 * not exist" rather than "this area is open", so a missing env var fails
 * closed instead of publishing the console.
 */
export function isSportConfigured(): boolean {
  return secret() !== null;
}

async function hmac(key: string, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  return new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message)),
  );
}

/** Length-safe, branch-free comparison so no timing signal leaks. */
function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;

  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];

  return diff === 0;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0) return null;
  if (!/^[0-9a-f]+$/.test(hex)) return null;

  const out = new Uint8Array(hex.length / 2);

  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return out;
}

/**
 * Compares a submitted password against the configured one. Both sides are
 * hashed first so the comparison time does not depend on how many leading
 * characters a guess happened to get right, nor on the guess's length.
 */
export async function checkPassword(candidate: string): Promise<boolean> {
  const key = secret();

  if (!key) return false;

  const [a, b] = await Promise.all([
    hmac("sport.compare", candidate),
    hmac("sport.compare", key),
  ]);

  return equalBytes(a, b);
}

/** Mints a token valid for `SESSION_MAX_AGE_SECONDS`. */
export async function createSessionToken(
  now: number = Date.now(),
): Promise<string | null> {
  const key = secret();

  if (!key) return null;

  const expiry = Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS;
  const signature = await hmac(key, `${TOKEN_VERSION}.${expiry}`);

  return `${expiry}.${toHex(signature)}`;
}

/**
 * True only for a token this server signed that has not yet expired. Changing
 * `SPORT_PASSWORD` invalidates every outstanding token, since the password is
 * the signing key.
 */
export async function verifySessionToken(
  token: string | undefined | null,
  now: number = Date.now(),
): Promise<boolean> {
  const key = secret();

  if (!key || !token) return false;

  const separator = token.indexOf(".");

  if (separator === -1) return false;

  const expiry = Number(token.slice(0, separator));

  if (!Number.isSafeInteger(expiry) || expiry * 1000 <= now) return false;

  const provided = fromHex(token.slice(separator + 1));

  if (!provided) return false;

  return equalBytes(provided, await hmac(key, `${TOKEN_VERSION}.${expiry}`));
}

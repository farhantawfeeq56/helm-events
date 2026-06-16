/**
 * Session tokens — signed, stateless auth cookies.
 *
 * Uses the Web Crypto API (HMAC-SHA256) so the same code runs in both the
 * edge middleware and Node route handlers, with no external dependencies.
 * The token is `base64url(payload).base64url(hmac)`; the payload carries the
 * user's email, workspace role, and display name.
 */

export type Role = "organizer" | "volunteer";

export interface SessionPayload {
  email: string;
  role: Role;
  name: string;
  exp: number; // unix seconds
}

export const SESSION_COOKIE = "helm_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Set AUTH_SECRET in the environment for production. The fallback keeps local
// dev working out of the box but is not secret — override it on deploy.
const SECRET = process.env.AUTH_SECRET || "helm-events-dev-secret-change-me";

const encoder = new TextEncoder();

function b64urlFromBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlEncode(text: string): string {
  return b64urlFromBytes(encoder.encode(text));
}

function b64urlDecode(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(data: string): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return b64urlFromBytes(new Uint8Array(sig));
}

export async function createSessionToken(data: {
  email: string;
  role: Role;
  name: string;
}): Promise<string> {
  const payload: SessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  const sig = await sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;

  try {
    const expectedSig = await sign(payloadB64);
    if (expectedSig !== sig) return null; // tampered / wrong secret

    const payload = JSON.parse(b64urlDecode(payloadB64)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "organizer" && payload.role !== "volunteer") return null;
    return payload;
  } catch {
    return null;
  }
}

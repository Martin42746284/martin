declare const process: { env: Record<string, string | undefined> };

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

export const config = { runtime: 'edge' };

function jsonResponse(body: Record<string, string | boolean>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isContactPayload(value: unknown): value is ContactPayload {
  if (!isRecord(value)) return false;
  const { name, email, subject, message, website } = value;
  return (
    typeof name === 'string' &&
    typeof email === 'string' &&
    typeof subject === 'string' &&
    typeof message === 'string' &&
    (website === undefined || typeof website === 'string')
  );
}

function base64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64Lines(value: string): string {
  return base64Utf8(value).match(/.{1,76}/g)?.join('\r\n') ?? '';
}

function encodedHeader(value: string): string {
  const chunks = base64Utf8(value).match(/.{1,60}/g) ?? [];
  return chunks.map((chunk) => `=?UTF-8?B?${chunk}?=`).join('\r\n ');
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (entry && entry.resetAt > now) {
    entry.count += 1;
    return entry.count > RATE_LIMIT_MAX;
  }

  if (RATE_LIMIT.size > 1000) {
    for (const [key, value] of RATE_LIMIT) {
      if (value.resetAt <= now) RATE_LIMIT.delete(key);
    }
    if (RATE_LIMIT.size > 1000) {
      const oldest = RATE_LIMIT.keys().next().value;
      if (oldest !== undefined) RATE_LIMIT.delete(oldest);
    }
  }
  RATE_LIMIT.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  return false;
}

function hasAccessToken(value: unknown): value is { access_token: string } {
  return isRecord(value) && typeof value.access_token === 'string';
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405);

  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return jsonResponse({ error: 'invalid_origin' }, 403);
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 16_000 || !request.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isContactPayload(body)) return jsonResponse({ error: 'invalid_request' }, 400);
  if (body.website?.trim()) return jsonResponse({ ok: true }, 200);

  const name = body.name.trim();
  const email = body.email.trim();
  const subject = body.subject.trim();
  const message = body.message.trim();
  if (
    name.length < 1 ||
    name.length > 100 ||
    /[\r\n]/.test(name) ||
    email.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    subject.length < 1 ||
    subject.length > 150 ||
    /[\r\n]/.test(subject) ||
    message.length < 10 ||
    message.length > 3000
  ) {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',');
  const forwardedIp = forwardedFor?.[forwardedFor.length - 1]?.trim();
  const ip = request.headers.get('x-real-ip') ?? forwardedIp ?? 'unknown';
  if (isRateLimited(ip)) return jsonResponse({ error: 'rate_limited' }, 429);

  const address = process.env.CONTACT_GMAIL_ADDRESS;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (!address || !clientId || !clientSecret || !refreshToken) {
    console.error('[api/contact] Gmail API environment variables are not configured.');
    return jsonResponse({ error: 'not_configured' }, 503);
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  }).catch((error: unknown) => {
    console.error('[api/contact] Gmail access token request failed:', error);
    return null;
  });
  if (!tokenResponse?.ok) {
    console.error('[api/contact] Gmail access token request returned an error:', tokenResponse?.status);
    return jsonResponse({ error: 'send_failed' }, 502);
  }

  const tokenBody: unknown = await tokenResponse.json().catch(() => null);
  if (!hasAccessToken(tokenBody)) {
    console.error('[api/contact] Gmail returned an invalid access token response.');
    return jsonResponse({ error: 'send_failed' }, 502);
  }

  const mimeMessage = [
    `To: ${address}`,
    `From: Martin Manampisoa <${address}>`,
    `Reply-To: ${email}`,
    `Subject: ${encodedHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Lines(`Nom : ${name}\nE-mail : ${email}\nSujet : ${subject}\n\n${message}`),
  ].join('\r\n');
  const raw = btoa(mimeMessage).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenBody.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  }).catch((error: unknown) => {
    console.error('[api/contact] Gmail message request failed:', error);
    return null;
  });
  if (!sendResponse?.ok) {
    console.error('[api/contact] Gmail message request returned an error:', sendResponse?.status);
    return jsonResponse({ error: 'send_failed' }, 502);
  }

  return jsonResponse({ ok: true }, 200);
}

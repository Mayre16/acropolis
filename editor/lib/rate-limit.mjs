/** Límite de intentos por IP/acción (anti-abuso en endpoints públicos). */

const buckets = new Map();

function nowMs() {
  return Date.now();
}

function bucketKey(scope, identity) {
  return `${scope}:${String(identity ?? "").trim().toLowerCase() || "unknown"}`;
}

export function isRateLimited(scope, identity, max, windowMs) {
  const key = bucketKey(scope, identity);
  const entry = buckets.get(key);
  if (!entry) return false;
  const now = nowMs();
  if (now - entry.windowStart > windowMs) {
    buckets.delete(key);
    return false;
  }
  return entry.failures >= max;
}

export function recordRateLimitHit(scope, identity, windowMs) {
  const key = bucketKey(scope, identity);
  const now = nowMs();
  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { failures: 1, windowStart: now });
    return;
  }
  entry.failures += 1;
}

export function clearRateLimit(scope, identity) {
  buckets.delete(bucketKey(scope, identity));
}

/**
 * Cuenta el intento actual; si ya superó el máximo, bloquea.
 * @returns {{ ok: true } | { ok: false, error: string, status: number }}
 */
export function consumeRateLimit(scope, identity, max, windowMs) {
  if (isRateLimited(scope, identity, max, windowMs)) {
    return {
      ok: false,
      error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
      status: 429,
    };
  }
  recordRateLimitHit(scope, identity, windowMs);
  return { ok: true };
}

export const RATE_LOGIN_MAX = 8;
export const RATE_LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const RATE_FORGOT_MAX = 5;
export const RATE_FORGOT_WINDOW_MS = 15 * 60 * 1000;
export const RATE_FORMS_MAX = 10;
export const RATE_FORMS_WINDOW_MS = 15 * 60 * 1000;
export const RATE_2FA_MAX = 8;
export const RATE_2FA_WINDOW_MS = 15 * 60 * 1000;

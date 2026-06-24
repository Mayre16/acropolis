/** Limita intentos fallidos de login (anti-fuerza bruta). */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

/** @type {Map<string, { failures: number, windowStart: number }>} */
const buckets = new Map();

function bucketKey(ip, username) {
  return `${ip || "unknown"}:${String(username ?? "").trim().toLowerCase()}`;
}

export function isLoginBlocked(ip, username) {
  const key = bucketKey(ip, username);
  const entry = buckets.get(key);
  if (!entry) return false;
  const now = Date.now();
  if (now - entry.windowStart > WINDOW_MS) {
    buckets.delete(key);
    return false;
  }
  return entry.failures >= MAX_FAILURES;
}

export function recordLoginFailure(ip, username) {
  const key = bucketKey(ip, username);
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    buckets.set(key, { failures: 1, windowStart: now });
    return;
  }
  entry.failures += 1;
}

export function clearLoginFailures(ip, username) {
  buckets.delete(bucketKey(ip, username));
}

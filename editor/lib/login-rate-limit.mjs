/** Limita intentos fallidos de login (anti-fuerza bruta). */
import {
  clearRateLimit,
  isRateLimited,
  RATE_LOGIN_MAX,
  RATE_LOGIN_WINDOW_MS,
  recordRateLimitHit,
} from "./rate-limit.mjs";

function loginIdentity(ip, username) {
  return `${ip || "unknown"}:${String(username ?? "").trim().toLowerCase()}`;
}

export function isLoginBlocked(ip, username) {
  return isRateLimited(
    "login",
    loginIdentity(ip, username),
    RATE_LOGIN_MAX,
    RATE_LOGIN_WINDOW_MS,
  );
}

export function recordLoginFailure(ip, username) {
  recordRateLimitHit(
    "login",
    loginIdentity(ip, username),
    RATE_LOGIN_WINDOW_MS,
  );
}

export function clearLoginFailures(ip, username) {
  clearRateLimit("login", loginIdentity(ip, username));
}

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { verifyPassword } from "./password.mjs";
import {
  AUTH_DIR,
  findUserById,
  findUserByUsername,
  updateUserTotpSecret,
} from "./auth-store.mjs";
import { totpGenerateSecret, totpUri, totpVerify } from "./totp.mjs";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "./login-rate-limit.mjs";

export const LOGIN_ERROR =
  "No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.";
const PENDING_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSIONS_FILE = path.join(AUTH_DIR, "sessions.json");

/** @type {Map<string, { userId: string, expires: number, mode: 'verify' | 'setup' }>} */
const pending = new Map();

/** @type {Map<string, { expires: number, role: string, label: string, username: string }>} */
export const sessions = new Map();

function persistSessions() {
  try {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    const data = Object.fromEntries(sessions);
    const tmp = `${SESSIONS_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    fs.renameSync(tmp, SESSIONS_FILE);
  } catch (e) {
    console.warn("No se pudieron guardar las sesiones:", e);
  }
}

function loadSessions() {
  if (!fs.existsSync(SESSIONS_FILE)) return;
  try {
    const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
    const now = Date.now();
    for (const [token, sess] of Object.entries(data)) {
      if (sess && typeof sess === "object" && sess.expires > now) {
        sessions.set(token, sess);
      }
    }
  } catch (e) {
    console.warn("No se pudieron cargar las sesiones:", e);
  }
}

loadSessions();

function cleanExpired(map) {
  const now = Date.now();
  for (const [key, value] of map) {
    if (value.expires < now) map.delete(key);
  }
}

function createPending(userId, mode) {
  cleanExpired(pending);
  const token = crypto.randomUUID();
  pending.set(token, { userId, expires: Date.now() + PENDING_TTL_MS, mode });
  return token;
}

function getPending(token) {
  cleanExpired(pending);
  const entry = pending.get(token);
  if (!entry || entry.expires < Date.now()) {
    pending.delete(token);
    return null;
  }
  return entry;
}

export function createSession(user) {
  const token = crypto.randomUUID();
  sessions.set(token, {
    expires: Date.now() + SESSION_TTL_MS,
    role: user.role,
    label: user.label,
    username: user.username,
  });
  persistSessions();
  return {
    ok: true,
    token,
    expiresIn: SESSION_TTL_MS / 1000,
    role: user.role,
    label: user.label,
  };
}

export function getSession(token) {
  const sess = sessions.get(token);
  if (!sess || sess.expires < Date.now()) {
    if (sess) {
      sessions.delete(token);
      persistSessions();
    }
    return null;
  }
  return sess;
}

export function destroySession(token) {
  if (sessions.delete(token)) persistSessions();
}

export function loginWithPassword(username, password, clientIp = "") {
  const normalized = String(username ?? "").trim().toLowerCase();
  if (isLoginBlocked(clientIp, normalized)) {
    return {
      ok: false,
      error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
      status: 429,
    };
  }
  const user = findUserByUsername(normalized);
  if (user?.disabled) {
    recordLoginFailure(clientIp, normalized);
    return { ok: false, error: LOGIN_ERROR, status: 401 };
  }
  const passwordOk = user && verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    recordLoginFailure(clientIp, normalized);
    return { ok: false, error: LOGIN_ERROR, status: 401 };
  }
  clearLoginFailures(clientIp, normalized);
  // 2FA opcional: sin TOTP configurado, entrar directo
  if (!user.totpSecret) {
    return createSession(user);
  }
  const pendingToken = createPending(user.id, "verify");
  return { ok: true, need_2fa: true, pendingToken };
}

function resolveUserIdFor2faSetup(pendingToken, sessionToken) {
  if (sessionToken) {
    const sess = getSession(sessionToken);
    if (sess?.username) {
      const user = findUserByUsername(sess.username);
      return user?.id ?? null;
    }
  }
  if (pendingToken) {
    const entry = getPending(pendingToken);
    if (entry) return entry.userId;
  }
  return null;
}

export function setupTwoFactor(pendingToken, sessionToken = "") {
  const userId = resolveUserIdFor2faSetup(pendingToken, sessionToken);
  if (!userId) {
    return { ok: false, error: "Sesión inválida. Inicia sesión de nuevo.", status: 401 };
  }
  const user = findUserById(userId);
  if (!user) {
    return { ok: false, error: "Sesión inválida. Inicia sesión de nuevo.", status: 401 };
  }
  const secret = totpGenerateSecret();
  updateUserTotpSecret(user.id, secret);
  const uri = totpUri(secret, `${user.label} (${user.username})`, "Acropolis CMS");
  return { ok: true, secret, uri };
}

export function verifyTwoFactor(pendingToken, code) {
  const entry = getPending(pendingToken);
  if (!entry || entry.mode !== "verify") {
    return { ok: false, error: "Sesión inválida. Inicia sesión de nuevo.", status: 401 };
  }
  const user = findUserById(entry.userId);
  if (!user?.totpSecret) {
    return { ok: false, error: "Configura 2FA primero", status: 400 };
  }
  const digits = String(code ?? "").replace(/\D/g, "");
  if (!totpVerify(user.totpSecret, digits)) {
    return { ok: false, error: "Código incorrecto", status: 401 };
  }
  pending.delete(pendingToken);
  const session = createSession(user);
  return { ok: true, ...session };
}

export function confirmTwoFactor(pendingToken, code, sessionToken = "") {
  const digits = String(code ?? "").replace(/\D/g, "");
  let userId = resolveUserIdFor2faSetup(pendingToken, sessionToken);
  if (!userId && pendingToken) {
    const entry = getPending(pendingToken);
    userId = entry?.userId ?? null;
  }
  if (!userId) {
    return { ok: false, error: "Sesión inválida. Inicia sesión de nuevo.", status: 401 };
  }
  const user = findUserById(userId);
  if (!user?.totpSecret) {
    return { ok: false, error: "Configura 2FA primero", status: 400 };
  }
  if (!totpVerify(user.totpSecret, digits)) {
    return { ok: false, error: "Código incorrecto", status: 401 };
  }
  pending.delete(pendingToken);
  if (sessionToken && getSession(sessionToken)) {
    return { ok: true, message: "Verificación en dos pasos activada" };
  }
  const session = createSession(user);
  return { ok: true, ...session };
}

export function sessionTotpEnabled(sessionToken) {
  const sess = getSession(sessionToken);
  if (!sess?.username) return false;
  const user = findUserByUsername(sess.username);
  return !!(user?.totpSecret);
}

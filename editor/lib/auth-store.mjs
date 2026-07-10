import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const AUTH_DIR = path.join(ROOT, "data", "auth");
const USERS_FILE = path.join(AUTH_DIR, "users.json");

function readStore() {
  if (!fs.existsSync(USERS_FILE)) return { users: [] };
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  const data = JSON.parse(raw);
  return { users: Array.isArray(data.users) ? data.users : [] };
}

function writeStore(data) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const tmp = `${USERS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, USERS_FILE);
}

export function listUsers() {
  return readStore().users;
}

export function findUserByUsername(username) {
  const normalized = String(username ?? "").trim().toLowerCase();
  if (!normalized) return null;
  return readStore().users.find((u) => u.username === normalized) ?? null;
}

export function findUserById(id) {
  return readStore().users.find((u) => u.id === id) ?? null;
}

export function userInvitePending(user) {
  if (!user) return false;
  if (user.invitePending === true) return true;
  return !user.passwordHash;
}

const PERMISSION_CATALOG = (() => {
  const tabs = [
    "home", "sedes", "cursos", "diplomado", "filosofia",
    "voluntariado", "eventos", "agenda", "articulos", "medios", "cultura",
    "viajesLocales", "viajesInternacionales", "esfera", "quienesSomos",
    "relaciones", "contenido", "archivos", "estadisticas",
    "civisHome", "civisTalleres", "civisQuienesSomos", "civisSalones",
    "circuloHome",
    "editorialHome", "editorialLibros", "editorialDigitales", "editorialRevistas",
    "editorialRegalos", "editorialDonde", "editorialQuienesSomos",
  ];
  return [
    "site:acropolis", "site:civis", "site:editorial", "site:circulodeamigos",
    "admin:users", "admin:smtp",
    ...tabs.map((t) => `tab:${t}`),
  ];
})();

const PERMISSION_SET = new Set(PERMISSION_CATALOG);

export function sanitizePermissions(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const key = item.trim();
    if (!PERMISSION_SET.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export function defaultPermissionsForRole(role) {
  const map = {
    admin: [...PERMISSION_CATALOG],
    editor: [],
    voluntariado: ["site:acropolis", "tab:voluntariado", "tab:agenda"],
    esfera: [
      "site:acropolis", "tab:sedes", "tab:esfera", "tab:agenda",
      "tab:archivos", "tab:home",
    ],
    editorial: [
      "site:editorial",
      "tab:editorialHome", "tab:editorialLibros", "tab:editorialDigitales",
      "tab:editorialRevistas", "tab:editorialRegalos", "tab:editorialDonde",
      "tab:editorialQuienesSomos", "tab:archivos", "tab:estadisticas",
    ],
    viajes: [
      "site:acropolis", "tab:viajesLocales", "tab:viajesInternacionales",
    ],
    filosofia: [
      "site:acropolis", "tab:diplomado", "tab:filosofia", "tab:eventos",
      "tab:contenido", "tab:agenda",
    ],
  };
  return map[role] ? [...map[role]] : [];
}

export function effectivePermissions(user) {
  if (!user) return [];
  if (user.role === "admin") return [...PERMISSION_CATALOG];
  const custom = sanitizePermissions(user.permissions);
  if (custom.length) return custom;
  return defaultPermissionsForRole(user.role);
}

export function publicUserView(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email || user.username,
    role: user.role,
    label: user.label,
    permissions: effectivePermissions(user),
    totpEnabled: !!user.totpSecret,
    disabled: !!user.disabled,
    invitePending: userInvitePending(user),
    createdAt: user.createdAt ?? null,
  };
}

export function createUser({
  email,
  passwordHash = null,
  role,
  label,
  permissions,
  invitePending = false,
}) {
  const username = String(email).trim().toLowerCase();
  const store = readStore();
  const user = {
    id: crypto.randomUUID(),
    username,
    email: username,
    passwordHash,
    role,
    label,
    permissions: Array.isArray(permissions)
      ? sanitizePermissions(permissions)
      : defaultPermissionsForRole(role),
    totpSecret: null,
    disabled: false,
    invitePending: invitePending || !passwordHash,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  writeStore(store);
  return user;
}

export function updateUserProfile(userId, patch) {
  const store = readStore();
  const idx = store.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  store.users[idx] = { ...store.users[idx], ...patch };
  writeStore(store);
  return store.users[idx];
}

export function setUserPassword(userId, passwordHash) {
  return updateUserProfile(userId, { passwordHash, invitePending: false });
}

export function setUserDisabled(userId, disabled) {
  return updateUserProfile(userId, { disabled: !!disabled });
}

export function clearUserTotp(userId) {
  return updateUserProfile(userId, { totpSecret: null });
}

export function deleteUser(userId) {
  const store = readStore();
  const next = store.users.filter((u) => u.id !== userId);
  if (next.length === store.users.length) return false;
  writeStore({ users: next });
  return true;
}

export function updateUserTotpSecret(userId, secret) {
  const store = readStore();
  const idx = store.users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  store.users[idx] = { ...store.users[idx], totpSecret: secret || null };
  writeStore(store);
  return true;
}

export function upsertUsers(users) {
  const store = readStore();
  const byUsername = new Map(store.users.map((u) => [u.username, u]));
  for (const user of users) {
    const username = String(user.username).trim().toLowerCase();
    const existing = byUsername.get(username);
    if (existing) {
      byUsername.set(username, { ...existing, ...user, username });
    } else {
      byUsername.set(username, {
        id: user.id || crypto.randomUUID(),
        username,
        email: user.email || username,
        passwordHash: user.passwordHash,
        role: user.role,
        label: user.label,
        totpSecret: user.totpSecret ?? null,
        disabled: user.disabled ?? false,
        createdAt: user.createdAt ?? new Date().toISOString(),
      });
    }
  }
  writeStore({ users: [...byUsername.values()] });
}

export function usersFileExists() {
  return fs.existsSync(USERS_FILE);
}

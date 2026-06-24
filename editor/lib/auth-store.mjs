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

export function publicUserView(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email || user.username,
    role: user.role,
    label: user.label,
    totpEnabled: !!user.totpSecret,
    disabled: !!user.disabled,
    createdAt: user.createdAt ?? null,
  };
}

export function createUser({ email, passwordHash, role, label }) {
  const username = String(email).trim().toLowerCase();
  const store = readStore();
  const user = {
    id: crypto.randomUUID(),
    username,
    email: username,
    passwordHash,
    role,
    label,
    totpSecret: null,
    disabled: false,
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
  return updateUserProfile(userId, { passwordHash });
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

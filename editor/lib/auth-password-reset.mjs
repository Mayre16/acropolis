import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { AUTH_DIR } from "./auth-store.mjs";
import { editorPublicUrl } from "./auth-invites.mjs";

const RESETS_FILE = path.join(AUTH_DIR, "password-resets.json");
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

function readResets() {
  if (!fs.existsSync(RESETS_FILE)) return { resets: [] };
  const data = JSON.parse(fs.readFileSync(RESETS_FILE, "utf8"));
  return { resets: Array.isArray(data.resets) ? data.resets : [] };
}

function writeResets(data) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const tmp = `${RESETS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, RESETS_FILE);
}

function isExpired(entry) {
  const expiresAt = Date.parse(entry.expiresAt ?? "");
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}

export function revokePasswordResetsForUser(userId) {
  const store = readResets();
  const next = store.resets.filter((r) => r.userId !== userId || r.usedAt);
  if (next.length === store.resets.length) return;
  writeResets({ resets: next });
}

export function createPasswordReset({ userId, email }) {
  revokePasswordResetsForUser(userId);
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const entry = {
    token,
    userId,
    email: String(email).trim().toLowerCase(),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RESET_TTL_MS).toISOString(),
    usedAt: null,
  };
  const store = readResets();
  store.resets.push(entry);
  writeResets(store);
  return entry;
}

export function findValidPasswordReset(token) {
  const normalized = String(token ?? "").trim();
  if (!normalized) return null;
  const store = readResets();
  const entry = store.resets.find((r) => r.token === normalized && !r.usedAt);
  if (!entry || isExpired(entry)) return null;
  return entry;
}

export function markPasswordResetUsed(token) {
  const store = readResets();
  const idx = store.resets.findIndex((r) => r.token === token);
  if (idx === -1) return false;
  store.resets[idx] = {
    ...store.resets[idx],
    usedAt: new Date().toISOString(),
  };
  writeResets(store);
  return true;
}

export function buildPasswordResetUrl(token) {
  return `${editorPublicUrl()}/restablecer/?token=${encodeURIComponent(token)}`;
}

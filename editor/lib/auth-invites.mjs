import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { AUTH_DIR } from "./auth-store.mjs";

const INVITES_FILE = path.join(AUTH_DIR, "invites.json");
const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

function readInvites() {
  if (!fs.existsSync(INVITES_FILE)) return { invites: [] };
  const data = JSON.parse(fs.readFileSync(INVITES_FILE, "utf8"));
  return { invites: Array.isArray(data.invites) ? data.invites : [] };
}

function writeInvites(data) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const tmp = `${INVITES_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, INVITES_FILE);
}

function isExpired(invite) {
  const expiresAt = Date.parse(invite.expiresAt ?? "");
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}

export function revokeInvitesForUser(userId) {
  const store = readInvites();
  const next = store.invites.filter((i) => i.userId !== userId || i.usedAt);
  if (next.length === store.invites.length) return;
  writeInvites({ invites: next });
}

export function createInvite({ userId, email }) {
  revokeInvitesForUser(userId);
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const invite = {
    token,
    userId,
    email: String(email).trim().toLowerCase(),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + INVITE_TTL_MS).toISOString(),
    usedAt: null,
  };
  const store = readInvites();
  store.invites.push(invite);
  writeInvites(store);
  return invite;
}

export function findValidInvite(token) {
  const normalized = String(token ?? "").trim();
  if (!normalized) return null;
  const store = readInvites();
  const invite = store.invites.find((i) => i.token === normalized && !i.usedAt);
  if (!invite || isExpired(invite)) return null;
  return invite;
}

export function markInviteUsed(token) {
  const store = readInvites();
  const idx = store.invites.findIndex((i) => i.token === token);
  if (idx === -1) return false;
  store.invites[idx] = {
    ...store.invites[idx],
    usedAt: new Date().toISOString(),
  };
  writeInvites(store);
  return true;
}

export function editorPublicUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.CMS_EDITOR_URL?.trim() ||
    "https://editor.acropolis.adesa.com.do"
  ).replace(/\/$/, "");
}

export function buildInviteUrl(token) {
  return `${editorPublicUrl()}/invitacion/?token=${encodeURIComponent(token)}`;
}

"use client";

import {
  effectivePermissions,
  type EditorPermission,
} from "@/lib/editor-permissions";

/** Solo el token opaco vive en localStorage. Rol y permisos van en memoria. */
const TOKEN_KEY = "acropolis_cms_token";

/** Claves antiguas en texto plano — se eliminan al cargar. */
const LEGACY_ROLE_KEY = "acropolis_cms_role";
const LEGACY_LABEL_KEY = "acropolis_cms_label";
const LEGACY_PERMS_KEY = "acropolis_cms_permissions";

export type EditorSession = {
  token: string;
  role: string;
  label: string;
  username?: string;
  permissions?: string[];
};

type MemoryClaims = {
  role: string;
  label: string;
  username: string;
  permissions: EditorPermission[];
};

let memory: MemoryClaims | null = null;

function purgeLegacyStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_ROLE_KEY);
  localStorage.removeItem(LEGACY_LABEL_KEY);
  localStorage.removeItem(LEGACY_PERMS_KEY);
}

if (typeof window !== "undefined") {
  purgeLegacyStorage();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Rol en memoria (servidor). Vacío hasta sync /me — nunca asume admin. */
export function getEditorRole(): string {
  return memory?.role ?? "";
}

export function getEditorLabel(): string {
  return memory?.label ?? "Editor";
}

export function getEditorUsername(): string {
  return memory?.username ?? "";
}

export function getEditorPermissions(): EditorPermission[] {
  if (!memory) return [];
  return effectivePermissions(memory.role, memory.permissions);
}

export function setSession({
  token,
  role,
  label,
  username,
  permissions,
}: EditorSession) {
  localStorage.setItem(TOKEN_KEY, token);
  purgeLegacyStorage();
  const perms = effectivePermissions(role, permissions);
  memory = {
    role,
    label: label || "Editor",
    username: username ?? memory?.username ?? "",
    permissions: perms,
  };
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  purgeLegacyStorage();
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  purgeLegacyStorage();
  memory = null;
}

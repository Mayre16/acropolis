"use client";

import {
  defaultPermissionsForRole,
  effectivePermissions,
  type EditorPermission,
} from "@/lib/editor-permissions";

const TOKEN_KEY = "acropolis_cms_token";
const ROLE_KEY = "acropolis_cms_role";
const LABEL_KEY = "acropolis_cms_label";
const PERMS_KEY = "acropolis_cms_permissions";

export type EditorSession = {
  token: string;
  role: string;
  label: string;
  permissions?: string[];
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getEditorRole(): string {
  if (typeof window === "undefined") return "admin";
  return localStorage.getItem(ROLE_KEY) ?? "admin";
}

export function getEditorLabel(): string {
  if (typeof window === "undefined") return "Editor";
  return localStorage.getItem(LABEL_KEY) ?? "Editor";
}

export function getEditorPermissions(): EditorPermission[] {
  if (typeof window === "undefined") return defaultPermissionsForRole("admin");
  const role = getEditorRole();
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return effectivePermissions(role, Array.isArray(parsed) ? parsed : []);
  } catch {
    return effectivePermissions(role, []);
  }
}

export function setSession({ token, role, label, permissions }: EditorSession) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(LABEL_KEY, label);
  const perms = effectivePermissions(role, permissions);
  localStorage.setItem(PERMS_KEY, JSON.stringify(perms));
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(LABEL_KEY);
  localStorage.removeItem(PERMS_KEY);
}

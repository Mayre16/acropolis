"use client";

import { fetchAuthMe, type AuthMe } from "@/lib/api";
import { setSession } from "@/lib/auth-storage";

/** Carga rol/permisos desde el servidor (fuente de verdad) a memoria. */
export async function syncEditorSession(token: string): Promise<AuthMe | null> {
  const me = await fetchAuthMe(token);
  if (!me?.ok || !me.role) return null;
  setSession({
    token,
    role: me.role,
    label: me.label || "Editor",
    username: me.username || "",
    permissions: Array.isArray(me.permissions) ? me.permissions : [],
  });
  return me;
}

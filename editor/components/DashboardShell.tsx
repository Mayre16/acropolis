"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/lib/api";
import { syncEditorSession } from "@/lib/sync-editor-session";
import {
  clearToken,
  getEditorLabel,
  getEditorRole,
  getToken,
} from "@/lib/auth-storage";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { DashboardAdminBar } from "@/components/DashboardAdminBar";
import { TwoFactorReminderModal } from "@/components/TwoFactorReminderModal";
import type { EditorRole } from "@/lib/editor-roles";
import {
  canAccessSmtpAdmin,
  canAccessUsersAdmin,
} from "@/lib/editor-permissions";

type DashboardShellProps = {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  /** Acceso a panel de usuarios o SMTP (además de admin). */
  requireAdmin?: boolean | "users" | "smtp";
};

export function DashboardShell({
  children,
  title,
  backHref = "/dashboard/",
  requireAdmin = false,
}: DashboardShellProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<EditorRole>("editor");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [editorLabel, setEditorLabel] = useState("Editor");
  const [totpEnabled, setTotpEnabled] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login/");
      return;
    }
    checkAuth(token).then(async (result) => {
      if (result === "invalid") {
        clearToken();
        router.replace("/login/");
        return;
      }
      const me = await syncEditorSession(token);
      if (!me) {
        if (result === "offline") {
          setRole((getEditorRole() as EditorRole) || "editor");
          setEditorLabel(getEditorLabel());
          setReady(true);
          return;
        }
        clearToken();
        router.replace("/login/");
        return;
      }
      const currentRole = me.role;
      const permissions = Array.isArray(me.permissions) ? me.permissions : [];
      setRole(currentRole as EditorRole);
      setPermissions(permissions);
      setEditorLabel(me.label || "Editor");
      setTotpEnabled(!!me.totpEnabled);
      if (requireAdmin) {
        const need =
          requireAdmin === "smtp"
            ? canAccessSmtpAdmin(currentRole, permissions)
            : canAccessUsersAdmin(currentRole, permissions);
        if (!need) {
          router.replace("/dashboard/");
          return;
        }
      }
      setReady(true);
    });
  }, [router, requireAdmin]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando…
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6">
      <TwoFactorReminderModal
        totpEnabled={totpEnabled}
        onEnabled={() => setTotpEnabled(true)}
      />
      <header className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CmsBrandHeader
            compact
            subtitle={`Panel de edición · ${editorLabel}`}
          />
          <DashboardAdminBar
            role={role}
            permissions={permissions}
            totpEnabled={totpEnabled}
          />
        </div>
        {title ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-bold text-brand-ink">{title}</h1>
            <Link
              href={backHref}
              className="text-sm text-slate-600 hover:text-brand-ink hover:underline"
            >
              ← Volver al panel
            </Link>
          </div>
        ) : null}
      </header>
      <div className="mt-6">{children}</div>
    </div>
  );
}

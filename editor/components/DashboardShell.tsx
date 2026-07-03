"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/lib/api";
import { clearToken, getEditorLabel, getEditorRole, getToken } from "@/lib/auth-storage";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { DashboardAdminBar } from "@/components/DashboardAdminBar";
import type { EditorRole } from "@/lib/editor-roles";

type DashboardShellProps = {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  requireAdmin?: boolean;
};

export function DashboardShell({
  children,
  title,
  backHref = "/dashboard/",
  requireAdmin = false,
}: DashboardShellProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<EditorRole>("admin");
  const [editorLabel, setEditorLabel] = useState("Editor");

  useEffect(() => {
    setRole(getEditorRole() as EditorRole);
    setEditorLabel(getEditorLabel());
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login/");
      return;
    }
    checkAuth(token).then((result) => {
      if (result === "invalid") {
        clearToken();
        router.replace("/login/");
        return;
      }
      const currentRole = getEditorRole();
      if (requireAdmin && currentRole !== "admin") {
        router.replace("/dashboard/");
        return;
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
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <header className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <CmsBrandHeader subtitle={`Panel de edición · ${editorLabel}`} />
          <DashboardAdminBar role={role} />
        </div>
        {title ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={backHref}
              className="text-sm text-slate-600 hover:text-brand-ink hover:underline"
            >
              ← Volver al panel
            </Link>
            <h1 className="text-lg font-bold text-brand-ink">{title}</h1>
          </div>
        ) : null}
      </header>
      <div className="mt-6">{children}</div>
    </div>
  );
}

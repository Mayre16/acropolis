"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/lib/api";
import { syncEditorSession } from "@/lib/sync-editor-session";
import {
  clearToken,
  getEditorLabel,
  getEditorPermissions,
  getEditorRole,
  getToken,
} from "@/lib/auth-storage";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { CmsTabNav } from "@/components/CmsTabNav";
import { DashboardAdminBar } from "@/components/DashboardAdminBar";
import { DashboardSiteJumpNav } from "@/components/DashboardSiteJumpNav";
import { TwoFactorReminderModal } from "@/components/TwoFactorReminderModal";
import { SITE_LABELS, type SiteId } from "@/lib/content-types";
import {
  DASHBOARD_SITES,
  dashboardSiteAnchor,
  type DashboardSiteKey,
} from "@/lib/dashboard-sites";
import type { EditorRole } from "@/lib/editor-roles";
import {
  defaultTabForPermissions,
  sitesForPermissions,
} from "@/lib/editor-permissions";

function canEditSite(
  role: EditorRole,
  permissions: string[],
  site: DashboardSiteKey,
): boolean {
  return sitesForPermissions(permissions, role).includes(site);
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [authError, setAuthError] = useState("");
  const [role, setRole] = useState<EditorRole>("editor");
  const [editorLabel, setEditorLabel] = useState("Editor");
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login/");
      return;
    }
    checkAuth(token).then(async (result) => {
      if (result === "offline") {
        setAuthError(
          "No se pudo conectar con el servidor del editor (puerto 3401). Inicia npm run dev:editor-api y recarga.",
        );
        setRole((getEditorRole() as EditorRole) || "editor");
        setEditorLabel(getEditorLabel());
        setPermissions(getEditorPermissions());
        setReady(true);
        return;
      }
      if (result === "invalid") {
        clearToken();
        router.replace("/login/");
        return;
      }
      const me = await syncEditorSession(token);
      if (!me) {
        clearToken();
        router.replace("/login/");
        return;
      }
      setTotpEnabled(!!me.totpEnabled);
      setRole(me.role as EditorRole);
      setPermissions(Array.isArray(me.permissions) ? me.permissions : []);
      setEditorLabel(me.label || "Editor");
      setReady(true);
    });
  }, [router]);

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
      </header>

      <div className="mt-6">
        <p className="text-sm text-slate-600">
          {sitesForPermissions(permissions, role).length === 1
            ? "Estas son las secciones que puedes editar con tu acceso."
            : "Elige un sitio y la página que quieres editar. Solo ves los sitios a los que tienes acceso."}
        </p>
        {authError ? (
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {authError}
          </p>
        ) : null}
        <DashboardSiteJumpNav role={role} permissions={permissions} />
      </div>

      <div className="mt-8 space-y-6 scroll-mt-6">
        {DASHBOARD_SITES.filter((site) =>
          canEditSite(role, permissions, site.id),
        ).map((site) => {
          const firstTab = defaultTabForPermissions(
            site.id,
            permissions,
            role,
          );

          return (
            <section
              key={site.id}
              id={dashboardSiteAnchor(site.id)}
              className={`scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${site.accentClass}`}
            >
              <div
                className={`flex flex-wrap items-start justify-between gap-3 border-b-2 pb-4 ${site.headerLineClass}`}
              >
                <div>
                  <h2 className="text-xl font-bold text-brand-ink">
                    {SITE_LABELS[site.id]}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{site.subtitle}</p>
                </div>
                {firstTab ? (
                  <Link
                    href={`/edit/${site.id}/?tab=${firstTab}`}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${site.ctaClass}`}
                  >
                    Abrir editor
                  </Link>
                ) : null}
              </div>

              <div className="mt-4">
                <CmsTabNav
                  site={site.id}
                  role={role}
                  permissions={permissions}
                  mode="links"
                />
              </div>
            </section>
          );
        })}
        {sitesForPermissions(permissions, role).length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
            Tu perfil no tiene acceso a ningún sitio. Contacta al administrador
            si lo necesitas.
          </p>
        ) : null}
      </div>

      {role === "admin" ? (
        <section className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 border-t-4 border-t-violet-600 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-violet-600 pb-4">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">Estadísticas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Registros de visitas
              </p>
            </div>
            <Link
              href="/analytics/acropolis/"
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
            >
              Ver estadísticas
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

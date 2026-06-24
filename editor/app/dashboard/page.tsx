"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, fetchAuthMe } from "@/lib/api";
import { getToken, clearToken, getEditorRole, getEditorLabel } from "@/lib/auth-storage";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { CmsTabNav } from "@/components/CmsTabNav";
import { DashboardSiteJumpNav } from "@/components/DashboardSiteJumpNav";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import { SmtpSettingsPanel } from "@/components/SmtpSettingsPanel";
import { UsersAdminPanel } from "@/components/UsersAdminPanel";
import { SITE_LABELS, type SiteId } from "@/lib/content-types";
import {
  DASHBOARD_SITES,
  dashboardSiteAnchor,
  type DashboardSiteKey,
} from "@/lib/dashboard-sites";
import { defaultTabForRole, type EditorRole } from "@/lib/editor-roles";

function sitesForRole(role: EditorRole): SiteId[] {
  if (role === "admin") {
    return ["acropolis", "civis", "editorial"];
  }
  if (role === "editorial") {
    return ["editorial"];
  }
  return ["acropolis"];
}

function canEditSite(role: EditorRole, site: DashboardSiteKey): boolean {
  return sitesForRole(role).includes(site);
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [authError, setAuthError] = useState("");
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
    checkAuth(token).then(async (result) => {
      if (result === "offline") {
        setAuthError(
          "No se pudo conectar con el servidor del editor (puerto 3401). Inicia npm run dev:editor-api y recarga.",
        );
        setReady(true);
        return;
      }
      if (result === "invalid") {
        clearToken();
        router.replace("/login/");
        return;
      }
      const me = await fetchAuthMe(token);
      setTotpEnabled(!!me?.totpEnabled);
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
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <header className="relative border-b border-slate-200 pb-8">
        <button
          type="button"
          onClick={() => {
            clearToken();
            router.push("/login/");
          }}
          className="absolute right-0 top-0 text-sm text-slate-600 hover:underline"
        >
          Salir
        </button>
        <CmsBrandHeader subtitle={`Panel de edición · ${editorLabel}`} />
      </header>

      <div className="mt-6">
        <p className="text-sm text-slate-600">
          Elige un sitio y la página que quieres editar. Las opciones están agrupadas
          por sección para que encuentres todo más rápido.
        </p>
        {authError ? (
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {authError}
          </p>
        ) : null}
        <DashboardSiteJumpNav />
      </div>

      <div className="mt-8 space-y-6 scroll-mt-6">
        {DASHBOARD_SITES.map((site) => {
          const hasAccess = canEditSite(role, site.id);
          const firstTab = hasAccess ? defaultTabForRole(site.id, role) : null;

          return (
            <section
              key={site.id}
              id={dashboardSiteAnchor(site.id)}
              className={`scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${site.accentClass}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
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

              {hasAccess ? (
                <div className="mt-4">
                  <CmsTabNav site={site.id} role={role} mode="links" />
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Tu perfil no tiene permiso para editar este sitio. Contacta al
                  administrador si lo necesitas.
                </p>
              )}
            </section>
          );
        })}
      </div>

      <TwoFactorSetup enabled={totpEnabled} />
      {role === "admin" ? (
        <>
          <UsersAdminPanel />
          <SmtpSettingsPanel />
        </>
      ) : null}
    </div>
  );
}

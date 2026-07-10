"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { checkAuth } from "@/lib/api";
import type { AnalyticsSiteId } from "@/lib/analytics-types";
import { clearToken, getEditorRole, getToken } from "@/lib/auth-storage";
import type { EditorRole } from "@/lib/editor-roles";

const VALID_SITES = new Set<AnalyticsSiteId>([
  "acropolis",
  "civis",
  "editorial",
  "circulodeamigos",
  "biblioteca",
]);

function asAnalyticsSite(raw: string): AnalyticsSiteId {
  return VALID_SITES.has(raw as AnalyticsSiteId)
    ? (raw as AnalyticsSiteId)
    : "acropolis";
}

export default function AnalyticsSitePage() {
  const params = useParams();
  const router = useRouter();
  const siteFromUrl = String(params.site ?? "");
  const [selectedSite, setSelectedSite] = useState<AnalyticsSiteId>(() =>
    asAnalyticsSite(siteFromUrl),
  );
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<EditorRole>("admin");

  useEffect(() => {
    setRole(getEditorRole() as EditorRole);
  }, []);

  useEffect(() => {
    setSelectedSite(asAnalyticsSite(siteFromUrl));
  }, [siteFromUrl]);

  useEffect(() => {
    if (!VALID_SITES.has(siteFromUrl as AnalyticsSiteId)) {
      router.replace("/dashboard/");
      return;
    }
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
      if (role !== "admin") {
        router.replace("/dashboard/");
        return;
      }
      setReady(true);
    });
  }, [router, role, siteFromUrl]);

  if (!VALID_SITES.has(siteFromUrl as AnalyticsSiteId) || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando estadísticas…
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-6">
          <CmsBrandHeader compact />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-ink">Estadísticas</h1>
            <p className="mt-0.5 text-sm text-slate-600">Registros de visitas</p>
          </div>
          <Link
            href="/dashboard/"
            className="text-sm text-slate-600 hover:text-brand-ink hover:underline"
          >
            ← Volver a sitios
          </Link>
        </div>
      </header>

      <main className="mt-8">
        <AnalyticsPanel site={selectedSite} onSiteChange={setSelectedSite} />
      </main>
    </div>
  );
}

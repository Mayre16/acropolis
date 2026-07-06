"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { CmsBrandHeader } from "@/components/CmsBrandHeader";
import { checkAuth } from "@/lib/api";
import {
  ANALYTICS_SITE_LABELS,
  type AnalyticsSiteId,
} from "@/lib/analytics-types";
import { clearToken, getEditorLabel, getEditorRole, getToken } from "@/lib/auth-storage";
import type { EditorRole } from "@/lib/editor-roles";

const VALID_SITES = new Set<AnalyticsSiteId>([
  "acropolis",
  "civis",
  "editorial",
  "biblioteca",
]);

export default function AnalyticsSitePage() {
  const params = useParams();
  const router = useRouter();
  const site = String(params.site ?? "") as AnalyticsSiteId;
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<EditorRole>("admin");
  const [editorLabel, setEditorLabel] = useState("Editor");

  useEffect(() => {
    setRole(getEditorRole() as EditorRole);
    setEditorLabel(getEditorLabel());
  }, []);

  useEffect(() => {
    if (!VALID_SITES.has(site)) {
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
      if (role !== "admin" && site === "biblioteca") {
        router.replace("/dashboard/");
        return;
      }
      setReady(true);
    });
  }, [router, role, site]);

  if (!VALID_SITES.has(site) || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando estadísticas…
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="border-b border-slate-200 pb-6">
        <Link href="/dashboard/" className="text-sm text-brand-teal hover:underline">
          ← Volver a sitios
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <CmsBrandHeader compact />
          <div>
            <h1 className="text-xl font-bold text-brand-ink">
              {ANALYTICS_SITE_LABELS[site]}
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">
              {editorLabel}
              {role !== "admin" ? " — accesos de tu área" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="mt-8">
        <AnalyticsPanel site={site} />
      </main>
    </div>
  );
}

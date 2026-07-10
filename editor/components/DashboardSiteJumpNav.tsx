"use client";

import Link from "next/link";
import {
  DASHBOARD_SITES,
  dashboardSiteAnchor,
  type DashboardSiteKey,
} from "@/lib/dashboard-sites";
import type { EditorRole } from "@/lib/editor-roles";
import { sitesForPermissions } from "@/lib/editor-permissions";

function scrollToSite(id: DashboardSiteKey) {
  const el = document.getElementById(dashboardSiteAnchor(id));
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type Props = {
  role: EditorRole;
  permissions: string[];
};

export function DashboardSiteJumpNav({ role, permissions }: Props) {
  const allowed = new Set(sitesForPermissions(permissions, role));
  const sites = DASHBOARD_SITES.filter((site) => allowed.has(site.id));
  const showStats = role === "admin";

  if (sites.length <= 1 && !showStats) return null;

  return (
    <nav
      aria-label="Ir a un sitio"
      className="mt-4 flex flex-wrap gap-2 sm:gap-3"
    >
      {sites.map((site) => (
        <button
          key={site.id}
          type="button"
          onClick={() => scrollToSite(site.id)}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${site.buttonClass}`}
        >
          {site.label}
        </button>
      ))}
      {showStats ? (
        <Link
          href="/analytics/acropolis/"
          className="rounded-full bg-violet-700 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-violet-800"
        >
          Estadísticas
        </Link>
      ) : null}
    </nav>
  );
}

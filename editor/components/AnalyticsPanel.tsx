"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAnalyticsSummary } from "@/lib/api";
import {
  ANALYTICS_SITE_LABELS,
  type AnalyticsSiteId,
  type AnalyticsSummary,
} from "@/lib/analytics-types";
import { getToken } from "@/lib/auth-storage";

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function ChangeBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-xs text-slate-500">sin cambio</span>;
  }
  const up = value > 0;
  return (
    <span
      className={`text-xs font-semibold ${up ? "text-emerald-700" : "text-rose-700"}`}
    >
      {up ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

function MetricCard({
  label,
  value,
  change,
  hint,
}: {
  label: string;
  value: string | number;
  change?: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-brand-ink">{value}</p>
      {typeof change === "number" ? (
        <div className="mt-1">
          <ChangeBadge value={change} />
        </div>
      ) : null}
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function DailyChart({
  daily,
}: {
  daily: NonNullable<AnalyticsSummary["daily"]>;
}) {
  const max = Math.max(1, ...daily.map((d) => Math.max(d.views, d.visitors)));

  if (daily.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
        Aún no hay visitas registradas en este periodo.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-brand-ink">Vistas y visitantes</h3>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            Vistas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700" />
            Visitantes
          </span>
        </div>
      </div>
      <div className="flex h-52 items-end gap-1 overflow-x-auto pb-2">
        {daily.map((point) => {
          const viewsH = Math.round((point.views / max) * 100);
          const visitorsH = Math.round((point.visitors / max) * 100);
          const day = point.date.slice(8, 10);
          return (
            <div
              key={point.date}
              className="group flex min-w-[28px] flex-1 flex-col items-center"
              title={`${point.date}: ${point.views} vistas, ${point.visitors} visitantes`}
            >
              <div className="relative flex h-40 w-full items-end justify-center gap-0.5">
                <div
                  className="w-2 rounded-t bg-emerald-400 transition-opacity group-hover:opacity-80"
                  style={{ height: `${Math.max(viewsH, point.views ? 4 : 0)}%` }}
                />
                <div
                  className="w-2 rounded-t bg-emerald-700 transition-opacity group-hover:opacity-80"
                  style={{
                    height: `${Math.max(visitorsH, point.visitors ? 4 : 0)}%`,
                  }}
                />
              </div>
              <span className="mt-1 text-[10px] text-slate-500">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnalyticsPanel({ site }: { site: AnalyticsSiteId }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [status, setStatus] = useState("Cargando estadísticas…");

  const monthLabel = useMemo(() => {
    return new Date(year, month - 1, 1).toLocaleDateString("es-DO", {
      month: "long",
      year: "numeric",
    });
  }, [year, month]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setStatus("Inicia sesión de nuevo.");
      return;
    }
    setStatus("Cargando…");
    try {
      const data = await fetchAnalyticsSummary(site, token, year, month);
      if (!data.ok) {
        setStatus(data.error ?? "No se pudieron cargar las estadísticas.");
        setSummary(null);
        return;
      }
      setSummary(data);
      setStatus("");
    } catch (e) {
      setStatus(String(e));
      setSummary(null);
    }
  }, [site, year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold capitalize text-brand-ink">{monthLabel}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {ANALYTICS_SITE_LABELS[site]} — conteo interno (similar a WordPress Stats)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {status ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm">{status}</p>
      ) : null}

      {summary?.ok ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Vistas"
              value={summary.views ?? 0}
              change={summary.changeViewsPct}
            />
            <MetricCard
              label="Visitantes"
              value={summary.visitors ?? 0}
              change={summary.changeVisitorsPct}
            />
            <MetricCard
              label="Vistas por visitante"
              value={summary.viewsPerVisitor ?? 0}
              hint="Promedio del mes"
            />
            <MetricCard
              label="Páginas con datos"
              value={summary.topPages?.length ?? 0}
              hint="Rutas más visitadas"
            />
          </div>

          <DailyChart daily={summary.daily ?? []} />

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-brand-ink">
                Páginas más visitadas
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Ruta y tiempo promedio en la página
              </p>
              {(summary.topPages ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Sin datos todavía.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-slate-500">
                        <th className="px-2 py-2">Ruta</th>
                        <th className="px-2 py-2">Vistas</th>
                        <th className="px-2 py-2">Tiempo prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topPages?.map((row) => (
                        <tr key={row.path} className="border-b border-slate-100">
                          <td className="px-2 py-2 font-mono text-xs">{row.path}</td>
                          <td className="px-2 py-2 tabular-nums">{row.views}</td>
                          <td className="px-2 py-2 tabular-nums">
                            {formatDuration(row.avgDurationSec)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-brand-ink">
                Secciones / áreas más vistas
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Bloques con <code className="rounded bg-slate-100 px-1">data-oina-section</code>
              </p>
              {(summary.topSections ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Aún no hay secciones marcadas. Agrega{" "}
                  <code className="rounded bg-slate-100 px-1">data-oina-section=&quot;Nombre&quot;</code>{" "}
                  en bloques importantes del sitio.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-slate-500">
                        <th className="px-2 py-2">Página</th>
                        <th className="px-2 py-2">Sección</th>
                        <th className="px-2 py-2">Vistas</th>
                        <th className="px-2 py-2">Tiempo prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topSections?.map((row) => (
                        <tr
                          key={`${row.path}:${row.section}`}
                          className="border-b border-slate-100"
                        >
                          <td className="px-2 py-2 font-mono text-xs">{row.path}</td>
                          <td className="px-2 py-2">{row.section}</td>
                          <td className="px-2 py-2 tabular-nums">{row.views}</td>
                          <td className="px-2 py-2 tabular-nums">
                            {formatDuration(row.avgDurationSec)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

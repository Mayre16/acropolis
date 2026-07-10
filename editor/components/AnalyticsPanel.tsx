"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAnalyticsSummary } from "@/lib/api";
import {
  ANALYTICS_FORM_LABELS,
  ANALYTICS_SITE_LABELS,
  type AnalyticsChartSeries,
  type AnalyticsSiteId,
  type AnalyticsSummary,
} from "@/lib/analytics-types";
import { getToken } from "@/lib/auth-storage";

function formLabel(key: string) {
  return ANALYTICS_FORM_LABELS[key] || key.replace(/_/g, " ");
}

const ANALYTICS_SITES = Object.keys(ANALYTICS_SITE_LABELS) as AnalyticsSiteId[];

/** Botones de sitio: color del sitio activo (como en el panel). */
const ANALYTICS_SITE_BUTTON: Record<
  AnalyticsSiteId,
  { label: string; active: string; idle: string }
> = {
  acropolis: {
    label: "Acrópolis",
    active: "bg-site-acropolis text-white shadow-md",
    idle: "bg-white text-site-acropolis ring-1 ring-site-acropolis/40 hover:bg-site-acropolis/10",
  },
  civis: {
    label: "Civis",
    active: "bg-site-civis text-white shadow-md",
    idle: "bg-white text-site-civis ring-1 ring-site-civis/40 hover:bg-site-civis/10",
  },
  editorial: {
    label: "Editorial",
    active: "bg-site-editorial text-white shadow-md",
    idle: "bg-white text-site-editorial ring-1 ring-site-editorial/40 hover:bg-site-editorial/10",
  },
  circulodeamigos: {
    label: "Círculo",
    active: "bg-site-circulodeamigos text-white shadow-md",
    idle: "bg-white text-site-circulodeamigos ring-1 ring-site-circulodeamigos/40 hover:bg-site-circulodeamigos/10",
  },
  biblioteca: {
    label: "Biblioteca",
    active: "bg-site-biblioteca text-site-biblioteca-ink shadow-md",
    idle: "bg-white text-site-biblioteca-ink ring-1 ring-site-biblioteca-dark/40 hover:bg-site-biblioteca/20",
  },
};

const MONTH_OPTIONS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

type ChartMode = "month" | "year" | "week" | "hours" | "traffic";

const CHART_MODE_OPTIONS: { id: ChartMode; label: string }[] = [
  { id: "month", label: "Mes vs anterior" },
  { id: "year", label: "Año vs anterior" },
  { id: "week", label: "Semana vs anterior" },
  { id: "hours", label: "Por horas" },
  { id: "traffic", label: "Vistas vs visitantes" },
];

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function ChangeBadge({ value, label }: { value: number; label?: string }) {
  if (value === 0) {
    return (
      <span className="text-xs text-slate-500">
        {label ? `${label}: sin cambio` : "sin cambio"}
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={`text-xs font-semibold ${up ? "text-emerald-700" : "text-rose-700"}`}
    >
      {label ? `${label}: ` : ""}
      {up ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

function MetricCard({
  label,
  value,
  change,
  yoyChange,
  hint,
}: {
  label: string;
  value: string | number;
  change?: number;
  yoyChange?: number;
  hint?: string;
}) {
  const valueClass =
    typeof value === "string" && value.length > 18
      ? "mt-2 break-all font-mono text-sm font-bold text-brand-ink"
      : "mt-2 text-3xl font-bold tabular-nums text-brand-ink";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={valueClass}>{value}</p>
      {typeof change === "number" ? (
        <div className="mt-1">
          <ChangeBadge value={change} label="vs mes ant." />
        </div>
      ) : null}
      {typeof yoyChange === "number" ? (
        <div className="mt-0.5">
          <ChangeBadge value={yoyChange} label="vs año ant." />
        </div>
      ) : null}
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function CompareBarChart({
  series,
  metric,
}: {
  series: AnalyticsChartSeries;
  metric: "views" | "visitors";
}) {
  const hasCompare = Boolean(series.compareLabel);
  const values = series.points.flatMap((p) =>
    hasCompare
      ? [
          metric === "views" ? p.views : p.visitors,
          metric === "views" ? p.compareViews : p.compareVisitors,
        ]
      : [metric === "views" ? p.views : p.visitors],
  );
  const max = Math.max(1, ...values);
  const empty = values.every((v) => v === 0);

  if (empty) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
        Aún no hay visitas registradas en este periodo.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-ink">{series.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {metric === "views" ? "Vistas" : "Visitantes"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            {series.currentLabel}
          </span>
          {hasCompare ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" />
              {series.compareLabel}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex h-56 items-end gap-1 overflow-x-auto pb-2">
        {series.points.map((point) => {
          const current = metric === "views" ? point.views : point.visitors;
          const compare =
            metric === "views" ? point.compareViews : point.compareVisitors;
          const curH = Math.round((current / max) * 100);
          const cmpH = Math.round((compare / max) * 100);
          return (
            <div
              key={point.label}
              className="group flex min-w-[28px] flex-1 flex-col items-center"
              title={
                hasCompare
                  ? `${point.label}: actual ${current}, anterior ${compare}`
                  : `${point.label}: ${current}`
              }
            >
              <div className="relative flex h-44 w-full items-end justify-center gap-0.5">
                <div
                  className="w-2.5 rounded-t bg-emerald-500 transition-opacity group-hover:opacity-80"
                  style={{ height: `${Math.max(curH, current ? 4 : 0)}%` }}
                />
                {hasCompare ? (
                  <div
                    className="w-2.5 rounded-t bg-slate-400 transition-opacity group-hover:opacity-80"
                    style={{ height: `${Math.max(cmpH, compare ? 4 : 0)}%` }}
                  />
                ) : null}
              </div>
              <span className="mt-1 max-w-[3rem] truncate text-[10px] text-slate-500">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrafficChart({
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
        <h3 className="text-sm font-semibold text-brand-ink">
          Vistas vs visitantes (días del mes)
        </h3>
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

type Props = {
  site: AnalyticsSiteId;
  onSiteChange?: (site: AnalyticsSiteId) => void;
};

export function AnalyticsPanel({ site: siteProp, onSiteChange }: Props) {
  const now = new Date();
  const [site, setSite] = useState<AnalyticsSiteId>(siteProp);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [status, setStatus] = useState("Cargando estadísticas…");
  const [chartMode, setChartMode] = useState<ChartMode>("month");
  const [chartMetric, setChartMetric] = useState<"views" | "visitors">("views");

  useEffect(() => {
    setSite(siteProp);
  }, [siteProp]);

  // Solo desde 2026 (inicio de métricas); no listar años sin datos.
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const start = 2026;
    const years: number[] = [];
    for (let y = Math.max(current, start); y >= start; y -= 1) years.push(y);
    if (year >= start && !years.includes(year)) years.push(year);
    return years.sort((a, b) => b - a);
  }, [year]);

  const monthLabel = useMemo(() => {
    const name =
      MONTH_OPTIONS.find((m) => m.value === month)?.label ?? String(month);
    return `${name} ${year}`;
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
    const nextYear = d.getFullYear();
    if (nextYear < 2026) return;
    setYear(nextYear);
    setMonth(d.getMonth() + 1);
  }

  function selectSite(next: AnalyticsSiteId) {
    setSite(next);
    onSiteChange?.(next);
  }

  const activeSeries = useMemo((): AnalyticsChartSeries | null => {
    if (!summary?.charts) return null;
    if (chartMode === "month") return summary.charts.monthCompare ?? null;
    if (chartMode === "year") return summary.charts.yearCompare ?? null;
    if (chartMode === "week") return summary.charts.weekCompare ?? null;
    if (chartMode === "hours") return summary.charts.hours ?? null;
    return null;
  }, [summary, chartMode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">{monthLabel}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Sitio</span>
            <div className="flex flex-wrap gap-2">
              {ANALYTICS_SITES.map((id) => {
                const btn = ANALYTICS_SITE_BUTTON[id];
                const active = id === site;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectSite(id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                      active ? btn.active : btn.idle
                    }`}
                    aria-pressed={active}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Mes
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-ink"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Año
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-ink"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2 self-end">
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
      </div>

      {status ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm">{status}</p>
      ) : null}

      {summary?.ok ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Visitantes"
              value={summary.visitors ?? 0}
              change={summary.changeVisitorsPct}
              yoyChange={summary.changeVisitorsYoYPct}
            />
            <MetricCard
              label="Vistas por visitante"
              value={summary.viewsPerVisitor ?? 0}
              hint={`${summary.views ?? 0} vistas en total`}
            />
            <MetricCard
              label="Tiempo por visitante"
              value={formatDuration(summary.avgTimePerVisitorSec ?? 0)}
              hint="Estimado del mes"
            />
            <MetricCard
              label="Página más visitada"
              value={summary.mostVisitedPage?.path ?? "—"}
              hint={
                summary.mostVisitedPage
                  ? `${summary.mostVisitedPage.views} vistas · prom. ${formatDuration(summary.mostVisitedPage.avgDurationSec)}`
                  : "Sin datos"
              }
            />
            <MetricCard
              label="Donde más tiempo"
              value={summary.longestPage?.path ?? "—"}
              hint={
                summary.longestPage
                  ? `Total ${formatDuration(summary.longestPage.totalDurationSec ?? 0)} · prom. ${formatDuration(summary.longestPage.avgDurationSec)}`
                  : "Sin datos"
              }
            />
            <MetricCard
              label="Solicitudes / WhatsApp"
              value={`${summary.formSubmissions ?? 0} / ${summary.whatsappClicks ?? 0}`}
              change={summary.changeFormsPct}
              hint="Formularios enviados · clics a WhatsApp"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {CHART_MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setChartMode(opt.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    chartMode === opt.id
                      ? "bg-brand-teal text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {chartMode !== "traffic" ? (
                <select
                  value={chartMetric}
                  onChange={(e) =>
                    setChartMetric(e.target.value as "views" | "visitors")
                  }
                  className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                >
                  <option value="views">Mostrar: vistas</option>
                  <option value="visitors">Mostrar: visitantes</option>
                </select>
              ) : null}
            </div>

            {chartMode === "traffic" ? (
              <TrafficChart daily={summary.daily ?? []} />
            ) : activeSeries ? (
              <CompareBarChart series={activeSeries} metric={chartMetric} />
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                Recarga o actualiza la API para ver estos gráficos de comparación.
              </p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-brand-ink">
                Top 10 más visitadas
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Por cantidad de vistas
              </p>
              {(summary.topPages ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Sin datos todavía.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-slate-500">
                        <th className="px-2 py-2">#</th>
                        <th className="px-2 py-2">Ruta</th>
                        <th className="px-2 py-2">Vistas</th>
                        <th className="px-2 py-2">Tiempo prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topPages?.slice(0, 10).map((row, i) => (
                        <tr key={row.path} className="border-b border-slate-100">
                          <td className="px-2 py-2 tabular-nums text-slate-500">
                            {i + 1}
                          </td>
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
                Top 10 donde más tiempo
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Por tiempo total estimado en la página
              </p>
              {(summary.topPagesByTime ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Sin datos todavía.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-slate-500">
                        <th className="px-2 py-2">#</th>
                        <th className="px-2 py-2">Ruta</th>
                        <th className="px-2 py-2">Tiempo total</th>
                        <th className="px-2 py-2">Prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topPagesByTime?.slice(0, 10).map((row, i) => (
                        <tr key={row.path} className="border-b border-slate-100">
                          <td className="px-2 py-2 tabular-nums text-slate-500">
                            {i + 1}
                          </td>
                          <td className="px-2 py-2 font-mono text-xs">{row.path}</td>
                          <td className="px-2 py-2 tabular-nums">
                            {formatDuration(row.totalDurationSec ?? 0)}
                          </td>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-brand-ink">
                Solicitudes de información
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Formularios enviados con éxito este mes
              </p>
              {(summary.formBreakdown ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Aún no hay envíos registrados.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-slate-500">
                        <th className="px-2 py-2">Formulario</th>
                        <th className="px-2 py-2">Envíos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.formBreakdown?.map((row) => (
                        <tr key={row.formKey} className="border-b border-slate-100">
                          <td className="px-2 py-2">{formLabel(row.formKey)}</td>
                          <td className="px-2 py-2 tabular-nums">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-brand-ink">
                Clics a WhatsApp
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Enlaces wa.me / WhatsApp abiertos desde el sitio
              </p>
              <p className="mt-4 text-3xl font-bold tabular-nums text-brand-ink">
                {summary.whatsappClicks ?? 0}
              </p>
              {typeof summary.changeWhatsappPct === "number" ? (
                <div className="mt-1">
                  <ChangeBadge
                    value={summary.changeWhatsappPct}
                    label="vs mes ant."
                  />
                </div>
              ) : null}
              <p className="mt-3 text-xs text-slate-500">
                Se cuenta al hacer clic; no confirma si la conversación se inició
                dentro de WhatsApp.
              </p>
            </section>
          </div>

          <p className="text-xs text-slate-500">
            Datos retenidos ~2 años. El gráfico por horas usa visitas nuevas (UTC);
            los datos antiguos sin hora no aparecen ahí.
          </p>
        </>
      ) : null}
    </div>
  );
}

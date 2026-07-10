import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { isAnalyticsSite } from "./analytics-sites.mjs";

const MONTH_SHORT = [
  "",
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function analyticsPath(dataRoot, siteId) {
  return path.join(dataRoot, "analytics", `${siteId}.json`);
}

function emptyStore() {
  return { version: 1, days: {} };
}

export function loadAnalyticsStore(dataRoot, siteId) {
  if (!isAnalyticsSite(siteId)) return emptyStore();
  const file = analyticsPath(dataRoot, siteId);
  if (!fs.existsSync(file)) return emptyStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!parsed || typeof parsed !== "object") return emptyStore();
    if (!parsed.days || typeof parsed.days !== "object") parsed.days = {};
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function saveAnalyticsStore(dataRoot, siteId, store) {
  const dir = path.join(dataRoot, "analytics");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    analyticsPath(dataRoot, siteId),
    JSON.stringify(store, null, 2),
    "utf8",
  );
}

export function hashVisitor(visitorId, dayKey, secret = "oina-analytics") {
  return crypto
    .createHash("sha256")
    .update(`${secret}:${dayKey}:${String(visitorId).slice(0, 64)}`)
    .digest("hex")
    .slice(0, 16);
}

function normalizePath(raw) {
  let p = String(raw || "/").trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p.slice(0, 240) || "/";
}

function normalizeSection(raw) {
  const s = String(raw || "").trim().slice(0, 80);
  return s || "";
}

/** Conservar ~26 meses (~800 días) para comparar mes a mes y año a año. */
const ANALYTICS_RETENTION_DAYS = 800;

function pruneOldDays(store) {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - ANALYTICS_RETENTION_DAYS);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  for (const key of Object.keys(store.days || {})) {
    if (key < cutoffKey) delete store.days[key];
  }
}

function ensureDay(store, dayKey) {
  if (!store.days[dayKey]) {
    store.days[dayKey] = {
      views: 0,
      visitors: [],
      pages: {},
      hours: {},
      forms: {},
      whatsapp: 0,
    };
  }
  if (!store.days[dayKey].hours || typeof store.days[dayKey].hours !== "object") {
    store.days[dayKey].hours = {};
  }
  if (!store.days[dayKey].forms || typeof store.days[dayKey].forms !== "object") {
    store.days[dayKey].forms = {};
  }
  if (typeof store.days[dayKey].whatsapp !== "number") {
    store.days[dayKey].whatsapp = Number(store.days[dayKey].whatsapp) || 0;
  }
  return store.days[dayKey];
}

function ensurePage(day, pagePath) {
  if (!day.pages[pagePath]) {
    day.pages[pagePath] = {
      views: 0,
      durationMs: 0,
      sections: {},
    };
  }
  return day.pages[pagePath];
}

function normalizeFormKey(raw) {
  const s = String(raw || "form")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .slice(0, 64);
  return s || "form";
}

export function recordAnalyticsEvent(dataRoot, payload, remoteIp = "") {
  const site = String(payload?.site ?? "").trim();
  if (!isAnalyticsSite(site)) {
    return { ok: false, error: "Sitio no válido." };
  }

  const event = String(payload?.event ?? "pageview").trim();
  const allowed = ["pageview", "engagement", "form", "whatsapp"];
  if (!allowed.includes(event)) {
    return { ok: false, error: "Evento no válido." };
  }

  const pagePath = normalizePath(payload?.path);
  const section = normalizeSection(payload?.section);
  const visitorId = String(payload?.visitorId ?? remoteIp ?? "anon").slice(0, 64);
  const durationMs = Math.max(
    0,
    Math.min(Number(payload?.durationMs) || 0, 30 * 60 * 1000),
  );
  const formKey = normalizeFormKey(payload?.formKey);

  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const hourKey = String(now.getUTCHours());
  const store = loadAnalyticsStore(dataRoot, site);
  const day = ensureDay(store, dayKey);
  const page = ensurePage(day, pagePath);

  const visitorHash = hashVisitor(visitorId, dayKey);

  // Solo pageview cuenta vista y visitante. Engagement solo suma tiempo
  // (si no, un engagement sin pageview dejaba visitantes > vistas).
  if (event === "pageview") {
    if (!day.visitors.includes(visitorHash)) {
      day.visitors.push(visitorHash);
    }
    day.views += 1;
    page.views += 1;
    if (!day.hours[hourKey]) {
      day.hours[hourKey] = { views: 0, visitors: [] };
    }
    day.hours[hourKey].views += 1;
    if (!day.hours[hourKey].visitors.includes(visitorHash)) {
      day.hours[hourKey].visitors.push(visitorHash);
    }
    if (section) {
      if (!page.sections[section]) {
        page.sections[section] = { views: 0, durationMs: 0 };
      }
      page.sections[section].views += 1;
    }
  } else if (event === "engagement" && durationMs > 0) {
    page.durationMs += durationMs;
    if (section) {
      if (!page.sections[section]) {
        page.sections[section] = { views: 0, durationMs: 0 };
      }
      page.sections[section].durationMs += durationMs;
    }
  } else if (event === "form") {
    day.forms[formKey] = (day.forms[formKey] || 0) + 1;
  } else if (event === "whatsapp") {
    day.whatsapp += 1;
  }

  pruneOldDays(store);
  saveAnalyticsStore(dataRoot, site, store);
  return { ok: true };
}

function parseMonth(year, month) {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return null;
  }
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { year: y, month: m, from, to, lastDay };
}

function dayTotalsMap(store, from, to) {
  const map = new Map();
  for (const [date, day] of Object.entries(store.days || {})) {
    if (date < from || date > to) continue;
    map.set(date, {
      views: day.views || 0,
      visitors: (day.visitors || []).length,
    });
  }
  return map;
}

function sumRange(store, from, to) {
  let views = 0;
  let totalDurationMs = 0;
  let formSubmissions = 0;
  let whatsappClicks = 0;
  const visitorSet = new Set();
  const pageMap = new Map();
  const sectionMap = new Map();
  const formMap = new Map();
  const daily = [];

  for (const [date, day] of Object.entries(store.days || {})) {
    if (date < from || date > to) continue;
    views += day.views || 0;
    whatsappClicks += day.whatsapp || 0;
    for (const v of day.visitors || []) visitorSet.add(v);

    for (const [fk, count] of Object.entries(day.forms || {})) {
      const n = Number(count) || 0;
      formSubmissions += n;
      formMap.set(fk, (formMap.get(fk) || 0) + n);
    }

    daily.push({
      date,
      views: day.views || 0,
      visitors: (day.visitors || []).length,
    });

    for (const [pagePath, page] of Object.entries(day.pages || {})) {
      const prev = pageMap.get(pagePath) || {
        path: pagePath,
        views: 0,
        durationMs: 0,
      };
      prev.views += page.views || 0;
      prev.durationMs += page.durationMs || 0;
      totalDurationMs += page.durationMs || 0;
      pageMap.set(pagePath, prev);

      for (const [section, stats] of Object.entries(page.sections || {})) {
        const key = `${pagePath} · ${section}`;
        const sp = sectionMap.get(key) || {
          path: pagePath,
          section,
          views: 0,
          durationMs: 0,
        };
        sp.views += stats.views || 0;
        sp.durationMs += stats.durationMs || 0;
        sectionMap.set(key, sp);
      }
    }
  }

  daily.sort((a, b) => a.date.localeCompare(b.date));

  const visitors = visitorSet.size;
  const viewsPerVisitor =
    visitors > 0 ? Math.round((views / visitors) * 100) / 100 : 0;
  const avgTimePerVisitorSec =
    visitors > 0 ? Math.round(totalDurationMs / visitors / 1000) : 0;

  const pagesByViews = [...pageMap.values()].sort((a, b) => b.views - a.views);
  const pagesByTime = [...pageMap.values()].sort(
    (a, b) => b.durationMs - a.durationMs,
  );

  const topPages = pagesByViews.slice(0, 10).map((p) => ({
    path: p.path,
    views: p.views,
    avgDurationSec:
      p.views > 0 ? Math.round(p.durationMs / p.views / 1000) : 0,
  }));

  const topPagesByTime = pagesByTime.slice(0, 10).map((p) => ({
    path: p.path,
    views: p.views,
    totalDurationSec: Math.round(p.durationMs / 1000),
    avgDurationSec:
      p.views > 0 ? Math.round(p.durationMs / p.views / 1000) : 0,
  }));

  const mostVisitedPage = pagesByViews[0]
    ? {
        path: pagesByViews[0].path,
        views: pagesByViews[0].views,
        avgDurationSec:
          pagesByViews[0].views > 0
            ? Math.round(pagesByViews[0].durationMs / pagesByViews[0].views / 1000)
            : 0,
      }
    : null;

  const longestPage = pagesByTime[0]
    ? {
        path: pagesByTime[0].path,
        views: pagesByTime[0].views,
        totalDurationSec: Math.round(pagesByTime[0].durationMs / 1000),
        avgDurationSec:
          pagesByTime[0].views > 0
            ? Math.round(pagesByTime[0].durationMs / pagesByTime[0].views / 1000)
            : 0,
      }
    : null;

  const topSections = [...sectionMap.values()]
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 10)
    .map((s) => ({
      path: s.path,
      section: s.section,
      views: s.views,
      avgDurationSec:
        s.views > 0 ? Math.round(s.durationMs / s.views / 1000) : 0,
    }));

  const formBreakdown = [...formMap.entries()]
    .map(([formKey, count]) => ({ formKey, count }))
    .sort((a, b) => b.count - a.count);

  return {
    views,
    visitors,
    viewsPerVisitor,
    avgTimePerVisitorSec,
    formSubmissions,
    whatsappClicks,
    mostVisitedPage,
    longestPage,
    daily,
    topPages,
    topPagesByTime,
    topSections,
    formBreakdown,
  };
}

function pctChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function addUtcDays(isoDate, delta) {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function buildCompareMonthChart(store, year, month) {
  const period = parseMonth(year, month);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prev = parseMonth(prevYear, prevMonth);
  const lastDay = Math.max(period.lastDay, prev.lastDay);
  const curMap = dayTotalsMap(store, period.from, period.to);
  const prevMap = dayTotalsMap(store, prev.from, prev.to);
  const points = [];
  for (let d = 1; d <= lastDay; d++) {
    const dd = String(d).padStart(2, "0");
    const curKey = `${year}-${String(month).padStart(2, "0")}-${dd}`;
    const prevKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${dd}`;
    const cur = curMap.get(curKey) || { views: 0, visitors: 0 };
    const prv = prevMap.get(prevKey) || { views: 0, visitors: 0 };
    points.push({
      label: String(d),
      views: cur.views,
      visitors: cur.visitors,
      compareViews: prv.views,
      compareVisitors: prv.visitors,
    });
  }
  return {
    mode: "month",
    title: "Mes actual vs mes anterior (por día)",
    currentLabel: `${MONTH_SHORT[month]} ${year}`,
    compareLabel: `${MONTH_SHORT[prevMonth]} ${prevYear}`,
    points,
  };
}

function buildYearMonthsChart(store, year) {
  const points = [];
  for (let m = 1; m <= 12; m++) {
    const period = parseMonth(year, m);
    const yoy = parseMonth(year - 1, m);
    const cur = sumRange(store, period.from, period.to);
    const prev = sumRange(store, yoy.from, yoy.to);
    points.push({
      label: MONTH_SHORT[m],
      views: cur.views,
      visitors: cur.visitors,
      compareViews: prev.views,
      compareVisitors: prev.visitors,
    });
  }
  return {
    mode: "year",
    title: "Año actual vs año anterior (por mes)",
    currentLabel: String(year),
    compareLabel: String(year - 1),
    points,
  };
}

function buildWeekChart(store, year, month) {
  const period = parseMonth(year, month);
  const today = new Date().toISOString().slice(0, 10);
  const end = today >= period.from && today <= period.to ? today : period.to;
  const start = addUtcDays(end, -6);
  const prevEnd = addUtcDays(start, -1);
  const prevStart = addUtcDays(prevEnd, -6);
  const curMap = dayTotalsMap(store, start, end);
  const prevMap = dayTotalsMap(store, prevStart, prevEnd);
  const points = [];
  for (let i = 0; i < 7; i++) {
    const curKey = addUtcDays(start, i);
    const prevKey = addUtcDays(prevStart, i);
    const cur = curMap.get(curKey) || { views: 0, visitors: 0 };
    const prv = prevMap.get(prevKey) || { views: 0, visitors: 0 };
    const weekday = new Date(`${curKey}T12:00:00.000Z`).toLocaleDateString(
      "es-DO",
      { weekday: "short", timeZone: "UTC" },
    );
    points.push({
      label: `${weekday} ${curKey.slice(8, 10)}`,
      views: cur.views,
      visitors: cur.visitors,
      compareViews: prv.views,
      compareVisitors: prv.visitors,
    });
  }
  return {
    mode: "week",
    title: "Última semana vs semana anterior (por día)",
    currentLabel: `${start} → ${end}`,
    compareLabel: `${prevStart} → ${prevEnd}`,
    points,
  };
}

function buildHoursChart(store, year, month) {
  const period = parseMonth(year, month);
  const hours = Array.from({ length: 24 }, () => ({
    views: 0,
    visitors: new Set(),
  }));

  for (const [date, day] of Object.entries(store.days || {})) {
    if (date < period.from || date > period.to || !day?.hours) continue;
    for (const [h, stats] of Object.entries(day.hours)) {
      const hour = Number(h);
      if (!Number.isFinite(hour) || hour < 0 || hour > 23) continue;
      hours[hour].views += stats.views || 0;
      for (const v of stats.visitors || []) hours[hour].visitors.add(v);
    }
  }

  const points = hours.map((h, hour) => ({
    label: `${String(hour).padStart(2, "0")}h`,
    views: h.views,
    visitors: h.visitors.size,
    compareViews: 0,
    compareVisitors: 0,
  }));

  return {
    mode: "hours",
    title: "Vistas por hora (mes seleccionado, UTC)",
    currentLabel: "Este mes",
    compareLabel: "",
    points,
  };
}

export function buildAnalyticsSummary(dataRoot, siteId, year, month) {
  if (!isAnalyticsSite(siteId)) {
    return { ok: false, error: "Sitio no válido." };
  }
  const period = parseMonth(year, month);
  if (!period) return { ok: false, error: "Periodo no válido." };

  const store = loadAnalyticsStore(dataRoot, siteId);
  const current = sumRange(store, period.from, period.to);

  const prevMonth = period.month === 1 ? 12 : period.month - 1;
  const prevYear = period.month === 1 ? period.year - 1 : period.year;
  const prevPeriod = parseMonth(prevYear, prevMonth);
  const previous = prevPeriod
    ? sumRange(store, prevPeriod.from, prevPeriod.to)
    : {
        views: 0,
        visitors: 0,
        viewsPerVisitor: 0,
        avgTimePerVisitorSec: 0,
        formSubmissions: 0,
        whatsappClicks: 0,
        mostVisitedPage: null,
        longestPage: null,
        daily: [],
        topPages: [],
        topPagesByTime: [],
        topSections: [],
        formBreakdown: [],
      };

  const yoyPeriod = parseMonth(period.year - 1, period.month);
  const yoy = yoyPeriod
    ? sumRange(store, yoyPeriod.from, yoyPeriod.to)
    : { views: 0, visitors: 0, formSubmissions: 0, whatsappClicks: 0 };

  const periodLabel = new Date(
    period.year,
    period.month - 1,
    1,
  ).toLocaleDateString("es-DO", { month: "long", year: "numeric" });

  return {
    ok: true,
    site: siteId,
    period: {
      year: period.year,
      month: period.month,
      from: period.from,
      to: period.to,
      label: periodLabel,
    },
    views: current.views,
    visitors: current.visitors,
    viewsPerVisitor: current.viewsPerVisitor,
    avgTimePerVisitorSec: current.avgTimePerVisitorSec,
    formSubmissions: current.formSubmissions,
    whatsappClicks: current.whatsappClicks,
    mostVisitedPage: current.mostVisitedPage,
    longestPage: current.longestPage,
    changeViewsPct: pctChange(current.views, previous.views),
    changeVisitorsPct: pctChange(current.visitors, previous.visitors),
    changeViewsYoYPct: pctChange(current.views, yoy.views),
    changeVisitorsYoYPct: pctChange(current.visitors, yoy.visitors),
    changeFormsPct: pctChange(current.formSubmissions, previous.formSubmissions),
    changeWhatsappPct: pctChange(current.whatsappClicks, previous.whatsappClicks),
    daily: current.daily,
    topPages: current.topPages,
    topPagesByTime: current.topPagesByTime,
    topSections: current.topSections,
    formBreakdown: current.formBreakdown,
    charts: {
      monthCompare: buildCompareMonthChart(store, period.year, period.month),
      yearCompare: buildYearMonthsChart(store, period.year),
      weekCompare: buildWeekChart(store, period.year, period.month),
      hours: buildHoursChart(store, period.year, period.month),
    },
  };
}

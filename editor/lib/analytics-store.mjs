import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { isAnalyticsSite } from "./analytics-sites.mjs";

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

function ensureDay(store, dayKey) {
  if (!store.days[dayKey]) {
    store.days[dayKey] = {
      views: 0,
      visitors: [],
      pages: {},
    };
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

export function recordAnalyticsEvent(dataRoot, payload, remoteIp = "") {
  const site = String(payload?.site ?? "").trim();
  if (!isAnalyticsSite(site)) {
    return { ok: false, error: "Sitio no válido." };
  }

  const event = String(payload?.event ?? "pageview").trim();
  if (event !== "pageview" && event !== "engagement") {
    return { ok: false, error: "Evento no válido." };
  }

  const pagePath = normalizePath(payload?.path);
  const section = normalizeSection(payload?.section);
  const visitorId = String(payload?.visitorId ?? remoteIp ?? "anon").slice(0, 64);
  const durationMs = Math.max(
    0,
    Math.min(Number(payload?.durationMs) || 0, 30 * 60 * 1000),
  );

  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const store = loadAnalyticsStore(dataRoot, site);
  const day = ensureDay(store, dayKey);
  const page = ensurePage(day, pagePath);

  const visitorHash = hashVisitor(visitorId, dayKey);
  if (!day.visitors.includes(visitorHash)) {
    day.visitors.push(visitorHash);
  }

  if (event === "pageview") {
    day.views += 1;
    page.views += 1;
    if (section) {
      if (!page.sections[section]) {
        page.sections[section] = { views: 0, durationMs: 0 };
      }
      page.sections[section].views += 1;
    }
  } else if (durationMs > 0) {
    page.durationMs += durationMs;
    if (section) {
      if (!page.sections[section]) {
        page.sections[section] = { views: 0, durationMs: 0 };
      }
      page.sections[section].durationMs += durationMs;
    }
  }

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
  return { year: y, month: m, from, to };
}

function sumRange(store, from, to) {
  let views = 0;
  const visitorSet = new Set();
  const pageMap = new Map();
  const sectionMap = new Map();
  const daily = [];

  for (const [date, day] of Object.entries(store.days || {})) {
    if (date < from || date > to) continue;
    views += day.views || 0;
    for (const v of day.visitors || []) visitorSet.add(v);

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

  const topPages = [...pageMap.values()]
    .sort((a, b) => b.views - a.views)
    .slice(0, 15)
    .map((p) => ({
      path: p.path,
      views: p.views,
      avgDurationSec:
        p.views > 0 ? Math.round(p.durationMs / p.views / 1000) : 0,
    }));

  const topSections = [...sectionMap.values()]
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 15)
    .map((s) => ({
      path: s.path,
      section: s.section,
      views: s.views,
      avgDurationSec:
        s.views > 0 ? Math.round(s.durationMs / s.views / 1000) : 0,
    }));

  return { views, visitors, viewsPerVisitor, daily, topPages, topSections };
}

function pctChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
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
        daily: [],
        topPages: [],
        topSections: [],
      };

  return {
    ok: true,
    site: siteId,
    period: {
      year: period.year,
      month: period.month,
      from: period.from,
      to: period.to,
      label: new Date(period.year, period.month - 1, 1).toLocaleDateString(
        "es-DO",
        { month: "long", year: "numeric" },
      ),
    },
    views: current.views,
    visitors: current.visitors,
    viewsPerVisitor: current.viewsPerVisitor,
    changeViewsPct: pctChange(current.views, previous.views),
    changeVisitorsPct: pctChange(current.visitors, previous.visitors),
    daily: current.daily,
    topPages: current.topPages,
    topSections: current.topSections,
  };
}

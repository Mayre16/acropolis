export type AnalyticsSiteId =
  | "acropolis"
  | "civis"
  | "editorial"
  | "biblioteca";

const VISITOR_STORAGE_KEY = "oina-analytics-vid";

function analyticsApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3401";
    }
  }
  return "https://editor.acropolis.adesa.com.do/api";
}

function shouldTrack(): boolean {
  if (typeof window === "undefined") return false;
  if (window.parent !== window) return false;
  if (document.documentElement.classList.contains("cms-edit-embedded")) {
    return false;
  }
  if (/[?&]cmsEdit=/.test(window.location.search)) return false;
  return true;
}

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

async function sendEvent(payload: Record<string, unknown>) {
  try {
    await fetch(`${analyticsApiBase()}/analytics/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // métricas opcionales — no interrumpir la navegación
  }
}

export function trackPageview(site: AnalyticsSiteId, path: string) {
  if (!shouldTrack()) return;
  void sendEvent({
    site,
    event: "pageview",
    path,
    visitorId: getVisitorId(),
  });
}

export function trackEngagement(
  site: AnalyticsSiteId,
  path: string,
  durationMs: number,
  section?: string,
) {
  if (!shouldTrack() || durationMs <= 0) return;
  void sendEvent({
    site,
    event: "engagement",
    path,
    section: section || undefined,
    durationMs: Math.round(durationMs),
    visitorId: getVisitorId(),
  });
}

export function startAnalyticsSession(site: AnalyticsSiteId, path: string) {
  if (!shouldTrack()) return () => {};

  trackPageview(site, path);

  let activeSection = "";
  let tickStartedAt = Date.now();
  let visible = document.visibilityState === "visible";

  const flush = (section = activeSection) => {
    const now = Date.now();
    const elapsed = visible ? now - tickStartedAt : 0;
    if (elapsed > 0) {
      trackEngagement(site, path, elapsed, section || undefined);
    }
    tickStartedAt = now;
  };

  const setSection = (next: string) => {
    if (next === activeSection) return;
    flush(activeSection);
    activeSection = next;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      let best: { id: string; ratio: number } | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = (entry.target as HTMLElement).dataset.oinaSection?.trim();
        if (!id) continue;
        if (!best || entry.intersectionRatio > best.ratio) {
          best = { id, ratio: entry.intersectionRatio };
        }
      }
      if (best && best.ratio >= 0.2) setSection(best.id);
    },
    { threshold: [0.2, 0.35, 0.5, 0.75] },
  );

  for (const el of document.querySelectorAll("[data-oina-section]")) {
    observer.observe(el);
  }

  const tick = window.setInterval(() => {
    if (!visible) return;
    flush(activeSection);
  }, 15000);

  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      flush(activeSection);
      visible = false;
    } else {
      visible = true;
      tickStartedAt = Date.now();
    }
  };

  const onPageHide = () => flush(activeSection);

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);

  return () => {
    flush(activeSection);
    window.clearInterval(tick);
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
  };
}

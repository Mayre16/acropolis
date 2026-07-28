import type { AgendaEntry } from "@/lib/agenda";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type { CmsAgendaEntry, CmsDocument } from "@/lib/cms/types";
export function cmsAgendaToEntry(e: CmsAgendaEntry): AgendaEntry {
  return {
    id: e.id,
    category: e.category,
    title: e.title,
    startsAt: e.startsAt,
    date: e.date,
    time: e.time ?? "",
    sede: e.sede ?? "",
    tag: e.tag,
    image: resolveCmsMediaUrl(e.image) ?? e.image,
    imageAlt: e.imageAlt,
    description: e.description,
    inscribeMessage: e.inscribeMessage,
    detailHref: e.detailHref,
    detailLabel: e.detailLabel,
    showOnHome: e.showOnHome,
  };
}

export function resolveAgendaFromCms(
  cms: CmsDocument | null | undefined,
  fallback: AgendaEntry[],
): AgendaEntry[] {
  const hidden = new Set(cms?.sections.agendaHidden ?? []);
  const cmsById = new Map(
    (cms?.sections.agenda ?? []).map((e) => [e.id, e]),
  );
  const result: AgendaEntry[] = [];
  const seen = new Set<string>();

  for (const e of fallback) {
    if (hidden.has(e.id)) continue;
    const cmsEntry = cmsById.get(e.id);
    result.push(cmsEntry ? cmsAgendaToEntry(cmsEntry) : e);
    seen.add(e.id);
  }

  for (const e of cms?.sections.agenda ?? []) {
    if (!seen.has(e.id) && !hidden.has(e.id)) {
      result.push(cmsAgendaToEntry(e));
    }
  }

  return result;
}

export function resolveDiplomadoBadge(
  cms: CmsDocument | null | undefined,
  fallback: { weekday: string; date: string },
) {
  const h = cms?.sections.diplomadoHero;
  if (!h?.badgeWeekday && !h?.badgeDate) return fallback;
  return {
    weekday: h.badgeWeekday ?? fallback.weekday,
    date: h.badgeDate ?? fallback.date,
  };
}

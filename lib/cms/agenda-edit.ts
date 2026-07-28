import { VOLUNTARIADO_PAGE_CATEGORIES } from "@/lib/agenda-publish-categories";
import type { AgendaEntry } from "@/lib/agenda";
import { HOME_AGENDA_CATEGORIES } from "@/lib/agenda";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type { CmsAgendaEntry, CmsDocument } from "@/lib/cms/types";

export type AddAgendaEntryOptions = {
  /** Inserta justo después de esta entrada. */
  afterId?: string;
  /** Inserta al inicio de la lista. */
  atStart?: boolean;
};

export function agendaEntryToCms(e: AgendaEntry): CmsAgendaEntry {
  return {
    id: e.id,
    category: e.category,
    title: e.title,
    startsAt: e.startsAt,
    date: e.date,
    time: e.time,
    sede: e.sede,
    tag: e.tag,
    image: e.image,
    imageAlt: e.imageAlt,
    description: e.description,
    inscribeMessage: e.inscribeMessage,
    detailHref: e.detailHref,
    detailLabel: e.detailLabel,
    showOnHome: e.showOnHome,
    eventoSlug: e.eventoSlug,
    seoTags: e.seoTags,
  };
}

export function cmsEntryToAgenda(e: CmsAgendaEntry): AgendaEntry {
  return {
    id: e.id,
    category: e.category,
    title: e.title,
    startsAt: e.startsAt,
    date: e.date,
    time: e.time ?? "",
    sede: e.sede ?? "",
    tag: e.tag,
    image: (resolveCmsMediaUrl(e.image) ?? e.image) || undefined,
    imageAlt: e.imageAlt,
    description: e.description,
    inscribeMessage: e.inscribeMessage,
    detailHref: e.detailHref,
    detailLabel: e.detailLabel,
    showOnHome: e.showOnHome,
    eventoSlug: e.eventoSlug,
    seoTags: e.seoTags,
  };
}

export function getDiplomadoEntries(
  doc: CmsDocument,
  fallback: AgendaEntry[],
): CmsAgendaEntry[] {
  return getAgendaEntriesForCategory(doc, "diplomado", fallback);
}

export function mergeDiplomadoIntoDoc(
  doc: CmsDocument,
  diplomado: CmsAgendaEntry[],
): CmsDocument {
  return mergeAgendaCategoryIntoDoc(doc, "diplomado", diplomado);
}

export function getCulturaEntries(
  doc: CmsDocument,
  fallback: AgendaEntry[],
): CmsAgendaEntry[] {
  return getAgendaEntriesForCategory(doc, "cultura", fallback);
}

export function mergeCulturaIntoDoc(
  doc: CmsDocument,
  cultura: CmsAgendaEntry[],
): CmsDocument {
  return mergeAgendaCategoryIntoDoc(doc, "cultura", cultura);
}

export function getVoluntariadoEntries(
  doc: CmsDocument,
  fallback: AgendaEntry[],
): CmsAgendaEntry[] {
  return getVoluntariadoPageAgendaEntries(doc, fallback);
}

/** Voluntariado + Esfera en la página /voluntariado. */
export function getVoluntariadoPageAgendaEntries(
  doc: CmsDocument,
  fallback: AgendaEntry[],
): CmsAgendaEntry[] {
  const categories = new Set<AgendaEntry["category"]>(
    VOLUNTARIADO_PAGE_CATEGORIES as unknown as AgendaEntry["category"][],
  );
  const hidden = new Set(doc.sections.agendaHidden ?? []);
  const cmsById = new Map(
    (doc.sections.agenda ?? [])
      .filter((e) => categories.has(e.category))
      .map((e) => [e.id, e]),
  );
  const items: CmsAgendaEntry[] = [];
  const seen = new Set<string>();

  for (const e of fallback) {
    if (!categories.has(e.category) || hidden.has(e.id)) continue;
    items.push(cmsById.get(e.id) ?? agendaEntryToCms(e));
    seen.add(e.id);
  }

  for (const e of doc.sections.agenda ?? []) {
    if (categories.has(e.category) && !seen.has(e.id) && !hidden.has(e.id)) {
      items.push(e);
    }
  }

  return items;
}

export function mergeVoluntariadoIntoDoc(
  doc: CmsDocument,
  voluntariado: CmsAgendaEntry[],
): CmsDocument {
  return mergeAgendaCategoryIntoDoc(doc, "voluntariado", voluntariado);
}

export function getCursosAgendaEntries(
  doc: CmsDocument,
  fallback: AgendaEntry[],
): CmsAgendaEntry[] {
  const hidden = new Set(doc.sections.agendaHidden ?? []);
  const cmsById = new Map(
    (doc.sections.agenda ?? [])
      .filter((e) =>
        e.category === "curso" ||
        e.category === "taller" ||
        e.category === "conferencia",
      )
      .map((e) => [e.id, e]),
  );
  const items: CmsAgendaEntry[] = [];
  const seen = new Set<string>();

  for (const e of fallback) {
    if (
      (e.category !== "curso" &&
        e.category !== "taller" &&
        e.category !== "conferencia") ||
      hidden.has(e.id)
    ) {
      continue;
    }
    items.push(cmsById.get(e.id) ?? agendaEntryToCms(e));
    seen.add(e.id);
  }

  for (const e of doc.sections.agenda ?? []) {
    if (
      (e.category === "curso" ||
        e.category === "taller" ||
        e.category === "conferencia") &&
      !seen.has(e.id) &&
      !hidden.has(e.id)
    ) {
      items.push(e);
    }
  }

  return items;
}

export function mergeCursosAgendaIntoDoc(
  doc: CmsDocument,
  entries: CmsAgendaEntry[],
): CmsDocument {
  const other = (doc.sections.agenda ?? []).filter(
    (e) =>
      e.category !== "curso" &&
      e.category !== "taller" &&
      e.category !== "conferencia",
  );
  return {
    ...doc,
    sections: {
      ...doc.sections,
      agenda: [...other, ...entries],
    },
  };
}

export function getAgendaEntriesForCategory(
  doc: CmsDocument,
  category: CmsAgendaEntry["category"],
  fallback: AgendaEntry[],
): CmsAgendaEntry[] {
  const hidden = new Set(doc.sections.agendaHidden ?? []);
  const cmsById = new Map(
    (doc.sections.agenda ?? [])
      .filter((e) => e.category === category)
      .map((e) => [e.id, e]),
  );
  const items: CmsAgendaEntry[] = [];
  const seen = new Set<string>();

  for (const e of fallback) {
    if (e.category !== category || hidden.has(e.id)) continue;
    items.push(cmsById.get(e.id) ?? agendaEntryToCms(e));
    seen.add(e.id);
  }

  for (const e of doc.sections.agenda ?? []) {
    if (e.category === category && !seen.has(e.id) && !hidden.has(e.id)) {
      items.push(e);
    }
  }

  return items;
}

export function mergeAgendaCategoryIntoDoc(
  doc: CmsDocument,
  category: CmsAgendaEntry["category"],
  entries: CmsAgendaEntry[],
): CmsDocument {
  const other = (doc.sections.agenda ?? []).filter(
    (e) => e.category !== category,
  );
  return {
    ...doc,
    sections: {
      ...doc.sections,
      agenda: [...other, ...entries],
    },
  };
}

export function getHomeAgendaEntries(
  doc: CmsDocument,
  fallback: AgendaEntry[],
): CmsAgendaEntry[] {
  const hidden = new Set(doc.sections.agendaHidden ?? []);
  const cmsById = new Map(
    (doc.sections.agenda ?? []).map((e) => [e.id, e]),
  );
  const items: CmsAgendaEntry[] = [];
  const seen = new Set<string>();

  for (const e of fallback) {
    if (hidden.has(e.id)) continue;
    items.push(cmsById.get(e.id) ?? agendaEntryToCms(e));
    seen.add(e.id);
  }

  for (const e of doc.sections.agenda ?? []) {
    if (!seen.has(e.id) && !hidden.has(e.id)) {
      items.push(e);
    }
  }

  return items;
}

export function mergeHomeAgendaIntoDoc(
  doc: CmsDocument,
  entries: CmsAgendaEntry[],
  hidden: string[],
): CmsDocument {
  return {
    ...doc,
    sections: {
      ...doc.sections,
      agenda: entries,
      agendaHidden: hidden,
    },
  };
}

/** Fusiona entradas editadas sin borrar otras categorías del documento. */
export function mergeAgendaEntriesIntoDoc(
  doc: CmsDocument,
  updated: CmsAgendaEntry[],
  hidden: string[] = doc.sections.agendaHidden ?? [],
): CmsDocument {
  const byId = new Map(updated.map((e) => [e.id, e]));
  const existing = doc.sections.agenda ?? [];
  const merged: CmsAgendaEntry[] = existing.map((e) => byId.get(e.id) ?? e);
  for (const e of updated) {
    if (!existing.some((x) => x.id === e.id)) merged.push(e);
  }
  return {
    ...doc,
    sections: {
      ...doc.sections,
      agenda: merged,
      agendaHidden: hidden,
    },
  };
}

export function getHomeCarouselEntries(
  doc: CmsDocument,
  fallback: AgendaEntry[],
): CmsAgendaEntry[] {
  return getAgendaEntriesForCategories(doc, fallback, HOME_AGENDA_CATEGORIES);
}

export function getAgendaEntriesForCategories(
  doc: CmsDocument,
  fallback: AgendaEntry[],
  categories: readonly CmsAgendaEntry["category"][],
): CmsAgendaEntry[] {
  const cats = new Set(categories);
  const hidden = new Set(doc.sections.agendaHidden ?? []);
  const cmsById = new Map(
    (doc.sections.agenda ?? [])
      .filter((e) => cats.has(e.category))
      .map((e) => [e.id, e]),
  );
  const items: CmsAgendaEntry[] = [];
  const seen = new Set<string>();

  for (const e of fallback) {
    if (!cats.has(e.category) || hidden.has(e.id)) continue;
    items.push(cmsById.get(e.id) ?? agendaEntryToCms(e));
    seen.add(e.id);
  }

  for (const e of doc.sections.agenda ?? []) {
    if (cats.has(e.category) && !seen.has(e.id) && !hidden.has(e.id)) {
      items.push(e);
    }
  }

  return items;
}

export function newCulturaId() {
  return `cultura-${Date.now().toString(36)}`;
}

export function newDiplomadoId() {
  return `diplomado-${Date.now().toString(36)}`;
}

export function newVoluntariadoId() {
  return `voluntariado-${Date.now().toString(36)}`;
}

export function newCursosAgendaId() {
  return `curso-agenda-${Date.now().toString(36)}`;
}

export function newAgendaId() {
  return `item-${Date.now().toString(36)}`;
}

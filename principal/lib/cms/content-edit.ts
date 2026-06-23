import type { Articulo } from "@/lib/articulos";
import type { EventoItem } from "@/lib/eventos";
import type { MedioItem } from "@/lib/medios";
import {
  type ViajeDestino,
  viajeKey,
} from "@/lib/viajes";
import type {
  CmsArticulo,
  CmsDocument,
  CmsEvento,
  CmsMedioItem,
  CmsViaje,
} from "@/lib/cms/types";

export function articuloToCms(a: Articulo): CmsArticulo {
  return {
    slug: a.slug,
    title: a.title,
    author: a.author,
    date: a.date,
    readingTime: a.readingTime,
    category: a.category,
    excerpt: a.excerpt,
    image: {
      src: a.image.src,
      alt: a.image.alt,
      credit: a.image.credit,
    },
    body: a.body,
    featured: a.featured,
    gallery: [],
  };
}

export function eventoToCms(e: EventoItem): CmsEvento {
  return {
    slug: e.slug,
    title: e.title,
    date: e.date,
    category: e.category,
    excerpt: e.excerpt,
    image: { src: e.image.src, alt: e.image.alt },
    body: e.body,
    gallery: [],
    published: true,
  };
}

export function getArticulosForEdit(
  doc: CmsDocument,
  fallback: Articulo[],
): { items: CmsArticulo[]; hidden: string[] } {
  const hidden = [...(doc.sections.articulosHidden ?? [])];
  const hiddenSet = new Set(hidden);
  const cmsBySlug = new Map(
    (doc.sections.articulos ?? []).map((a) => [a.slug, a]),
  );
  const items: CmsArticulo[] = [];
  const seen = new Set<string>();

  for (const a of fallback) {
    if (hiddenSet.has(a.slug)) continue;
    items.push(cmsBySlug.get(a.slug) ?? articuloToCms(a));
    seen.add(a.slug);
  }
  for (const a of doc.sections.articulos ?? []) {
    if (!seen.has(a.slug) && !hiddenSet.has(a.slug)) {
      items.push(a);
    }
  }
  return { items, hidden };
}

export function getEventosForEdit(
  doc: CmsDocument,
  fallback: EventoItem[],
): { items: CmsEvento[]; hidden: string[] } {
  const hidden = [...(doc.sections.eventosHidden ?? [])];
  const hiddenSet = new Set(hidden);
  const cmsBySlug = new Map((doc.sections.eventos ?? []).map((e) => [e.slug, e]));
  const items: CmsEvento[] = [];
  const seen = new Set<string>();

  for (const e of fallback) {
    if (hiddenSet.has(e.slug)) continue;
    items.push(cmsBySlug.get(e.slug) ?? eventoToCms(e));
    seen.add(e.slug);
  }
  for (const e of doc.sections.eventos ?? []) {
    if (!seen.has(e.slug) && !hiddenSet.has(e.slug)) {
      items.push(e);
    }
  }
  return { items, hidden };
}

export function buildDocWithArticulos(
  base: CmsDocument,
  items: CmsArticulo[],
  hidden: string[],
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      articulos: items,
      articulosHidden: hidden,
    },
  };
}

export function buildDocWithEventos(
  base: CmsDocument,
  items: CmsEvento[],
  hidden: string[],
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      eventos: items,
      eventosHidden: hidden,
    },
  };
}

/** Fusiona borradores nuevos de crónicas sin duplicar slugs. */
export function appendEventoDraftsToDoc(
  doc: CmsDocument,
  drafts: CmsEvento[],
): CmsDocument {
  if (drafts.length === 0) return doc;
  const existing = new Set((doc.sections.eventos ?? []).map((e) => e.slug));
  const merged = [
    ...(doc.sections.eventos ?? []),
    ...drafts.filter((d) => !existing.has(d.slug)),
  ];
  return {
    ...doc,
    sections: {
      ...doc.sections,
      eventos: merged,
    },
  };
}

export function medioToCms(m: MedioItem): CmsMedioItem {
  return {
    id: m.id,
    title: m.title,
    outlet: m.outlet,
    kind: m.kind,
    people: m.people,
    date: m.date,
    excerpt: m.excerpt,
    url: m.url ?? "",
    image: m.image
      ? { src: m.image.src, alt: m.image.alt }
      : undefined,
  };
}

export function cmsToMedio(m: CmsMedioItem): MedioItem {
  return {
    id: m.id,
    title: m.title,
    outlet: m.outlet,
    kind: m.kind,
    people: m.people,
    date: m.date,
    excerpt: m.excerpt,
    url: m.url,
    image: m.image
      ? { src: m.image.src, alt: m.image.alt }
      : undefined,
  };
}

export function getMediosForEdit(
  doc: CmsDocument,
  fallback: MedioItem[],
): { items: CmsMedioItem[]; hidden: string[] } {
  const hidden = [...(doc.sections.mediosHidden ?? [])];
  const hiddenSet = new Set(hidden);
  const cmsById = new Map(
    (doc.sections.medios ?? []).map((m) => [m.id, m]),
  );
  const items: CmsMedioItem[] = [];
  const seen = new Set<string>();

  for (const m of fallback) {
    if (hiddenSet.has(m.id)) continue;
    items.push(cmsById.get(m.id) ?? medioToCms(m));
    seen.add(m.id);
  }
  for (const m of doc.sections.medios ?? []) {
    if (!seen.has(m.id) && !hiddenSet.has(m.id)) {
      items.push(m);
    }
  }
  return { items, hidden };
}

export function buildDocWithMedios(
  base: CmsDocument,
  items: CmsMedioItem[],
  hidden: string[],
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      medios: items,
      mediosHidden: hidden,
    },
  };
}

export function viajeToCms(v: ViajeDestino): CmsViaje {
  return {
    slug: v.slug,
    categoria: v.categoria,
    title: v.title,
    location: v.location,
    duration: v.duration,
    excerpt: v.excerpt,
    image: { src: v.image.src, alt: v.image.alt },
    body: v.body,
    highlights: v.highlights,
    proximaFecha: v.proximaFecha,
    link: v.link,
    soloEnlace: v.soloEnlace,
  };
}

export function getViajesForEdit(
  doc: CmsDocument,
  fallback: ViajeDestino[],
): { items: CmsViaje[]; hidden: string[] } {
  const hidden = [...(doc.sections.viajesHidden ?? [])];
  const hiddenSet = new Set(hidden);
  const cmsByKey = new Map(
    (doc.sections.viajes ?? []).map((v) => [viajeKey(v), v]),
  );
  const items: CmsViaje[] = [];
  const seen = new Set<string>();

  for (const v of fallback) {
    const key = viajeKey(v);
    if (hiddenSet.has(key)) continue;
    items.push(cmsByKey.get(key) ?? viajeToCms(v));
    seen.add(key);
  }
  for (const v of doc.sections.viajes ?? []) {
    const key = viajeKey(v);
    if (!seen.has(key) && !hiddenSet.has(key)) {
      items.push(v);
    }
  }
  return { items, hidden };
}

export function buildDocWithViajes(
  base: CmsDocument,
  items: CmsViaje[],
  hidden: string[],
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      viajes: items,
      viajesHidden: hidden,
    },
  };
}

/** URL amigable: minúsculas, guiones, números (p. ej. 12-formas-de-reflexionar). */
export function newSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Limpia un slug escrito a mano (solo a-z, 0-9 y guiones). */
export function sanitizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(
  title: string,
  existing: string[],
  except?: string,
): string {
  const taken = new Set(existing.filter((s) => s !== except));
  const base = newSlug(title) || "entrada";
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Solo actualizar el slug automáticamente si aún coincide con el título anterior. */
export function shouldAutoUpdateSlug(slug: string, title: string) {
  const auto = newSlug(title);
  return !auto || slug === auto;
}

export function ensureUniqueSlug(
  desired: string,
  existing: string[],
  except?: string,
): string {
  const taken = new Set(existing.filter((s) => s !== except));
  const base = sanitizeSlug(desired) || newSlug(desired) || "entrada";
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}


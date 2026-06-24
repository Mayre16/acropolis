import type { Articulo } from "@/lib/articulos";
import type { EventoItem } from "@/lib/eventos";
import type { MedioItem } from "@/lib/medios";
import type { ViajeDestino } from "@/lib/viajes";
import { viajeKey } from "@/lib/viajes";
import type { VenueLocation } from "@/lib/locations";
import { cmsToVenue } from "@/lib/cms/venues-edit";
import acropolisPublished from "@/data/acropolis/published.json";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type {
  CmsArticulo,
  CmsDocument,
  CmsEvento,
  CmsMedioItem,
  CmsMedia,
  CmsViaje,
} from "@/lib/cms/types";
import {
  eventoCategoryLabel,
  mergeSeoTags,
  normalizeCmsEventoCategory,
  parseLegacyEventoCategory,
} from "@/lib/agenda-publish-categories";
import type { AgendaCategory } from "@/lib/agenda";
import { isEventoPublished } from "@/lib/agenda-evento";

function cmsMedia(m: CmsMedia) {
  return {
    src: resolveCmsMediaUrl(m.src) ?? m.src,
    alt: m.alt,
    credit: m.credit,
  };
}

export function cmsToArticulo(a: CmsArticulo): Articulo {
  return {
    slug: a.slug,
    title: a.title,
    author: a.author,
    date: a.date,
    readingTime: a.readingTime,
    category: a.category,
    excerpt: a.excerpt,
    image: cmsMedia(a.image),
    body: a.body,
    featured: a.featured,
  };
}

export function cmsToEvento(e: CmsEvento): EventoItem {
  const categoryId = normalizeCmsEventoCategory(e.category);
  return {
    slug: e.slug,
    title: e.title,
    date: e.date,
    category: eventoCategoryLabel(categoryId),
    categoryId,
    seoTags: mergeSeoTags(categoryId, e.seoTags),
    excerpt: e.excerpt,
    image: cmsMedia(e.image),
    body: e.body,
  };
}

function enrichStaticEvento(e: EventoItem): EventoItem {
  const categoryId = e.categoryId ?? parseLegacyEventoCategory(e.category);
  return {
    ...e,
    categoryId,
    category: eventoCategoryLabel(categoryId),
    seoTags: mergeSeoTags(categoryId, e.seoTags),
  };
}

export function mergeArticulos(
  code: Articulo[],
  cms: CmsDocument | null | undefined,
): Articulo[] {
  const hidden = new Set(cms?.sections.articulosHidden ?? []);
  const map = new Map<string, Articulo>();
  for (const a of code) {
    if (!hidden.has(a.slug)) map.set(a.slug, a);
  }
  for (const a of cms?.sections.articulos ?? []) {
    map.set(a.slug, cmsToArticulo(a));
  }
  return Array.from(map.values());
}

export function mergeEventos(
  code: EventoItem[],
  cms: CmsDocument | null | undefined,
): EventoItem[] {
  const hidden = new Set(cms?.sections.eventosHidden ?? []);
  const map = new Map<string, EventoItem>();
  for (const e of code) {
    if (!hidden.has(e.slug)) map.set(e.slug, enrichStaticEvento(e));
  }
  for (const e of cms?.sections.eventos ?? []) {
    if (!isEventoPublished(e)) continue;
    map.set(e.slug, cmsToEvento(e));
  }
  return Array.from(map.values());
}

export function mergeMedios(
  code: MedioItem[],
  cms: CmsDocument | null | undefined,
): MedioItem[] {
  const hidden = new Set(cms?.sections.mediosHidden ?? []);
  const map = new Map<string, MedioItem>();
  for (const m of code) {
    if (!hidden.has(m.id)) map.set(m.id, m);
  }
  for (const m of cms?.sections.medios ?? []) {
    map.set(m.id, cmsToMedio(m));
  }
  return Array.from(map.values());
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

export function cmsToViaje(v: CmsViaje): ViajeDestino {
  return {
    slug: v.slug,
    categoria: v.categoria,
    title: v.title,
    location: v.location,
    duration: v.duration,
    excerpt: v.excerpt,
    image: cmsMedia(v.image),
    body: v.body,
    highlights: v.highlights,
    proximaFecha: v.proximaFecha,
    link: v.link,
    soloEnlace: v.soloEnlace,
  };
}

export function mergeViajes(
  code: ViajeDestino[],
  cms: CmsDocument | null | undefined,
): ViajeDestino[] {
  const hidden = new Set(cms?.sections.viajesHidden ?? []);
  const map = new Map<string, ViajeDestino>();
  for (const v of code) {
    if (!hidden.has(viajeKey(v))) map.set(viajeKey(v), v);
  }
  for (const v of cms?.sections.viajes ?? []) {
    map.set(viajeKey(v), cmsToViaje(v));
  }
  return Array.from(map.values());
}

export function mergeVenues(
  code: VenueLocation[],
  cms: CmsDocument | null | undefined,
): VenueLocation[] {
  const publishedFallback: CmsDocument | null =
    cms ??
    ({
      version: 1,
      site: "acropolis",
      updatedAt: "",
      sections: acropolisPublished.sections,
    } as CmsDocument);
  const hidden = new Set(publishedFallback?.sections.venuesHidden ?? []);
  const map = new Map<string, VenueLocation>();
  for (const v of code) {
    if (!hidden.has(v.id)) map.set(v.id, v);
  }
  for (const v of publishedFallback?.sections.venues ?? []) {
    map.set(v.id, cmsToVenue(v));
  }
  return Array.from(map.values());
}

export function getCmsGalleryArticulo(
  cms: CmsDocument | null | undefined,
  slug: string,
): CmsMedia[] {
  const gallery =
    cms?.sections.articulos?.find((a) => a.slug === slug)?.gallery ?? [];
  return gallery.map(cmsMedia);
}

export function getCmsGalleryEvento(
  cms: CmsDocument | null | undefined,
  slug: string,
): CmsMedia[] {
  const gallery =
    cms?.sections.eventos?.find((e) => e.slug === slug)?.gallery ?? [];
  return gallery.map(cmsMedia);
}

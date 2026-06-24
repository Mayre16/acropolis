import { SALONES, type LayoutKind, type Salon } from "@/lib/salones";
import type { CmsDocument, CmsMedia, CmsSalon, CmsSalonesPage } from "@/lib/cms/types";

export function salonToCms(s: Salon): CmsSalon {
  return {
    id: s.id,
    name: s.name,
    sede: s.sede,
    city: s.city,
    summary: s.summary,
    featuredLayout: s.featuredLayout,
    capacities: { ...s.capacities },
    image: { src: s.image.src, alt: s.image.alt },
  };
}

export function cmsToSalon(s: CmsSalon): Salon {
  return {
    id: s.id,
    name: s.name,
    sede: s.sede,
    city: s.city as Salon["city"],
    summary: s.summary,
    featuredLayout: s.featuredLayout,
    capacities: { ...s.capacities },
    image: { src: s.image.src, alt: s.image.alt },
  };
}

import type { SalonSede } from "@/lib/salones";

export type AddSalonOptions = {
  /** Inserta justo después de este salón (misma sede). */
  afterId?: string;
  /** Inserta al inicio de la sede (primer salón de esa sede). */
  atStartOfSede?: SalonSede;
  /** Sede por defecto si se añade al final sin referencia. */
  sede?: SalonSede;
};

export function newSalonId() {
  return `salon-${Date.now().toString(36)}`;
}

export function getSalonesForEdit(
  doc: CmsDocument | null | undefined,
  fallback: Salon[] = SALONES,
): { items: CmsSalon[]; hidden: string[] } {
  const hidden = [...(doc?.sections.salonesHidden ?? [])];
  const hiddenSet = new Set(hidden);
  const cmsById = new Map((doc?.sections.salones ?? []).map((s) => [s.id, s]));
  const items: CmsSalon[] = [];
  const seen = new Set<string>();

  for (const s of fallback) {
    if (hiddenSet.has(s.id)) continue;
    items.push(cmsById.get(s.id) ?? salonToCms(s));
    seen.add(s.id);
  }
  for (const s of doc?.sections.salones ?? []) {
    if (!seen.has(s.id) && !hiddenSet.has(s.id)) {
      items.push(s);
    }
  }
  return { items, hidden };
}

export function mergeSalones(
  doc: CmsDocument | null | undefined,
  fallback: Salon[] = SALONES,
): Salon[] {
  return getSalonesForEdit(doc, fallback).items.map(cmsToSalon);
}

export function buildDocWithSalones(
  base: CmsDocument,
  items: CmsSalon[],
  page?: CmsSalonesPage,
  hidden?: string[],
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      salones: items,
      salonesHidden: hidden ?? base.sections.salonesHidden ?? [],
      ...(page !== undefined ? { salonesPage: page } : {}),
    },
  };
}

export const DEFAULT_SALONES_PAGE: CmsSalonesPage = {
  eyebrow: "Espacios",
  title: "Alquiler de salones para talleres y cursos",
  intro:
    "Salones sobrios y elegantes en nuestras sedes de Santo Domingo, con distintas disposiciones según el tipo de actividad. Ideal para cursos, charlas, formaciones corporativas y encuentros formativos.",
};

export function resolveSalonesPage(
  doc: CmsDocument | null | undefined,
): CmsSalonesPage {
  return { ...DEFAULT_SALONES_PAGE, ...doc?.sections.salonesPage };
}

export function patchSalonImage(salon: CmsSalon, image: CmsMedia): CmsSalon {
  return { ...salon, image };
}

export function patchSalonLayout(
  salon: CmsSalon,
  featuredLayout: LayoutKind,
): CmsSalon {
  return { ...salon, featuredLayout };
}

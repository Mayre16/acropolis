import { SALONES, type LayoutKind, type Salon } from "@/lib/salones";
import type {
  CmsCivisSalonesPage,
  CmsDocument,
  CmsMedia,
  CmsSalon,
} from "@/lib/cms/types";

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

/** Temporal: Naco y Santiago ocultos hasta que el editor CMS pueda publicar hides. */
const TEMP_SALONES_SEDES_HIDDEN = ["Naco", "Santiago"] as const;

export function getSalonesForEdit(
  doc: CmsDocument | null | undefined,
  fallback: Salon[] = SALONES,
): { items: CmsSalon[]; hidden: string[]; sedesHidden: string[] } {
  const hidden = [
    ...(((doc?.sections as { salonesHidden?: string[] } | undefined)
      ?.salonesHidden ?? []) as string[]),
  ];
  const sedesHidden = [
    ...new Set([
      ...(((doc?.sections as { salonesSedesHidden?: string[] } | undefined)
        ?.salonesSedesHidden ?? []) as string[]),
      ...TEMP_SALONES_SEDES_HIDDEN,
    ]),
  ];
  const hiddenSet = new Set(hidden);
  const cmsById = new Map(
    (doc?.sections.salones ?? []).map((s) => [s.id, s]),
  );
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
  return { items, hidden, sedesHidden };
}

export function mergeSalones(
  doc: CmsDocument | null | undefined,
  fallback: Salon[] = SALONES,
): Salon[] {
  const { items, sedesHidden } = getSalonesForEdit(doc, fallback);
  const sedesHiddenSet = new Set(sedesHidden);
  return items
    .map(cmsToSalon)
    .filter((s) => !sedesHiddenSet.has(s.sede));
}

export function buildAcropolisDocWithSalones(
  base: CmsDocument,
  items: CmsSalon[],
  hidden?: string[],
  sedesHidden?: string[],
): CmsDocument {
  const sections = base.sections as CmsDocument["sections"] & {
    salonesHidden?: string[];
    salonesSedesHidden?: string[];
  };
  return {
    ...base,
    sections: {
      ...sections,
      salones: items,
      salonesHidden: hidden ?? sections.salonesHidden ?? [],
      salonesSedesHidden: sedesHidden ?? sections.salonesSedesHidden ?? [],
    },
  };
}

export function buildCivisDocWithSalonesPage(
  base: CmsDocument,
  page: CmsCivisSalonesPage,
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      civisSalonesPage: page,
    },
  };
}

export const DEFAULT_CIVIS_SALONES_PAGE: CmsCivisSalonesPage = {
  eyebrow: "Espacios",
  title: "¿Necesitas un espacio para tus talleres o reuniones?",
  lede:
    "Además de impartir formación in company, ponemos a disposición salones sobrios y elegantes en nuestras sedes de Santo Domingo — ideales para talleres, cursos, charlas y reuniones de equipo que usted organice.",
  catalogTitle: "Catálogo de salones",
  catalogIntro:
    "Capacidades por disposición: butacas, mesas tipo escuela o herradura.",
};

export function resolveCivisSalonesPage(
  doc: CmsDocument | null | undefined,
): CmsCivisSalonesPage {
  return { ...DEFAULT_CIVIS_SALONES_PAGE, ...doc?.sections.civisSalonesPage };
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

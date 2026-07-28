import type { CmsDocument } from "@/lib/cms/types";
import {
  sanitizeHeroCarousels,
  type CmsHeroCarousels,
} from "@/lib/cms/hero-carousel-edit";

let snapshot: CmsHeroCarousels = {};

export function setHeroCarouselsSnapshot(carousels: CmsHeroCarousels) {
  snapshot = sanitizeHeroCarousels(carousels);
}

export function getHeroCarouselsSnapshot(): CmsHeroCarousels {
  return snapshot;
}

/** Incluye carruseles editados en el borrador al guardar desde otro contexto CMS. */
export function mergeHeroCarouselsIntoDoc(doc: CmsDocument): CmsDocument {
  if (!snapshot || Object.keys(snapshot).length === 0) return doc;
  return {
    ...doc,
    sections: {
      ...doc.sections,
      heroCarousels: {
        ...doc.sections.heroCarousels,
        ...snapshot,
      },
    },
  };
}

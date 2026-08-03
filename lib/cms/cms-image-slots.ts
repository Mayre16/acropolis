/**
 * Tamaños estándar de fotos CMS (px) — espejo del editor.
 */
export type CmsImageSlotId =
  | "homeHero"
  | "pageHero"
  | "card"
  | "gallery"
  | "thumb";

export type CmsImageSlot = {
  id: CmsImageSlotId;
  label: string;
  recommended: { w: number; h: number };
  max: { w: number; h: number };
  aspectHint: string;
  note?: string;
};

export const CMS_IMAGE_SLOTS: Record<CmsImageSlotId, CmsImageSlot> = {
  homeHero: {
    id: "homeHero",
    label: "Header / landing (pantalla completa)",
    recommended: { w: 1600, h: 900 },
    max: { w: 1920, h: 1080 },
    aspectHint: "16:9",
    note: "Fondo del inicio. Recorta a 1600×900 antes de subir.",
  },
  pageHero: {
    id: "pageHero",
    label: "Header de página / carrusel",
    recommended: { w: 1400, h: 788 },
    max: { w: 1600, h: 900 },
    aspectHint: "16:9",
    note: "Cabeceras de Filosofía, Cultura, etc.",
  },
  card: {
    id: "card",
    label: "Tarjeta / listado",
    recommended: { w: 800, h: 500 },
    max: { w: 1200, h: 750 },
    aspectHint: "8:5",
    note: "Agenda, talleres, salones, crónicas.",
  },
  gallery: {
    id: "gallery",
    label: "Galería",
    recommended: { w: 1200, h: 750 },
    max: { w: 1600, h: 1000 },
    aspectHint: "8:5",
  },
  thumb: {
    id: "thumb",
    label: "Miniatura",
    recommended: { w: 640, h: 640 },
    max: { w: 800, h: 800 },
    aspectHint: "1:1",
  },
};

export const CMS_IMAGE_MAX_PX = {
  w: CMS_IMAGE_SLOTS.homeHero.max.w,
  h: CMS_IMAGE_SLOTS.homeHero.max.h,
} as const;

export function cmsImageSlotHint(slotId: CmsImageSlotId = "card"): string {
  const s = CMS_IMAGE_SLOTS[slotId];
  const rec = `${s.recommended.w}×${s.recommended.h}`;
  const max = `${s.max.w}×${s.max.h}`;
  const base = `Tamaño: ${rec} px (${s.aspectHint}). Máximo ${max} px. WebP < 100 KB.`;
  return s.note ? `${base} ${s.note}` : base;
}

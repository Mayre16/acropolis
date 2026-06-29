import type { HeroImage } from "@/lib/hero-images";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  ARTICULOS_HERO_IMAGES,
  AGENDA_HERO_IMAGES,
  CULTURA_HERO_IMAGES,
  CURSOS_HERO_IMAGES,
  ESFERA_HERO_IMAGES,
  EVENTOS_HERO_IMAGES,
  FILOSOFIA_HERO_IMAGES,
  QUIENES_SOMOS_HERO_IMAGES,
  RELACIONES_HERO_IMAGES,
  VOLUNTARIADO_HERO_IMAGES,
} from "@/lib/hero-images";
import type { CmsDocument } from "@/lib/cms/types";

export type CmsHeroCarouselKey =
  | "filosofia"
  | "cultura"
  | "voluntariado"
  | "cursos"
  | "eventos"
  | "articulos"
  | "agenda"
  | "quienesSomos"
  | "relaciones"
  | "esfera";

export type CmsHeroCarouselItem = {
  id: string;
  src: string;
  alt: string;
  media?: "image" | "video";
  poster?: string;
};

export type CmsHeroCarousels = Partial<
  Record<CmsHeroCarouselKey, CmsHeroCarouselItem[]>
>;

export const HERO_CAROUSEL_DEFAULTS: Record<CmsHeroCarouselKey, HeroImage[]> =
  {
    filosofia: FILOSOFIA_HERO_IMAGES,
    cultura: CULTURA_HERO_IMAGES,
    voluntariado: VOLUNTARIADO_HERO_IMAGES,
    cursos: CURSOS_HERO_IMAGES,
    eventos: EVENTOS_HERO_IMAGES,
    articulos: ARTICULOS_HERO_IMAGES,
    agenda: AGENDA_HERO_IMAGES,
    quienesSomos: QUIENES_SOMOS_HERO_IMAGES,
    relaciones: RELACIONES_HERO_IMAGES,
    esfera: ESFERA_HERO_IMAGES,
  };

export const HERO_CAROUSEL_LABELS: Record<CmsHeroCarouselKey, string> = {
  filosofia: "Filosofía",
  cultura: "Cultura",
  voluntariado: "Voluntariado",
  cursos: "Cursos",
  eventos: "Eventos",
  articulos: "Artículos",
  agenda: "Agenda",
  quienesSomos: "Quiénes somos",
  relaciones: "Relaciones institucionales",
  esfera: "Punto Focal Esfera",
};

export function newHeroSlideId() {
  return `hero-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function itemsFromHeroImages(images: HeroImage[]): CmsHeroCarouselItem[] {
  return images.map((img, i) => ({
    id: `default-${i}`,
    src: img.src,
    alt: img.alt,
    media: img.media,
    poster: img.poster,
  }));
}

export function isValidHeroSlide(item: CmsHeroCarouselItem): boolean {
  return Boolean(item.src?.trim());
}

export function toHeroImage(item: CmsHeroCarouselItem): HeroImage | null {
  if (!isValidHeroSlide(item)) return null;
  return {
    src: resolveCmsMediaUrl(item.src) ?? item.src,
    alt: item.alt,
    media: item.media,
    poster: item.poster
      ? resolveCmsMediaUrl(item.poster) ?? item.poster
      : undefined,
  };
}

export function filterValidHeroSlides(
  items: CmsHeroCarouselItem[],
): CmsHeroCarouselItem[] {
  return items.filter(isValidHeroSlide);
}

export function sanitizeHeroCarousels(
  carousels: CmsHeroCarousels,
): CmsHeroCarousels {
  const out: CmsHeroCarousels = {};
  for (const key of Object.keys(carousels) as CmsHeroCarouselKey[]) {
    const slides = filterValidHeroSlides(carousels[key] ?? []);
    if (slides.length) out[key] = slides;
  }
  return out;
}

export function resolveHeroCarouselItems(
  doc: CmsDocument | null | undefined,
  key: CmsHeroCarouselKey,
): CmsHeroCarouselItem[] {
  const stored = doc?.sections.heroCarousels?.[key];
  if (stored?.length) return stored;
  return itemsFromHeroImages(HERO_CAROUSEL_DEFAULTS[key]);
}

export function resolveHeroCarouselImages(
  doc: CmsDocument | null | undefined,
  key: CmsHeroCarouselKey,
): HeroImage[] {
  return resolveHeroCarouselItems(doc, key)
    .map(toHeroImage)
    .filter((img): img is HeroImage => img !== null);
}

export function loadHeroCarouselsFromDoc(
  draft: CmsDocument,
): CmsHeroCarousels {
  const out: CmsHeroCarousels = {};
  for (const key of Object.keys(HERO_CAROUSEL_DEFAULTS) as CmsHeroCarouselKey[]) {
    const stored = draft.sections.heroCarousels?.[key];
    if (stored?.length) out[key] = stored;
  }
  return out;
}

export function getHeroSlidesForKey(
  carousels: CmsHeroCarousels,
  key: CmsHeroCarouselKey,
): CmsHeroCarouselItem[] {
  return carousels[key] ?? itemsFromHeroImages(HERO_CAROUSEL_DEFAULTS[key]);
}

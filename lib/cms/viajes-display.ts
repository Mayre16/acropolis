"use client";

import { useViajesCmsEdit } from "@/components/cms/ViajesCmsEditContext";
import { useCulturaCmsEdit } from "@/components/cms/CulturaCmsEditContext";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type { CmsViajeCategoriaPage, CmsViajesPage } from "@/lib/cms/types";
import {
  VIAJE_CATEGORIAS,
  VIAJE_PROMO_CARD_TEXT,
  type ViajeCategoriaSlug,
} from "@/lib/viajes";

export type ViajeCategoriaDisplay = {
  eyebrow: string;
  title: string;
  lede: string;
  intro: string;
  cardText: string;
  heroImage: { src: string; alt: string };
};

function pickViajesPage(
  published?: CmsViajesPage | null,
  draft?: CmsViajesPage | null,
  editReady?: boolean,
): CmsViajesPage | null {
  if (editReady && draft) return draft;
  if (isCmsEnabled() && published) return published;
  return null;
}

function resolveCategoriaPage(
  categoria: ViajeCategoriaSlug,
  page?: CmsViajeCategoriaPage | null,
): ViajeCategoriaDisplay {
  const merged = mergeViajeCategoriaPage(categoria, page);
  const heroSrc =
    resolveCmsMediaUrl(merged.heroImage?.src) ??
    merged.heroImage?.src ??
    VIAJE_CATEGORIAS[categoria].heroImage.src;

  return {
    eyebrow: merged.heroEyebrow ?? "Viajes culturales",
    title: merged.heroTitle ?? VIAJE_CATEGORIAS[categoria].title,
    lede: merged.heroLede ?? VIAJE_CATEGORIAS[categoria].lede,
    intro: merged.intro ?? VIAJE_CATEGORIAS[categoria].intro,
    cardText: merged.cardText ?? VIAJE_PROMO_CARD_TEXT[categoria],
    heroImage: {
      src: heroSrc,
      alt: merged.heroImage?.alt ?? VIAJE_CATEGORIAS[categoria].heroImage.alt,
    },
  };
}

/** Valores por defecto de cada categoría (locales / internacionales). */
export function defaultViajeCategoriaPage(
  categoria: ViajeCategoriaSlug,
): CmsViajeCategoriaPage {
  const cat = VIAJE_CATEGORIAS[categoria];
  return {
    heroEyebrow: "Viajes culturales",
    heroTitle: cat.title,
    heroLede: cat.lede,
    intro: cat.intro,
    cardText: VIAJE_PROMO_CARD_TEXT[categoria],
    heroImage: { src: cat.heroImage.src, alt: cat.heroImage.alt },
  };
}

/** Combina defaults del sitio con overrides guardados en el CMS. */
export function mergeViajeCategoriaPage(
  categoria: ViajeCategoriaSlug,
  override?: CmsViajeCategoriaPage | null,
): CmsViajeCategoriaPage {
  const base = defaultViajeCategoriaPage(categoria);
  if (!override) return base;
  return {
    ...base,
    ...override,
    heroImage: override.heroImage
      ? { ...base.heroImage, ...override.heroImage }
      : base.heroImage,
  };
}

export function useViajeCategoriaDisplay(categoria: ViajeCategoriaSlug) {
  const cms = useCmsDocument();
  const viajesEdit = useViajesCmsEdit();
  const culturaEdit = useCulturaCmsEdit();
  const page = pickViajesPage(
    cms?.sections.viajesPage,
    viajesEdit?.viajesPage ?? culturaEdit?.viajesPage,
    viajesEdit?.ready || culturaEdit?.ready,
  );
  return resolveCategoriaPage(categoria, page?.[categoria]);
}

export const viajeCardSelectedId = (categoria: ViajeCategoriaSlug) =>
  `viaje-${categoria}`;

export function parseViajeCardSelectedId(
  id: string,
): ViajeCategoriaSlug | null {
  if (id === "viaje-locales") return "locales";
  if (id === "viaje-internacionales") return "internacionales";
  return null;
}

"use client";

import { useCmsDocument } from "@/lib/cms/provider";
import { useHeroCarouselCmsEdit } from "@/components/cms/HeroCarouselCmsEditContext";
import {
  HERO_CAROUSEL_DEFAULTS,
  heroImagesForKey,
  toHeroImage,
  type CmsHeroCarouselKey,
} from "@/lib/cms/hero-carousel-edit";
import type { HeroImage } from "@/lib/hero-images";

function resolveFallbackImages(
  key: CmsHeroCarouselKey,
  fallback?: HeroImage[],
): HeroImage[] {
  const base = fallback ?? HERO_CAROUSEL_DEFAULTS[key];
  return base
    .map((img) =>
      toHeroImage({
        id: "fallback",
        src: img.src,
        alt: img.alt,
        media: img.media,
        poster: img.poster,
      }),
    )
    .filter((img): img is HeroImage => img !== null);
}

/** Imágenes del carrusel hero: CMS publicado o borrador en edición. */
export function useHeroCarouselImages(
  key: CmsHeroCarouselKey,
  fallback?: HeroImage[],
): HeroImage[] {
  const cms = useCmsDocument();
  const edit = useHeroCarouselCmsEdit();

  if (edit?.ready) {
    const images = heroImagesForKey(edit.carousels, key);
    return images.length ? images : resolveFallbackImages(key, fallback);
  }

  const fromCms = cms?.sections.heroCarousels?.[key];
  if (fromCms?.length) {
    const images = fromCms
      .map(toHeroImage)
      .filter((img): img is HeroImage => img !== null);
    if (images.length) return images;
  }
  return resolveFallbackImages(key, fallback);
}

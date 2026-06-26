import { HOME_HERO_BACKGROUND } from "@/lib/hero-images";

export type HomeHeroBackground = {
  src: string;
  alt: string;
};

/** Ruta estática del repo — no debe persistirse en el JSON del CMS. */
export function isRepoHomeHeroSrc(src?: string | null): boolean {
  const trimmed = src?.trim();
  if (!trimmed) return true;
  return (
    trimmed === HOME_HERO_BACKGROUND.src ||
    trimmed.endsWith("/hero-voluntarios-chalecos.webp")
  );
}

/**
 * Prioridad de visualización:
 * 1. Foto del CMS (borrador/publicado) si tiene `src` distinto del default del repo
 * 2. Foto fija del repo (`/img/home/hero-voluntarios-chalecos.webp`)
 */
export function pickHomeHeroBackground(
  cms?: { src?: string; alt?: string } | null,
): HomeHeroBackground {
  const cmsSrc = cms?.src?.trim();
  if (cmsSrc && !isRepoHomeHeroSrc(cmsSrc)) {
    return {
      src: cmsSrc,
      alt: cms?.alt?.trim() || HOME_HERO_BACKGROUND.alt,
    };
  }
  return {
    src: HOME_HERO_BACKGROUND.src,
    alt: HOME_HERO_BACKGROUND.alt,
  };
}

/** Sustituye la ruta al subir o editar el campo URL (no merge silencioso con la anterior). */
export function patchHomeHeroBackground(
  current: { src?: string; alt?: string } | undefined,
  patch: { image?: string; imageAlt?: string },
): { src?: string; alt?: string } | undefined {
  const src =
    patch.image !== undefined ? patch.image.trim() : (current?.src ?? "").trim();
  const alt =
    patch.imageAlt !== undefined
      ? patch.imageAlt
      : current?.alt?.trim() || HOME_HERO_BACKGROUND.alt;

  if (!src || isRepoHomeHeroSrc(src)) {
    return alt !== HOME_HERO_BACKGROUND.alt ? { src: "", alt } : undefined;
  }
  return { src, alt };
}

/** Al guardar borrador: no escribir la ruta del repo en el CMS. */
export function normalizeHomeHeroBackgroundForSave(
  background?: { src?: string; alt?: string } | null,
): { src?: string; alt?: string } | undefined {
  if (!background) return undefined;
  const src = background.src?.trim();
  if (!src || isRepoHomeHeroSrc(src)) return undefined;
  return {
    src,
    alt: background.alt?.trim() || HOME_HERO_BACKGROUND.alt,
  };
}

export function normalizeHomeHeroSection<
  T extends {
    h1?: string;
    h2?: string;
    lede?: string;
    background?: { src?: string; alt?: string };
  },
>(hero: T): T {
  const normalizedBg = normalizeHomeHeroBackgroundForSave(hero.background);
  if (normalizedBg) {
    return { ...hero, background: normalizedBg };
  }
  const { background: _removed, ...rest } = hero;
  return rest as T;
}

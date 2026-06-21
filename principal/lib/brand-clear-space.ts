import type { BrandLockupId } from "@/lib/brand-assets";

/**
 * Guía OINA v01/2025 — zona de respeto = altura del capitel jónico (columna del anagrama).
 * Referencia lockup 307×199 px.
 */
export type BrandClearSpaceVariant = "header" | "stacked" | "monogram" | "horizontal";

export const BRAND_CLEAR_SPACE_RATIO: Record<BrandClearSpaceVariant, number> = {
  header: 35 / 158,
  stacked: 35 / 199,
  monogram: 35 / 115,
  horizontal: 35 / 199,
};

export function lockupClearSpaceVariant(
  lockup: BrandLockupId,
): BrandClearSpaceVariant {
  if (lockup === "na") return "header";
  if (lockup === "na-solo") return "monogram";
  return "stacked";
}

export const BRAND_DESCRIPTOR_GAP_RATIO = BRAND_CLEAR_SPACE_RATIO.stacked;
export const BRAND_DESCRIPTOR_TEXT_RATIO = 41 / 199;

export const BRAND_LOGO_HEIGHT_DEFAULT = "2.75rem";

/**
 * Lockup apilado en UI: `--brand-logo-h` = altura del anagrama + nombre.
 * Descriptor en HTML (Noto Sans 700) proporcional a la guía, mínimo legible.
 */
export const BRAND_TOP_TO_WIDTH = 2429 / 1113;
export const BRAND_DESCRIPTOR_FONT_SCALE = 11.5 / 307;
export const BRAND_DESCRIPTOR_MIN_FONT = "0.75rem";

/**
 * Wordmark «NUEVA ACRÓPOLIS» medido sobre `logo-nueva-acropolis-stacked` (2429×1113).
 * Solo para alinear el descriptor `oinadom` bajo el nombre (no bajo el anagrama).
 */
export const BRAND_WORDMARK_WIDTH_RATIO = 1461 / 2429;
export const BRAND_WORDMARK_OFFSET_RATIO = 850 / 2429;

/** Alturas del anagrama + nombre (descriptor va debajo en HTML). */
export const brandLogoHeightClass = {
  headerFilial: "[--brand-logo-h:2.35rem] sm:[--brand-logo-h:2.5rem]",
  header: "[--brand-logo-h:2.25rem] sm:[--brand-logo-h:2.4rem]",
  hero: "[--brand-logo-h:6.25rem] sm:[--brand-logo-h:7.25rem] md:[--brand-logo-h:8rem] lg:[--brand-logo-h:8.75rem]",
  footer: "[--brand-logo-h:3.5rem] sm:[--brand-logo-h:3.85rem] md:[--brand-logo-h:4.1rem]",
  footerSubmarca:
    "[--brand-logo-h:1.4rem] sm:[--brand-logo-h:1.6rem] md:[--brand-logo-h:1.75rem]",
  footerInstitutional:
    "[--brand-logo-h:3.9rem] sm:[--brand-logo-h:4.15rem] md:[--brand-logo-h:4.4rem]",
  pageHero:
    "[--brand-logo-h:2.85rem] sm:[--brand-logo-h:3.15rem] md:[--brand-logo-h:3.35rem]",
  /** PageHero con trilogo — logo dominante sobre el descriptor. */
  pageHeroTrilogo:
    "[--brand-logo-h:4.25rem] sm:[--brand-logo-h:4.85rem] md:[--brand-logo-h:5.35rem]",
  diplomadoHero:
    "[--brand-logo-h:3.75rem] sm:[--brand-logo-h:4.15rem] lg:[--brand-logo-h:4.5rem]",
  contentDigital:
    "[--brand-logo-h:4.25rem] sm:[--brand-logo-h:4.75rem] md:[--brand-logo-h:5.1rem]",
  /** Hub /contenido — oina un poco mayor que pageHero para equilibrar el descriptor. */
  contenidoHub:
    "[--brand-logo-h:3.35rem] sm:[--brand-logo-h:3.75rem] md:[--brand-logo-h:4.1rem]",
  internationalBand:
    "[--brand-logo-h:4.75rem] sm:[--brand-logo-h:5.5rem] md:[--brand-logo-h:6rem]",
  sectionStacked:
    "[--brand-logo-h:3.65rem] sm:[--brand-logo-h:4rem] md:[--brand-logo-h:4.25rem]",
  /** Quiénes somos — mitad de `sectionStacked` (referencia Civis). */
  quienesSomos:
    "[--brand-logo-h:1.825rem] sm:[--brand-logo-h:2rem] md:[--brand-logo-h:2.125rem]",
} as const;

export const brandLogoSectionGapClass = "mt-6 sm:mt-8";

export function brandLogoOuterHeightCss(lockup: BrandLockupId): string {
  const r = BRAND_CLEAR_SPACE_RATIO[lockupClearSpaceVariant(lockup)];
  return `calc(var(--brand-logo-h) * ${(1 + r * 2).toFixed(4)})`;
}

/** Estilos del descriptor HTML — una línea, proporcional pero legible. */
export function brandDescriptorStyle(
  lockup?: "oina" | "oinadom" | "trilogo" | "escuela",
  prominence: "default" | "hero" = "default",
): {
  marginTop: string;
  fontSize: string;
  letterSpacing: string;
} {
  const tracking =
    lockup === "trilogo" ? "0.06em" : lockup === "oinadom" ? "0.08em" : "0.1em";

  if (prominence === "hero") {
    return {
      marginTop: "0.3em",
      fontSize: "clamp(0.8125rem, calc(var(--brand-logo-h) * 0.055), 1.25rem)",
      letterSpacing: lockup === "oinadom" ? "0.1em" : tracking,
    };
  }

  /** oina — ancho máx. = «Nueva Acrópolis»; una línea. */
  if (lockup === "oina") {
    return {
      marginTop: "0.24em",
      fontSize: "clamp(0.5rem, calc(var(--brand-logo-h) * 0.027), 0.625rem)",
      letterSpacing: "0.038em",
    };
  }

  /** oinadom — ancho máx. = «Nueva Acrópolis»; una línea. */
  if (lockup === "oinadom") {
    return {
      marginTop: "0.24em",
      fontSize: "clamp(0.5625rem, calc(var(--brand-logo-h) * 0.03), 0.6875rem)",
      letterSpacing: "0.05em",
    };
  }

  /** trilogo — Filosofía · Cultura · Voluntariado; cabe en el ancho del nombre. */
  if (lockup === "trilogo") {
    return {
      marginTop: "0.22em",
      fontSize: "clamp(0.5rem, calc(var(--brand-logo-h) * 0.026), 0.625rem)",
      letterSpacing: "0.032em",
    };
  }

  /** escuela — descriptor en una línea, ancho máx. = «Nueva Acrópolis». */
  if (lockup === "escuela") {
    return {
      marginTop: "0.24em",
      fontSize: "clamp(0.5625rem, calc(var(--brand-logo-h) * 0.03), 0.6875rem)",
      letterSpacing: "0.05em",
    };
  }

  return {
    marginTop: "0.22em",
    fontSize:
      "clamp(0.5625rem, calc(var(--brand-logo-h) * 0.034), 0.6875rem)",
    letterSpacing: tracking,
  };
}

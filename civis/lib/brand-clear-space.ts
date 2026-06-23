import type { BrandLockupId } from "@/lib/brand-assets";

/**
 * Guía OINA v01/2025 — sincronizado con `principal/lib/brand-clear-space.ts`.
 * `--brand-logo-h` = altura del anagrama + nombre; descriptor HTML proporcional.
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

export const BRAND_TOP_TO_WIDTH = 2429 / 1113;
export const BRAND_DESCRIPTOR_FONT_SCALE = 11.5 / 307;
export const BRAND_DESCRIPTOR_MIN_FONT = "0.75rem";

/** Wordmark «NUEVA ACRÓPOLIS» sobre `logo-nueva-acropolis-stacked` (2429×1113). */
export const BRAND_WORDMARK_WIDTH_RATIO = 1461 / 2429;
export const BRAND_WORDMARK_OFFSET_RATIO = 850 / 2429;

export const brandLogoHeightClass = {
  headerFilial: "[--brand-logo-h:2.35rem] sm:[--brand-logo-h:2.5rem]",
  header: "[--brand-logo-h:2.25rem] sm:[--brand-logo-h:2.4rem]",
  hero: "[--brand-logo-h:6.25rem] sm:[--brand-logo-h:7.25rem] md:[--brand-logo-h:8rem] lg:[--brand-logo-h:8.75rem]",
  footer: "[--brand-logo-h:3.5rem] sm:[--brand-logo-h:3.85rem] md:[--brand-logo-h:4.1rem]",
  /** Footer Civis — oinadom (−2px vs tamaño anterior). */
  civisFooterOinadom:
    "[--brand-logo-h:2.375rem] sm:[--brand-logo-h:2.625rem] md:[--brand-logo-h:2.875rem]",
  footerSubmarca:
    "[--brand-logo-h:1.4rem] sm:[--brand-logo-h:1.6rem] md:[--brand-logo-h:1.75rem]",
  footerInstitutional:
    "[--brand-logo-h:3.9rem] sm:[--brand-logo-h:4.15rem] md:[--brand-logo-h:4.4rem]",
  pageHero:
    "[--brand-logo-h:2.85rem] sm:[--brand-logo-h:3.15rem] md:[--brand-logo-h:3.35rem]",
  pageHeroTrilogo:
    "[--brand-logo-h:4.25rem] sm:[--brand-logo-h:4.85rem] md:[--brand-logo-h:5.35rem]",
  diplomadoHero:
    "[--brand-logo-h:3.75rem] sm:[--brand-logo-h:4.15rem] lg:[--brand-logo-h:4.5rem]",
  contentDigital:
    "[--brand-logo-h:4.25rem] sm:[--brand-logo-h:4.75rem] md:[--brand-logo-h:5.1rem]",
  contenidoHub:
    "[--brand-logo-h:3.35rem] sm:[--brand-logo-h:3.75rem] md:[--brand-logo-h:4.1rem]",
  internationalBand:
    "[--brand-logo-h:4.75rem] sm:[--brand-logo-h:5.5rem] md:[--brand-logo-h:6rem]",
  sectionStacked:
    "[--brand-logo-h:3.65rem] sm:[--brand-logo-h:4rem] md:[--brand-logo-h:4.25rem]",
  quienesSomos: "[--brand-logo-h:3.875rem]",
  /** Identificador Civis a ancho de contenedor (header / footer). */
  civisMarkSite: "w-full h-auto max-w-full",
} as const;

export const brandLogoSectionGapClass = "mt-6 sm:mt-8";

export function brandLogoOuterHeightCss(lockup: BrandLockupId): string {
  const r = BRAND_CLEAR_SPACE_RATIO[lockupClearSpaceVariant(lockup)];
  return `calc(var(--brand-logo-h) * ${(1 + r * 2).toFixed(4)})`;
}

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

  if (lockup === "oina") {
    return {
      marginTop: "0.24em",
      fontSize: "clamp(0.5rem, calc(var(--brand-logo-h) * 0.027), 0.625rem)",
      letterSpacing: "0.038em",
    };
  }

  if (lockup === "oinadom") {
    return {
      marginTop: "0.24em",
      fontSize: "clamp(0.5625rem, calc(var(--brand-logo-h) * 0.03), 0.6875rem)",
      letterSpacing: "0.05em",
    };
  }

  if (lockup === "trilogo") {
    return {
      marginTop: "0.22em",
      fontSize: "clamp(0.5rem, calc(var(--brand-logo-h) * 0.026), 0.625rem)",
      letterSpacing: "0.032em",
    };
  }

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

/** Footer Civis oinadom @ md — 11px / 46px mark (referencia de proporción). */
export const CIVIS_LOCKUP_DESCRIPTOR_LOGO_RATIO = 0.6875 / 2.875;

/** Footer Civis — oinadom descriptor fijo (aprobado −2px del mark). */
export function civisFooterDescriptorStyle() {
  return {
    marginTop: "0.24em",
    fontSize: "0.6875rem",
    letterSpacing: "0.05em",
  };
}

/** Quiénes somos (oina) — descriptor fijo; no escalar con la proporción del footer. */
export function civisQuienesSomosDescriptorStyle() {
  return {
    marginTop: "0.24em",
    fontSize: "0.5rem",
    letterSpacing: "0.05em",
  };
}

/** SVG al wordmark (reservado; Quiénes somos usa HTML). */
export function civisSectionDescriptorStyle(lockup: "oina" | "oinadom") {
  return {
    marginTop: "0.18em",
    fontSize: `calc(var(--brand-logo-h) * ${lockup === "oina" ? 0.055 : 0.072})`,
    letterSpacing: lockup === "oina" ? "0.044em" : "0.032em",
  };
}

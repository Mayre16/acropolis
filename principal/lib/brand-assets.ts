/**
 * Lockups oficiales OINA (guía de marca v01 / 2025).
 * «logo oina», «oinadom», «logo escuela», «trilogo», «logo na».
 */

export type BrandLockupId = "na" | "na-solo" | "oina" | "oinadom" | "escuela" | "trilogo";

export type BrandLogoVariant = "color" | "white";

type LockupAsset = {
  webp: string;
  webpWhite: string;
  png?: string;
  alt: string;
  width: number;
  height: number;
};

export const BRAND_LOCKUPS: Record<BrandLockupId, LockupAsset> = {
  na: {
    webp: "/brand/logo-nueva-acropolis-stacked.webp",
    webpWhite: "/brand/logo-nueva-acropolis-stacked-white.webp",
    alt: "Nueva Acrópolis",
    width: 2429,
    height: 1113,
  },
  "na-solo": {
    webp: "/brand/logo-na-solo.webp",
    webpWhite: "/brand/logo-na-solo-white.webp",
    alt: "Nueva Acrópolis",
    width: 2220,
    height: 905,
  },
  oina: {
    webp: "/brand/logo-oina.webp",
    webpWhite: "/brand/logo-oina-white.webp",
    png: "/brand/logo-oina.png",
    alt: "Nueva Acrópolis — Organización Internacional",
    width: 2429,
    height: 1574,
  },
  oinadom: {
    webp: "/brand/logo-oinadom.webp",
    webpWhite: "/brand/logo-oinadom-white.webp",
    png: "/brand/logo-oinadom.png",
    alt: "Nueva Acrópolis — República Dominicana",
    width: 2817,
    height: 1587,
  },
  escuela: {
    webp: "/brand/logo-escuela.webp",
    webpWhite: "/brand/logo-escuela-white.webp",
    png: "/brand/logo-escuela.png",
    alt: "Nueva Acrópolis — Escuela de Filosofía",
    width: 2429,
    height: 1574,
  },
  trilogo: {
    webp: "/brand/trilogo.webp",
    webpWhite: "/brand/trilogo-white.webp",
    png: "/brand/trilogo.png",
    alt: "Nueva Acrópolis — Filosofía · Cultura · Voluntariado",
    width: 2429,
    height: 1574,
  },
};

/** Monograma NA (anagrama + columna, sin «Nueva Acrópolis») para superponer en mapas. */
export const BRAND_NA_MAP_MONOGRAM = {
  webpWhite: "/brand/logo-na-solo-map-white.webp",
  alt: "Nueva Acrópolis",
  width: 780,
  height: 316,
} as const;

/**
 * Lockups con descriptor en HTML (modo híbrido).
 * NA y oinadom usan raster completo del kit — no entrar aquí.
 */
export const LOCKUPS_WITH_DESCRIPTOR = [
  "trilogo",
  "escuela",
] as const satisfies readonly BrandLockupId[];

/** Textos oficiales de la banda descriptora (guía § Descriptores). */
export const LOCKUP_DESCRIPTOR_LABELS: Record<
  (typeof LOCKUPS_WITH_DESCRIPTOR)[number],
  string
> = {
  trilogo: "FILOSOFÍA • CULTURA • VOLUNTARIADO",
  escuela: "ESCUELA DE FILOSOFÍA",
};

/** Parte superior compartida (anagrama + «Nueva Acrópolis») — raster continuo. */
export const BRAND_TOP_MARK = BRAND_LOCKUPS.na;

/** @deprecated Usar BRAND_TOP_MARK / lockup `na`. */
/** Lockup filial RD — descriptor integrado (no duplicar texto). */
export const BRAND_NA_SECTION_MARK = BRAND_LOCKUPS.oinadom;

/** @deprecated Use BRAND_LOCKUPS.oina */
export const LOGO_OINA = {
  png: BRAND_LOCKUPS.oina.png!,
  webp: BRAND_LOCKUPS.oina.webp,
  alt: BRAND_LOCKUPS.oina.alt,
} as const;

/** @deprecated Use BRAND_LOCKUPS.escuela */
export const LOGO_ESCUELA = {
  png: BRAND_LOCKUPS.escuela.png!,
  webp: BRAND_LOCKUPS.escuela.webp,
  alt: BRAND_LOCKUPS.escuela.alt,
} as const;

/** @deprecated Use BRAND_LOCKUPS.trilogo */
export const TRILOGO = {
  png: BRAND_LOCKUPS.trilogo.png!,
  webp: BRAND_LOCKUPS.trilogo.webp,
  alt: BRAND_LOCKUPS.trilogo.alt,
} as const;

/** @deprecated Use BRAND_LOCKUPS.oinadom */
export const LOGO_OINADOM = {
  png: BRAND_LOCKUPS.oinadom.png!,
  webp: BRAND_LOCKUPS.oinadom.webp,
  alt: BRAND_LOCKUPS.oinadom.alt,
} as const;

export function brandLockupSrc(
  lockup: BrandLockupId,
  variant: BrandLogoVariant = "color",
): string {
  const asset = BRAND_LOCKUPS[lockup];
  return variant === "white" ? asset.webpWhite : asset.webp;
}

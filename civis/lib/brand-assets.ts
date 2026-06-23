/**
 * Lockups oficiales OINA (guía de marca v01 / 2025).
 */

export type BrandLockupId = "na" | "na-solo" | "oina" | "oinadom" | "escuela" | "trilogo";

export type BrandLogoVariant = "color" | "white";

type LockupAsset = {
  webp: string;
  webpWhite: string;
  alt: string;
  width: number;
  height: number;
};

export const BRAND_LOCKUPS: Record<BrandLockupId, LockupAsset> = {
  na: {
    webp: "/brand/logo-nueva-acropolis-stacked.webp",
    webpWhite: "/brand/logo-nueva-acropolis-stacked-white.webp",
    alt: "Nueva Acrópolis",
    width: 2832,
    height: 1276,
  },
  "na-solo": {
    webp: "/brand/logo-na-solo.webp",
    webpWhite: "/brand/logo-na-solo-white.webp",
    alt: "Nueva Acrópolis",
    width: 855,
    height: 910,
  },
  oina: {
    webp: "/brand/logo-oina.webp",
    webpWhite: "/brand/logo-oina-white.webp",
    alt: "Nueva Acrópolis — Organización Internacional",
    width: 2832,
    height: 1276,
  },
  oinadom: {
    webp: "/brand/logo-oinadom.webp",
    webpWhite: "/brand/logo-oinadom-white.webp",
    alt: "Nueva Acrópolis — República Dominicana",
    width: 2817,
    height: 1587,
  },
  escuela: {
    webp: "/brand/logo-escuela.webp",
    webpWhite: "/brand/logo-escuela-white.webp",
    alt: "Nueva Acrópolis — Escuela de Filosofía",
    width: 2429,
    height: 1574,
  },
  trilogo: {
    webp: "/brand/trilogo.webp",
    webpWhite: "/brand/trilogo-white.webp",
    alt: "Nueva Acrópolis — Filosofía · Cultura · Voluntariado",
    width: 2429,
    height: 1574,
  },
};

/** Lockups con descriptor integrado en la banda gris (no añadir subtítulo externo). */
export const LOCKUPS_WITH_DESCRIPTOR = [
  "oina",
  "oinadom",
  "trilogo",
  "escuela",
] as const satisfies readonly BrandLockupId[];

export const LOCKUP_DESCRIPTOR_LABELS: Record<
  (typeof LOCKUPS_WITH_DESCRIPTOR)[number],
  string
> = {
  oina: "ORGANIZACIÓN INTERNACIONAL",
  oinadom: "REPÚBLICA DOMINICANA",
  trilogo: "FILOSOFÍA • CULTURA • VOLUNTARIADO",
  escuela: "ESCUELA DE FILOSOFÍA",
};

export const BRAND_TOP_MARK = BRAND_LOCKUPS.na;

/** Lockup filial RD — descriptor integrado (no duplicar texto). */
export const BRAND_NA_SECTION_MARK = BRAND_LOCKUPS.oina;

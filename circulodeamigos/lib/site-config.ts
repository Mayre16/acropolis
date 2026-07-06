export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3500"
    : "https://circulodeamigos.acropolis.org.do")
).replace(/\/$/, "");

export const PRINCIPAL_SITE_URL = (
  process.env.NEXT_PUBLIC_PRINCIPAL_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3100"
    : "https://acropolis.org.do")
).replace(/\/$/, "");

export const INFO_EMAIL =
  process.env.NEXT_PUBLIC_INFO_EMAIL?.trim() || "info.oinadom@acropolis.org";

export const CURSOS_EMAIL =
  process.env.NEXT_PUBLIC_CURSOS_EMAIL?.trim() || "cursos.oinadom@acropolis.org";

export const VOLUNTARIADO_EMAIL =
  process.env.NEXT_PUBLIC_VOLUNTARIADO_EMAIL?.trim() ||
  "voluntariadord@acropolis.org";

export const ESFERA_SOLICITUD_EMAIL =
  process.env.NEXT_PUBLIC_ESFERA_EMAIL?.trim() || "esferard@acropolis.org";

export const ESFERA_CC_EMAIL = "Santiago.a@acropolis.org";

export const LEGAL_DOMICILE =
  "Calle Cub Scouts No. 6, Ens. Naco, Santo Domingo";

export const INSTAGRAM_HANDLE = "nuevaacropolisdominicana";

export const SOCIAL_LINKS = {
  instagram: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
  youtube: "https://www.youtube.com/@NuevaAcr%C3%B3polisRD",
  facebook: "https://www.facebook.com/nuevaacropolisrd",
} as const;

export const LEGAL_LINKS = [
  { href: `${PRINCIPAL_SITE_URL}/legal/privacidad`, label: "Política de privacidad" },
  { href: `${PRINCIPAL_SITE_URL}/legal/aviso-legal`, label: "Aviso legal" },
  { href: `${PRINCIPAL_SITE_URL}/legal/cookies`, label: "Política de cookies" },
] as const;

/** Placeholder hasta recibir identificador oficial de la submarca. */
export const SUBMARCA_LOGO = {
  src: "/brand/identificadores/civis-identificador.webp",
  alt: "Círculo de Amigos OINADOM — Nueva Acrópolis",
  width: 960,
  height: 160,
} as const;

export const HEADER_SUBMARCA_LOGO = {
  src: "/brand/identificadores/civis-identificador-header.webp",
  alt: SUBMARCA_LOGO.alt,
  width: 951,
  height: 161,
} as const;

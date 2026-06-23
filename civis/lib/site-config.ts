export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3200"
    : "https://civis.acropolis.adesa.com.do")
).replace(/\/$/, "");

export const PRINCIPAL_SITE_URL = (
  process.env.NEXT_PUBLIC_PRINCIPAL_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3100"
    : "https://acropolis.adesa.com.do")
).replace(/\/$/, "");

export const BIBLIOTECA_URL = (
  process.env.NEXT_PUBLIC_BIBLIOTECA_URL?.trim() ||
  "https://biblioteca-oina.adesa.com.do"
).replace(/\/$/, "");

export const EDITORIAL_URL = (
  process.env.NEXT_PUBLIC_TIENDA_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3300"
    : "https://tienda.acropolis.adesa.com.do")
).replace(/\/$/, "");

export const DIPLOMADO_URL = `${PRINCIPAL_SITE_URL}/diplomado`;

export const WHATSAPP_NUMBER = "18495174144";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const SUBMARCA_LOGO = {
  src: "/brand/identificadores/civis-identificador.webp",
  alt: "Civis Consulting — Nueva Acrópolis",
  width: 954,
  height: 165,
};

/** Identificador para header integrado (recorte superior/derecho sin borde del PNG). */
export const HEADER_SUBMARCA_LOGO = {
  src: "/brand/identificadores/civis-identificador-header.webp",
  alt: SUBMARCA_LOGO.alt,
  width: 951,
  height: 161,
} as const;

/** Logo OINA en pestaña «Qué es Nueva Acrópolis». */
export const NUEVA_ACROPOLIS_LOGO = {
  src: "/brand/logo-oina.webp",
  alt: "Nueva Acrópolis — Organización Internacional",
  width: 2429,
  height: 1574,
} as const;

/** Correo que recibe solicitudes de propuesta (override: NEXT_PUBLIC_COTIZACION_EMAIL). */
export const COTIZACION_EMAIL =
  process.env.NEXT_PUBLIC_COTIZACION_EMAIL?.trim() || "civis@acropolis.org";

export const LEGAL_DOMICILE =
  "Calle Cub Scouts No. 6, Ens. Naco, Santo Domingo";

export const DIPLOMADO_WHATSAPP_NUMBER = "18493527054";
export const DIPLOMADO_WHATSAPP_URL = `https://wa.me/${DIPLOMADO_WHATSAPP_NUMBER}`;

export const INSTAGRAM_HANDLE = "nuevaacropolisdominicana";

export const SOCIAL_LINKS = {
  instagram: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
  youtube: "https://www.youtube.com/@NuevaAcr%C3%B3polisEspa%C3%B1a",
  facebook: "https://www.facebook.com/nuevaacropolisrd",
} as const;

export const LEGAL_LINKS = [
  { href: `${PRINCIPAL_SITE_URL}/legal/privacidad`, label: "Política de privacidad" },
  { href: `${PRINCIPAL_SITE_URL}/legal/aviso-legal`, label: "Aviso legal" },
  { href: `${PRINCIPAL_SITE_URL}/legal/cookies`, label: "Política de cookies" },
] as const;

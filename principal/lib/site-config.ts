import type { BrandLockupId } from "./brand-assets";

/** URL pública del sitio (metadataBase / Open Graph). Override con NEXT_PUBLIC_SITE_URL en build. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://acropolis.adesa.com.do"
).replace(/\/$/, "");

/** Logo NA en header (todas las páginas — sin país). */
export const HEADER_BRAND_LOCKUP: BrandLockupId = "na";

/** @deprecated Mismo lockup en home e interiores. */
export const HEADER_HOME_LOCKUP: BrandLockupId = HEADER_BRAND_LOCKUP;

/** @deprecated Mismo lockup en home e interiores. */
export const HEADER_INNER_LOCKUP: BrandLockupId = HEADER_BRAND_LOCKUP;

/** WhatsApp cursos, talleres y conferencias. */
export const CURSOS_WHATSAPP_NUMBER = "18495174144";
export const CURSOS_WHATSAPP_URL = `https://wa.me/${CURSOS_WHATSAPP_NUMBER}`;

/** WhatsApp diplomado, orientación y contacto general institucional. */
export const DIPLOMADO_WHATSAPP_NUMBER = "18493527054";
export const DIPLOMADO_WHATSAPP_URL = `https://wa.me/${DIPLOMADO_WHATSAPP_NUMBER}`;

/** Alias histórico — cursos y talleres. */
export const WHATSAPP_NUMBER = CURSOS_WHATSAPP_NUMBER;
export const WHATSAPP_URL = CURSOS_WHATSAPP_URL;

/** Correo general e información (diplomado, sedes). */
export const INFO_EMAIL =
  process.env.NEXT_PUBLIC_INFO_EMAIL?.trim() || "info.oinadom@acropolis.org";

/** Cursos, talleres y actividades culturales. */
export const CURSOS_EMAIL =
  process.env.NEXT_PUBLIC_CURSOS_EMAIL?.trim() || "cursos.oinadom@acropolis.org";

/** Voluntariado humanitario (donaciones y formulario de voluntariado). */
export const VOLUNTARIADO_EMAIL =
  process.env.NEXT_PUBLIC_VOLUNTARIADO_EMAIL?.trim() ||
  "voluntariadord@acropolis.org";

/** Nombre visible del buzón de voluntariado. */
export const VOLUNTARIADO_EMAIL_NAME = "Voluntariado Humanitario";

/** Etiqueta legible: "Voluntariado Humanitario" <correo> */
export const VOLUNTARIADO_EMAIL_LABEL = `"${VOLUNTARIADO_EMAIL_NAME}" <${VOLUNTARIADO_EMAIL}>`;

/** Domicilio legal de Nueva Acrópolis RD (Sede Naco). */
export const LEGAL_DOMICILE =
  "Calle Cub Scouts No. 6, Ens. Naco, Santo Domingo";

/** Línea de áreas de actuación bajo el logo en footers del sitio principal. */
export const BRAND_FOOTER_TAGLINE = "Filosofía · Cultura · Voluntariado";

/** Correo de Punto Focal Esfera (info, consultas y formularios web). */
export const ESFERA_SOLICITUD_EMAIL =
  process.env.NEXT_PUBLIC_ESFERA_SOLICITUD_EMAIL?.trim() ||
  "esferard@acropolis.org";

/** Copia en correos Esfera (donaciones, alianzas, talleres, contacto). */
export const ESFERA_CC_EMAIL =
  process.env.NEXT_PUBLIC_ESFERA_CC_EMAIL?.trim() || "Santiago.a@acropolis.org";

/**
 * Sedes con filial propia (clases regulares).
 * `map` = coordenadas en el viewBox del mapa SVG (0 0 1000 686).
 */
export const SEDES = [
  {
    city: "Santo Domingo",
    map: { x: 559, y: 411 },
    venues: [
      { name: "Naco", note: "Naco" },
      { name: "Los Prados", note: "Los Prados" },
    ],
  },
  {
    city: "Santiago",
    map: { x: 370, y: 158 },
    venues: [{ name: "Santiago", note: "Santiago de los Caballeros" }],
  },
] as const;

/** Puntos culturales — espacios de eventos y encuentros. */
export const CENTROS_CULTURALES = [
  {
    city: "Santo Domingo",
    venues: [
      { name: "Roberto Pastoriza", note: "Punto cultural" },
    ],
  },
] as const;

/** Identificadores horizontales de submarca (JPG oficiales en /public/brand/identificadores). */
export const SUBMARCA_LOGOS = {
  biblioteca: {
    src: "/brand/identificadores/biblioteca-identificador.webp",
    alt: "Biblioteca Sophia — Nueva Acrópolis",
    width: 1357,
    height: 232,
  },
  civis: {
    src: "/brand/identificadores/civis-identificador.webp",
    alt: "Civis Consulting — Nueva Acrópolis",
    width: 954,
    height: 165,
  },
  editorial: {
    src: "/brand/identificadores/editorial-identificador.webp",
    alt: "Librería Editorial Logos — Nueva Acrópolis",
    width: 1078,
    height: 359,
  },
  cultura: {
    src: "/brand/identificadores/cultura-identificador.webp",
    alt: "Cultura — Nueva Acrópolis",
    width: 360,
    height: 108,
  },
} as const;

/** Ruta del landing del Diplomado en este sitio. */
export const DIPLOMADO_PATH = "/diplomado";

export type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

/** Navegación principal — áreas de actuación (sin contenido editorial). */
export const NAV_LINKS: NavLink[] = [
  { href: "/filosofia", label: "Filosofía" },
  { href: DIPLOMADO_PATH, label: "Diplomado" },
  { href: "/cultura", label: "Cultura" },
  { href: "/voluntariado", label: "Voluntariado" },
  { href: "/esfera", label: "Esfera" },
  { href: "/cursos", label: "Cursos" },
  { href: "/donde-estamos", label: "Dónde estamos" },
];

/** Navegación del pie de página — fila principal (sin Esfera). */
export const FOOTER_NAV_PRIMARY: NavLink[] = [
  { href: "/filosofia", label: "Filosofía" },
  { href: "/cultura", label: "Cultura" },
  { href: "/voluntariado", label: "Voluntariado" },
];

/** Navegación del pie de página — segunda fila. */
export const FOOTER_NAV_SECONDARY: NavLink[] = [
  { href: DIPLOMADO_PATH, label: "Diplomado" },
  { href: "/cursos", label: "Cursos" },
  { href: "/donde-estamos", label: "Dónde estamos" },
];

/** Navegación del pie de página (sin Esfera ni hub de contenido). */
export const FOOTER_NAV_LINKS: NavLink[] = [
  ...FOOTER_NAV_PRIMARY,
  ...FOOTER_NAV_SECONDARY,
];

/** Enlaces de contenido en el pie de página (editorial + hub). */
export const FOOTER_CONTENT_LINKS: NavLink[] = [
  { href: "/articulos", label: "Artículos" },
  { href: "/eventos", label: "Eventos" },
  {
    href: "https://www.revistaesfinge.com/",
    label: "Revista Esfinge",
    external: true,
  },
  { href: "/contenido", label: "Contenido" },
];

export type NavContenidoItem = {
  href: string;
  label: string;
  external?: boolean;
};

export const NAV_CONTENIDO = {
  label: "Contenido",
  hubHref: "/contenido",
} as const;

export const INSTAGRAM_HANDLE = "nuevaacropolisdominicana";
export const YOUTUBE_HANDLE = "NuevaAcrópolisRD";

/** Redes sociales — pie de página y conexión institucional. */
export const SOCIAL_LINKS = {
  instagram: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
  youtube: "https://www.youtube.com/@NuevaAcr%C3%B3polisRD",
  facebook: "https://www.facebook.com/nuevaacropolisrd",
} as const;

/** Enlaces legales (pie de página). */
export const LEGAL_LINKS = [
  { href: "/legal/privacidad", label: "Política de privacidad" },
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/cookies", label: "Política de cookies" },
] as const;

/** Enlace simple del menú Quiénes somos. */
export type NavInstitucionalLink = {
  href: string;
  label: string;
};

/** Grupo con submenú (segundo nivel). */
export type NavInstitucionalGroup = {
  type: "group";
  label: string;
  /** Enlace al pulsar el título del grupo. */
  href: string;
  items: NavInstitucionalLink[];
};

/** Ítem de primer nivel: enlace directo o grupo con flyout. */
export type NavInstitucionalItem =
  | ({ type: "link" } & NavInstitucionalLink)
  | NavInstitucionalGroup;

/**
 * Menú "Quiénes somos": rutas cortas sin anclas (#).
 */
export const NAV_INSTITUCIONAL = {
  label: "Quiénes somos",
  items: [
    {
      type: "group",
      label: "Qué es Nueva Acrópolis",
      href: "/que-es",
      items: [
        { href: "/que-es", label: "Presentación" },
        { href: "/organizacion", label: "Organización" },
        { href: "/principios", label: "Carta Fundacional" },
        { href: "/simbolismo", label: "Simbolismo del nombre" },
        { href: "/presidencia", label: "Fundador y presidencia" },
        { href: "/areas-actuacion", label: "Áreas de actuación" },
      ],
    },
    {
      type: "link",
      href: "/direccion",
      label: "Dirección Nacional",
    },
    {
      type: "group",
      label: "Internacional",
      href: "/relaciones-institucionales/",
      items: [
        {
          href: "https://www.acropolis.org/es/anuarios-internacionales/",
          label: "Anuario",
        },
        { href: "/relaciones-institucionales/", label: "Relaciones institucionales" },
        { href: "/eventos/#mundo", label: "Noticias internacionales" },
      ],
    },
  ] satisfies NavInstitucionalItem[],
} as const;

/**
 * Vídeo de presentación (YouTube) que se muestra en "Quiénes somos".
 * Canal oficial New Acropolis International. Cambia el ID por el vídeo de
 * introducción que prefieras.
 */
export const INTRO_VIDEO_ID = "NgxhR_ppPmI";
/** Segundo de inicio del vídeo de presentación (Quiénes somos). */
export const INTRO_VIDEO_START = 9;

/** Plataformas en subdominio propio (apps independientes con su submarca). */
export type PlatformId = "biblioteca" | "civis" | "tienda";

export type Platform = {
  id: PlatformId;
  label: string;
  /** URL pública (subdominio). */
  href: string;
  /** Desarrollo local: app externa o ruta interna en este sitio. */
  devHref: string;
};

export const PLATAFORMAS: Platform[] = [
  {
    id: "biblioteca",
    label: "Biblioteca",
    href: "https://biblioteca-oina.adesa.com.do",
    devHref: "https://biblioteca-oina.adesa.com.do",
  },
  {
    id: "civis",
    label: "Civis Consulting",
    href: "https://civis.acropolis.adesa.com.do",
    devHref: "http://localhost:3200",
  },
  {
    id: "tienda",
    label: "Librería Editorial Logos",
    href: "https://tienda.acropolis.adesa.com.do",
    devHref: "https://tienda.acropolis.adesa.com.do",
  },
];

const PLATFORM_ENV_KEYS: Record<PlatformId, string> = {
  biblioteca: "NEXT_PUBLIC_BIBLIOTECA_URL",
  civis: "NEXT_PUBLIC_CIVIS_URL",
  tienda: "NEXT_PUBLIC_TIENDA_URL",
};

export function isDevPlatformsMode(): boolean {
  if (process.env.NEXT_PUBLIC_PLATFORMS_DEV === "true") return true;
  if (process.env.NEXT_PUBLIC_PLATFORMS_DEV === "false") return false;
  return process.env.NODE_ENV === "development";
}

/** URL efectiva de una plataforma (dev o producción). */
export function platformUrl(id: PlatformId): string {
  const envKey = PLATFORM_ENV_KEYS[id];
  const override = process.env[envKey]?.trim();
  if (override) return override;

  const platform = PLATAFORMAS.find((p) => p.id === id);
  if (!platform) return "/";

  return isDevPlatformsMode() ? platform.devHref : platform.href;
}

export function platformIsExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function getPlatform(id: PlatformId): Platform {
  return PLATAFORMAS.find((p) => p.id === id)!;
}

/** Librería editorial — temporalmente en Tienda (tienda.acropolis.adesa.com.do). */
export function bibliotecaLibreriaUrl(): string {
  return platformUrl("tienda").replace(/\/$/, "");
}

/** URL efectiva de plataforma; Editorial → librería de Biblioteca. */
export function platformEffectiveUrl(id: PlatformId): string {
  if (id === "tienda") return bibliotecaLibreriaUrl();
  return platformUrl(id);
}

/** Enlaces del menú Contenido (artículos, eventos, revista, biblioteca, librería, redes). */
export function getNavContenidoItems(): NavContenidoItem[] {
  return [
    { href: "/articulos", label: "Artículos" },
    { href: "/eventos", label: "Eventos" },
    { href: "/agenda", label: "Agenda" },
    {
      href: "https://www.revistaesfinge.com/",
      label: "Revista Esfinge",
      external: true,
    },
    {
      href: platformUrl("biblioteca"),
      label: "Biblioteca",
      external: true,
    },
    {
      href: bibliotecaLibreriaUrl(),
      label: "Librería",
      external: true,
    },
    { href: "/contenido#redes-sociales", label: "Redes sociales" },
  ];
}

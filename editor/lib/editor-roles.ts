import type { SiteId } from "./content-types";



export type EditorRole =

  | "admin"

  | "voluntariado"

  | "esfera"

  | "editorial"

  | "viajes"

  | "filosofia";



export type EditorTabId = string;



export type EditorRoleMeta = {

  role: EditorRole;

  label: string;

  description: string;

};



export const EDITOR_ROLE_META: Record<EditorRole, EditorRoleMeta> = {

  admin: {

    role: "admin",

    label: "Administrador",

    description: "Acceso completo al CMS",

  },

  voluntariado: {

    role: "voluntariado",

    label: "Voluntariado",

    description: "Actividades de voluntariado y agenda",

  },

  esfera: {

    role: "esfera",

    label: "Esfera y Sedes",

    description: "Sedes, agenda general, archivos e inicio",

  },

  editorial: {

    role: "editorial",

    label: "Librería Editorial Logos",

    description: "Tienda editorial — libros, revistas, regalos y textos",

  },

  viajes: {

    role: "viajes",

    label: "Viajes",

    description: "Destinos locales e internacionales",

  },

  filosofia: {

    role: "filosofia",

    label: "Diplomado y Filosofía",

    description: "Diplomado, sesiones, filosofía y eventos realizados",

  },

};



/** Pestañas visuales (iframe) — no muestran el formulario del editor. */

export const VISUAL_TAB_IDS = new Set([

  "filosofia",

  "articulos",

  "medios",

  "viajesLocales",

  "viajesInternacionales",

  "cultura",

  "sedes",

  "home",

  "voluntariado",

  "cursos",

  "diplomado",

  "eventos",

  "civisHome",

  "civisTalleres",

  "civisQuienesSomos",

  "civisSalones",

  "quienesSomos",

  "relaciones",

  "esfera",

  "editorialHome",

  "editorialLibros",

  "editorialDigitales",

  "editorialRevistas",

  "editorialRegalos",

  "editorialDonde",

  "editorialQuienesSomos",

]);



export const TAB_LABELS: Record<string, string> = {

  filosofia: "Filosofía",

  homeHero: "Textos del inicio",

  diplomadoHero: "Diplomado — fechas",

  agenda: "Agenda",

  articulos: "Artículos",

  medios: "Voz fuera de la sede",

  viajesLocales: "Viajes locales",

  viajesInternacionales: "Viajes internacionales",

  cultura: "Cultura",

  sedes: "Dónde estamos",

  home: "Inicio",

  voluntariado: "Voluntariado",

  cursos: "Cursos",

  archivos: "Archivos",

  diplomado: "Diplomado",

  eventos: "Eventos",

  civisTalleresRealizados: "Civis — talleres",

  civisProximasActividades: "Civis — actividades",

  civisHome: "Civis — inicio",

  civisTalleres: "Civis — oferta",

  civisQuienesSomos: "Civis — equipo",

  civisSalones: "Civis — salones",

  quienesSomos: "Quiénes somos",

  relaciones: "Relaciones institucionales",

  esfera: "Esfera",

  editorialHome: "Inicio — tienda",

  editorialLibros: "Libros impresos",

  editorialDigitales: "Libros digitales",

  editorialRevistas: "Revistas",

  editorialRegalos: "Regalos",

  editorialDonde: "Dónde estamos",

  editorialQuienesSomos: "Quiénes somos",

};



const ACROPOLIS_BY_ROLE: Record<EditorRole, EditorTabId[]> = {

  admin: [

    "home",

    "homeHero",

    "sedes",

    "cursos",

    "diplomado",

    "diplomadoHero",

    "filosofia",

    "voluntariado",

    "eventos",

    "agenda",

    "articulos",

    "medios",

    "cultura",

    "viajesLocales",

    "viajesInternacionales",

    "archivos",

    "quienesSomos",

    "relaciones",

    "esfera",

  ],

  voluntariado: ["voluntariado", "agenda"],

  editorial: [],

  filosofia: ["diplomado", "filosofia", "eventos", "diplomadoHero", "agenda"],

  viajes: ["viajesLocales", "viajesInternacionales"],

  esfera: ["sedes", "esfera", "agenda", "archivos", "home"],

};



const CIVIS_BY_ROLE: Record<EditorRole, EditorTabId[]> = {

  admin: [

    "civisHome",

    "civisTalleres",

    "civisQuienesSomos",

    "civisSalones",

    "archivos",

  ],

  voluntariado: [],

  editorial: [],

  filosofia: [],

  viajes: [],

  esfera: ["archivos"],

};



const EDITORIAL_BY_ROLE: Record<EditorRole, EditorTabId[]> = {

  admin: [

    "editorialHome",

    "editorialLibros",

    "editorialDigitales",

    "editorialRevistas",

    "editorialRegalos",

    "editorialDonde",

    "editorialQuienesSomos",

    "archivos",

  ],

  voluntariado: [],

  editorial: [

    "editorialHome",

    "editorialLibros",

    "editorialDigitales",

    "editorialRevistas",

    "editorialRegalos",

    "editorialDonde",

    "editorialQuienesSomos",

    "archivos",

  ],

  filosofia: [],

  viajes: [],

  esfera: [],

};



export function tabsForRole(site: SiteId, role: EditorRole): EditorTabId[] {
  const map =
    site === "acropolis"
      ? ACROPOLIS_BY_ROLE
      : site === "civis"
        ? CIVIS_BY_ROLE
        : EDITORIAL_BY_ROLE;
  return map[role] ?? map.admin;
}



export function defaultTabForRole(site: SiteId, role: EditorRole): EditorTabId {
  const tabs = tabsForRole(site, role);
  if (site === "editorial") return tabs[0] ?? "editorialHome";
  return tabs[0] ?? (site === "acropolis" ? "agenda" : "civisHome");
}



export function isVisualTab(tab: string): boolean {

  return VISUAL_TAB_IDS.has(tab);

}



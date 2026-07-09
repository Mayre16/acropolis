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

  "contenido",

  "agenda",

  "voluntariado",

  "cursos",

  "diplomado",

  "eventos",

  "civisHome",

  "civisTalleres",

  "civisQuienesSomos",

  "civisSalones",

  "circuloHome",

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

  contenido: "Contenido",

  agenda: "Agenda",

  articulos: "Blog",

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

  circuloAmigos: "Círculo de Amigos",

  circuloHome: "Círculo — inicio",

  editorialHome: "Inicio — tienda",

  editorialLibros: "Libros impresos",

  editorialDigitales: "Libros digitales",

  editorialRevistas: "Revistas",

  editorialRegalos: "Regalos",

  editorialDonde: "Dónde estamos",

  editorialQuienesSomos: "Quiénes somos",

  estadisticas: "Estadísticas de visitas",

};



const ACROPOLIS_BY_ROLE: Record<EditorRole, EditorTabId[]> = {

  admin: [

    "home",

    "sedes",

    "cursos",

    "diplomado",

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

    "esfera",

  ],

  voluntariado: ["voluntariado", "agenda"],

  editorial: [],

  filosofia: ["diplomado", "filosofia", "eventos", "contenido", "agenda"],

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

    "estadisticas",

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

    "estadisticas",

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

    "estadisticas",

  ],

  filosofia: [],

  viajes: [],

  esfera: [],

};



const CIRCULO_BY_ROLE: Record<EditorRole, EditorTabId[]> = {

  admin: ["circuloHome", "archivos", "estadisticas"],

  voluntariado: [],

  editorial: [],

  filosofia: [],

  viajes: [],

  esfera: ["archivos"],

};



export function tabsForRole(site: SiteId, role: EditorRole): EditorTabId[] {
  const map =
    site === "acropolis"
      ? ACROPOLIS_BY_ROLE
      : site === "civis"
        ? CIVIS_BY_ROLE
        : site === "circulodeamigos"
          ? CIRCULO_BY_ROLE
          : EDITORIAL_BY_ROLE;
  return map[role] ?? map.admin;
}

/** Preferir `tabsForPermissions` cuando el usuario tenga permisos custom. */
export function defaultTabForRole(site: SiteId, role: EditorRole): EditorTabId {
  const tabs = tabsForRole(site, role);
  if (site === "editorial") return tabs[0] ?? "editorialHome";
  if (site === "circulodeamigos") return tabs[0] ?? "circuloHome";
  return tabs[0] ?? (site === "acropolis" ? "home" : "civisHome");
}



export function isVisualTab(tab: string): boolean {

  return VISUAL_TAB_IDS.has(tab);

}



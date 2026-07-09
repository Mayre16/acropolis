import type { SiteId } from "./content-types";
import { TAB_LABELS, tabsForRole, type EditorRole } from "./editor-roles";
import { tabsForPermissions } from "./editor-permissions";

export type TabGroup = {
  label: string;
  tabs: string[];
  hint?: string;
};

const ACROPOLIS_TAB_GROUPS: TabGroup[] = [
  { label: "Inicio y ubicación", tabs: ["home", "sedes"] },
  { label: "Programas y formación", tabs: ["cursos", "diplomado", "filosofia"] },
  {
    label: "Actividades",
    tabs: [
      "voluntariado",
      "eventos",
      "agenda",
      "cultura",
      "esfera",
      "viajesLocales",
      "viajesInternacionales",
    ],
  },
  { label: "Blog", tabs: ["articulos", "medios"] },
  {
    label: "Administración",
    tabs: ["estadisticas", "archivos"],
    hint: "Visitas e inventario de imágenes",
  },
];

const CIVIS_TAB_GROUPS: TabGroup[] = [
  {
    label: "Páginas del sitio",
    tabs: ["civisHome", "civisTalleres", "civisSalones", "civisQuienesSomos"],
  },
  {
    label: "Administración",
    tabs: ["estadisticas", "archivos"],
    hint: "Visitas e inventario de imágenes",
  },
];

const EDITORIAL_TAB_GROUPS: TabGroup[] = [
  {
    label: "Páginas de la tienda",
    tabs: [
      "editorialHome",
      "editorialLibros",
      "editorialDigitales",
      "editorialRevistas",
      "editorialRegalos",
      "editorialDonde",
      "editorialQuienesSomos",
    ],
  },
  {
    label: "Administración",
    tabs: ["estadisticas", "archivos"],
    hint: "Visitas e inventario de imágenes",
  },
];

const CIRCULO_TAB_GROUPS: TabGroup[] = [
  {
    label: "Páginas del sitio",
    tabs: ["circuloHome"],
  },
  {
    label: "Administración",
    tabs: ["estadisticas", "archivos"],
    hint: "Visitas e inventario de imágenes",
  },
];

function buildTabGroups(site: SiteId, allowed: string[]): TabGroup[] {
  const allowedSet = new Set(allowed);
  const templates =
    site === "acropolis"
      ? ACROPOLIS_TAB_GROUPS
      : site === "civis"
        ? CIVIS_TAB_GROUPS
        : site === "circulodeamigos"
          ? CIRCULO_TAB_GROUPS
          : EDITORIAL_TAB_GROUPS;

  const grouped = templates
    .map((group) => ({
      label: group.label,
      tabs: group.tabs.filter((tab) => allowedSet.has(tab)),
    }))
    .filter((group) => group.tabs.length > 0);

  const used = new Set(grouped.flatMap((g) => g.tabs));
  const rest = allowed.filter((tab) => !used.has(tab));
  if (rest.length > 0) {
    grouped.push({ label: "Más opciones", tabs: rest });
  }

  return grouped;
}

export function tabGroupsForRole(site: SiteId, role: EditorRole): TabGroup[] {
  return buildTabGroups(site, tabsForRole(site, role));
}

export function tabGroupsForPermissions(
  site: SiteId,
  permissions: string[] | null | undefined,
  role?: string,
): TabGroup[] {
  return buildTabGroups(site, tabsForPermissions(site, permissions, role));
}

export function tabLabel(id: string): string {
  return TAB_LABELS[id] ?? id;
}

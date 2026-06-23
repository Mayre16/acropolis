import type { CmsCollaborateBlock, CmsCollaborateTab } from "@/lib/cms/types";

const COLLABORATE_TAB_ORDER = ["voluntario", "donar", "alianzas"] as const;

export const DEFAULT_COLLABORATE_TABS: CmsCollaborateTab[] = [
  {
    id: "voluntario",
    label: "Voluntariado",
    title: "Quiero ser voluntario/a",
    text: "Cuéntanos si te interesa el voluntariado humanitario, actividades con niños, ancianos, ecología o la línea Punto Focal Esfera. Te contactaremos para las próximas convocatorias.",
    cta: "Enviar solicitud",
    href: "#voluntario",
  },
  {
    id: "donar",
    label: "Donar",
    title: "Apoyo económico",
    text: "La formación y la preparación ante emergencias se sostienen con aportes transparentes. Escríbenos para coordinar donaciones o transferencias destinadas a los proyectos humanitarios de la escuela.",
    cta: "Quiero donar",
    href: "#donar",
  },
  {
    id: "alianzas",
    label: "Alianzas",
    title: "Alianzas e instituciones",
    text: "Organizaciones, empresas con responsabilidad social e instituciones públicas pueden articular talleres, espacios o cofinanciamiento formativo bajo criterios Esfera. Preparamos propuestas a medida.",
    cta: "Proponer alianza",
    href: "#alianzas",
  },
];

export const DEFAULT_COLLABORATE_BLOCK: CmsCollaborateBlock = {
  title: "Colabora con nosotros",
  intro:
    "La formación y la acción solidaria se fortalecen con quienes aportan recursos, alianzas o tiempo. Usa los formularios de cada pestaña para contactarnos.",
  tabs: DEFAULT_COLLABORATE_TABS,
};

export function mergeCollaborateBlock(
  overrides?: CmsCollaborateBlock | null,
): CmsCollaborateBlock {
  if (!overrides) return DEFAULT_COLLABORATE_BLOCK;
  const byId = new Map((overrides.tabs ?? []).map((t) => [t.id, t]));
  const defaultsById = new Map(DEFAULT_COLLABORATE_TABS.map((t) => [t.id, t]));
  return {
    ...DEFAULT_COLLABORATE_BLOCK,
    ...overrides,
    tabs: COLLABORATE_TAB_ORDER.map((id) => {
      const d = defaultsById.get(id)!;
      const o = byId.get(id);
      return o ? { ...d, ...o } : d;
    }),
  };
}

export const COLLABORATE_SECTION_ID = "__collaborate__";

export function collaborateTabSelectedId(id: string) {
  return `collaborate:${id}`;
}

export function parseCollaborateTabSelectedId(
  selectedId: string | null,
): string | null {
  if (!selectedId?.startsWith("collaborate:")) return null;
  return selectedId.slice("collaborate:".length);
}

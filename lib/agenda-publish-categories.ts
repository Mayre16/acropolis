import type { AgendaCategory } from "@/lib/agenda";

export type PublishPageRef = {
  path: string;
  label: string;
};

export type PublishCategoryDef = {
  id: AgendaCategory;
  label: string;
  /** Etiqueta corta en tarjetas de /eventos. */
  eventoLabel: string;
  pages: PublishPageRef[];
  suggestedSeoTags: string[];
  group: "filosofia" | "cursos" | "cultura" | "voluntariado" | "esfera";
};

const PAGE = {
  home: { path: "/", label: "Inicio (carrusel)" },
  agenda: { path: "/agenda", label: "Agenda" },
  filosofia: { path: "/filosofia", label: "Filosofía" },
  diplomado: { path: "/diplomado", label: "Diplomado" },
  cursos: { path: "/cursos", label: "Cursos y talleres" },
  cultura: { path: "/cultura", label: "Cultura" },
  voluntariado: { path: "/voluntariado", label: "Voluntariado" },
  esfera: { path: "/esfera", label: "Punto Focal Esfera" },
  eventos: { path: "/eventos", label: "Eventos (crónicas)" },
} as const satisfies Record<string, PublishPageRef>;

export const PUBLISH_CATEGORY_DEFS: PublishCategoryDef[] = [
  {
    id: "diplomado",
    label: "Diplomado",
    eventoLabel: "Diplomado",
    group: "filosofia",
    pages: [PAGE.filosofia, PAGE.diplomado, PAGE.agenda, PAGE.home],
    suggestedSeoTags: ["diplomado", "filosofía", "Nueva Acrópolis"],
  },
  {
    id: "filosofia",
    label: "Filosofía",
    eventoLabel: "Filosofía",
    group: "filosofia",
    pages: [PAGE.filosofia, PAGE.agenda, PAGE.home],
    suggestedSeoTags: ["filosofía", "escuela de filosofía"],
  },
  {
    id: "curso",
    label: "Curso",
    eventoLabel: "Curso",
    group: "cursos",
    pages: [PAGE.cursos, PAGE.agenda, PAGE.home],
    suggestedSeoTags: ["curso", "formación", "Nueva Acrópolis"],
  },
  {
    id: "taller",
    label: "Taller",
    eventoLabel: "Taller",
    group: "cursos",
    pages: [PAGE.cursos, PAGE.agenda, PAGE.home],
    suggestedSeoTags: ["taller", "formación"],
  },
  {
    id: "conferencia",
    label: "Conferencia",
    eventoLabel: "Conferencia",
    group: "cursos",
    pages: [PAGE.cursos, PAGE.agenda, PAGE.home],
    suggestedSeoTags: ["conferencia", "charla", "filosofía"],
  },
  {
    id: "cultura",
    label: "Cultura",
    eventoLabel: "Cultura",
    group: "cultura",
    pages: [PAGE.cultura, PAGE.agenda, PAGE.home, PAGE.eventos],
    suggestedSeoTags: ["cultura", "arte", "Nueva Acrópolis"],
  },
  {
    id: "voluntariado",
    label: "Voluntariado",
    eventoLabel: "Voluntariado",
    group: "voluntariado",
    pages: [PAGE.voluntariado, PAGE.agenda, PAGE.home, PAGE.eventos],
    suggestedSeoTags: ["voluntariado", "acción social", "Nueva Acrópolis"],
  },
  {
    id: "voluntariado-comunidad",
    label: "Voluntariado — Comunidad",
    eventoLabel: "Comunidad",
    group: "voluntariado",
    pages: [PAGE.voluntariado, PAGE.agenda, PAGE.home, PAGE.eventos],
    suggestedSeoTags: ["voluntariado", "comunidad", "acción social"],
  },
  {
    id: "voluntariado-ninos",
    label: "Voluntariado — Niños y familias",
    eventoLabel: "Comunidad",
    group: "voluntariado",
    pages: [PAGE.voluntariado, PAGE.agenda, PAGE.home, PAGE.eventos],
    suggestedSeoTags: ["voluntariado", "niños", "familia", "comunidad"],
  },
  {
    id: "voluntariado-ambiente",
    label: "Voluntariado — Medio ambiente",
    eventoLabel: "Voluntariado",
    group: "voluntariado",
    pages: [PAGE.voluntariado, PAGE.agenda, PAGE.home, PAGE.eventos],
    suggestedSeoTags: ["voluntariado", "medio ambiente", "ecología", "sostenibilidad"],
  },
  {
    id: "esfera",
    label: "Punto Focal Esfera",
    eventoLabel: "Esfera",
    group: "esfera",
    pages: [PAGE.esfera, PAGE.agenda, PAGE.home, PAGE.eventos],
    suggestedSeoTags: ["esfera", "punto focal", "Nueva Acrópolis"],
  },
];

export const PUBLISH_CATEGORY_GROUPS: {
  id: PublishCategoryDef["group"];
  label: string;
}[] = [
  { id: "filosofia", label: "Filosofía y diplomado" },
  { id: "cursos", label: "Cursos, talleres y conferencias" },
  { id: "cultura", label: "Cultura" },
  { id: "voluntariado", label: "Voluntariado" },
  { id: "esfera", label: "Esfera" },
];

const DEF_BY_ID = new Map(
  PUBLISH_CATEGORY_DEFS.map((def) => [def.id, def]),
);

const LEGACY_EVENTO_CATEGORY: Record<string, AgendaCategory> = {
  diplomado: "diplomado",
  filosofía: "filosofia",
  filosofia: "filosofia",
  curso: "curso",
  taller: "taller",
  conferencia: "conferencia",
  cultura: "cultura",
  voluntariado: "voluntariado",
  comunidad: "voluntariado-comunidad",
  "medio ambiente": "voluntariado-ambiente",
  ambiente: "voluntariado-ambiente",
  ecología: "voluntariado-ambiente",
  esfera: "esfera",
  niños: "voluntariado-ninos",
  ninos: "voluntariado-ninos",
};

export function isAgendaCategory(value: string): value is AgendaCategory {
  return DEF_BY_ID.has(value as AgendaCategory);
}

export function publishCategoryDef(id: AgendaCategory): PublishCategoryDef {
  return DEF_BY_ID.get(id) ?? PUBLISH_CATEGORY_DEFS[0];
}

/** Agrupa subcategorías de voluntariado bajo «voluntariado» en filtros. */
export function agendaFilterCategory(id: AgendaCategory): AgendaCategory {
  if (
    id === "voluntariado-comunidad" ||
    id === "voluntariado-ninos" ||
    id === "voluntariado-ambiente"
  ) {
    return "voluntariado";
  }
  return id;
}

export function eventoCategoryLabel(id: AgendaCategory): string {
  return publishCategoryDef(id).eventoLabel;
}

export function parseLegacyEventoCategory(raw: string): AgendaCategory {
  const trimmed = raw.trim();
  if (isAgendaCategory(trimmed)) return trimmed;
  const key = trimmed.toLocaleLowerCase("es");
  return LEGACY_EVENTO_CATEGORY[key] ?? "cultura";
}

export function normalizeCmsEventoCategory(raw: string): AgendaCategory {
  return parseLegacyEventoCategory(raw);
}

export function parseSeoTags(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of input.split(/[,;]+/)) {
    const tag = part.trim().toLocaleLowerCase("es");
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  return out;
}

export function formatSeoTags(tags: string[] | undefined): string {
  return (tags ?? []).join(", ");
}

export function mergeSeoTags(
  category: AgendaCategory,
  custom: string[] | undefined,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of [
    ...publishCategoryDef(category).suggestedSeoTags,
    ...(custom ?? []),
  ]) {
    const normalized = tag.trim().toLocaleLowerCase("es");
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

export function categoriesMatchFilter(
  entryCategory: AgendaCategory,
  filter: AgendaCategory | "all",
): boolean {
  if (filter === "all") return true;
  if (entryCategory === filter) return true;
  return agendaFilterCategory(entryCategory) === agendaFilterCategory(filter);
}

export const VOLUNTARIADO_PAGE_CATEGORIES: readonly AgendaCategory[] = [
  "voluntariado",
  "voluntariado-comunidad",
  "voluntariado-ninos",
  "voluntariado-ambiente",
  "esfera",
];

export function isVoluntariadoPageCategory(id: AgendaCategory): boolean {
  return (VOLUNTARIADO_PAGE_CATEGORIES as readonly string[]).includes(id);
}

import type { AgendaCategory, AgendaEntry } from "@/lib/agenda";

/** Categorías de /agenda que muestra la sección de convocatorias en /cursos. */
export const CURSOS_AGENDA_CATEGORIES: readonly AgendaCategory[] = [
  "curso",
  "taller",
  "conferencia",
];

export function isCursosAgendaCategory(category: AgendaCategory) {
  return (CURSOS_AGENDA_CATEGORIES as readonly string[]).includes(category);
}

export function filterCursosAgendaEntries(entries: AgendaEntry[]) {
  return entries.filter((e) => isCursosAgendaCategory(e.category));
}

/**
 * Fallback estático para el CMS (convocatorias fechadas propias de /cursos).
 * La agenda visible se sincroniza con /agenda vía ALL_AGENDA_ENTRIES.
 */
export const CURSOS_PROXIMAS_CONVOCATORIAS: AgendaEntry[] = [];

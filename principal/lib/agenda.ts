import type { AgendaItem } from "@/components/UpcomingAgenda";

export type AgendaCategory =
  | "diplomado"
  | "filosofia"
  | "curso"
  | "taller"
  | "conferencia"
  | "cultura"
  | "voluntariado"
  | "voluntariado-comunidad"
  | "voluntariado-ninos"
  | "voluntariado-ambiente"
  | "esfera";

/** Entrada de agenda con metadatos para filtrado en home y páginas. */
export type AgendaEntry = AgendaItem & {
  /** Identificador estable (p. ej. `diplomado-naco-jun29`). */
  id: string;
  /** Fecha ISO `YYYY-MM-DD` — filtra automáticamente actividades pasadas. */
  startsAt: string;
  category: AgendaCategory;
  /**
   * Si es `false`, no aparece en el carrusel del home aunque la fecha sea futura.
   * Por defecto: visible en home cuando la actividad está activa.
   */
  showOnHome?: boolean;
  /** Enlace secundario del carrusel (p. ej. /cursos, /filosofia). */
  detailHref?: string;
  detailLabel?: string;
  /** Slug de crónica en /eventos si se promovió desde agenda. */
  eventoSlug?: string;
  seoTags?: string[];
};

export const AGENDA_CATEGORY_LABEL: Record<AgendaCategory, string> = {
  diplomado: "Diplomado",
  filosofia: "Filosofía",
  curso: "Curso",
  taller: "Taller",
  conferencia: "Conferencia",
  cultura: "Cultura",
  voluntariado: "Voluntariado",
  "voluntariado-comunidad": "Voluntariado — Comunidad",
  "voluntariado-ninos": "Voluntariado — Niños",
  "voluntariado-ambiente": "Voluntariado — Medio ambiente",
  esfera: "Punto Focal Esfera",
};

/** Categorías visibles en el filtro de /agenda (sin subtipos de voluntariado). */
export const AGENDA_FILTER_CATEGORIES: readonly AgendaCategory[] = [
  "diplomado",
  "filosofia",
  "curso",
  "taller",
  "conferencia",
  "cultura",
  "voluntariado",
  "esfera",
];

/** Unión de categorías que rotan en el carrusel de agenda del home. */
export const HOME_AGENDA_CATEGORIES: readonly AgendaCategory[] = [
  "diplomado",
  "filosofia",
  "curso",
  "taller",
  "conferencia",
  "cultura",
  "voluntariado",
  "voluntariado-comunidad",
  "voluntariado-ninos",
  "voluntariado-ambiente",
  "esfera",
];

/** @deprecated Usar HOME_AGENDA_CATEGORIES */
export const HOME_PRIMARY_AGENDA_CATEGORIES = HOME_AGENDA_CATEGORIES;

/** @deprecated Usar HOME_AGENDA_CATEGORIES */
export const HOME_CULTURA_CURSOS_AGENDA_CATEGORIES: readonly AgendaCategory[] = [
  "cultura",
  "curso",
];

/** Orden estable de categorías para listados de agenda. */
const AGENDA_CATEGORY_ORDER = new Map<AgendaCategory, number>(
  HOME_AGENDA_CATEGORIES.map((category, index) => [category, index]),
);

function normalizeAgendaText(value: string | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("es");
}

/** Compara entradas: fecha → sede → categoría → título. */
export function compareAgendaEntries(a: AgendaEntry, b: AgendaEntry): number {
  const byDate = a.startsAt.localeCompare(b.startsAt);
  if (byDate !== 0) return byDate;

  const bySede = normalizeAgendaText(a.sede).localeCompare(
    normalizeAgendaText(b.sede),
    "es",
  );
  if (bySede !== 0) return bySede;

  const catA = AGENDA_CATEGORY_ORDER.get(a.category) ?? Number.MAX_SAFE_INTEGER;
  const catB = AGENDA_CATEGORY_ORDER.get(b.category) ?? Number.MAX_SAFE_INTEGER;
  if (catA !== catB) return catA - catB;

  return a.title.localeCompare(b.title, "es");
}

export function sortAgendaEntries(entries: AgendaEntry[]): AgendaEntry[] {
  return [...entries].sort(compareAgendaEntries);
}

/** Días tras la fecha en los que sigue visible una actividad (salvo diplomado). */
export const AGENDA_GRACE_DAYS = 2;

/** Días tras la primera sesión del diplomado en los que sigue visible en carruseles. */
export const DIPLOMADO_HOME_GRACE_DAYS = 15;

/** Inicio del día local para comparar fechas sin hora. */
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseStartsAt(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

export function agendaGraceDays(category: AgendaCategory): number {
  return category === "diplomado"
    ? DIPLOMADO_HOME_GRACE_DAYS
    : AGENDA_GRACE_DAYS;
}

/**
 * ¿La actividad sigue visible en agenda (página temática o carrusel)?
 * — Diplomado: visible hasta 15 días después de la fecha.
 * — Resto (filosofía, cultura, cursos…): visible hasta 2 días después.
 */
export function isAgendaActive(
  entry: Pick<AgendaEntry, "startsAt" | "category">,
  reference = new Date(),
): boolean {
  const start = parseStartsAt(entry.startsAt);
  if (!start) return false;
  const today = startOfDay(reference);
  const graceEnd = new Date(start);
  graceEnd.setDate(graceEnd.getDate() + agendaGraceDays(entry.category));
  return today <= graceEnd;
}

/** ¿Ya salió de la ventana visible en agenda? */
export function isAgendaClosed(
  entry: Pick<AgendaEntry, "startsAt" | "category">,
  reference = new Date(),
): boolean {
  return !isAgendaActive(entry, reference);
}

/** @deprecated Usar isAgendaActive */
export function isAgendaUpcoming(
  entry: Pick<AgendaEntry, "startsAt" | "category">,
  reference = new Date(),
): boolean {
  return isAgendaActive(entry, reference);
}

/**
 * ¿Debe mostrarse en carruseles del home?
 * Respeta `showOnHome` además de la ventana activa por categoría.
 */
export function isAgendaActiveForHome(
  entry: Pick<AgendaEntry, "startsAt" | "category" | "showOnHome">,
  reference = new Date(),
): boolean {
  if (entry.showOnHome === false) return false;
  return isAgendaActive(entry, reference);
}

/**
 * Filtra entradas activas para carruseles y tarjetas de agenda por página.
 * Incluye gracia de 2 días (15 para diplomado).
 */
export function getActiveAgendaItems(
  entries: AgendaEntry[],
  reference = new Date(),
): AgendaEntry[] {
  return sortAgendaEntries(
    entries.filter((entry) => isAgendaActive(entry, reference)),
  );
}

/**
 * Alias de getActiveAgendaItems — misma ventana de gracia por categoría.
 */
export function getUpcomingAgendaItems(
  entries: AgendaEntry[],
  reference = new Date(),
): AgendaEntry[] {
  return getActiveAgendaItems(entries, reference);
}

/** Actividades del home filtradas por categorías del carrusel. */
export function getHomeAgendaItemsForCategories(
  entries: AgendaEntry[],
  categories: readonly AgendaCategory[],
  reference = new Date(),
): AgendaEntry[] {
  const allowed = new Set(categories);
  return getActiveAgendaItems(entries, reference).filter((entry) =>
    allowed.has(entry.category),
  );
}

/** Actividades que deben rotar en cualquier carrusel del home. */
export function getHomeAgendaItems(
  entries: AgendaEntry[],
  reference = new Date(),
): AgendaEntry[] {
  return getHomeAgendaItemsForCategories(
    entries,
    HOME_AGENDA_CATEGORIES,
    reference,
  );
}

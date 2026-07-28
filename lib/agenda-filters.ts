import {
  AGENDA_CATEGORY_LABEL,
  AGENDA_FILTER_CATEGORIES,
  sortAgendaEntries,
  type AgendaCategory,
  type AgendaEntry,
} from "@/lib/agenda";
import { categoriesMatchFilter } from "@/lib/agenda-publish-categories";

/** Lugares canónicos para filtrar la agenda. */
export type AgendaLocationFilter =
  | "all"
  | "naco"
  | "los-prados"
  | "izbira"
  | "parque-del-este"
  | "santiago"
  | "otros";

export type AgendaLocationOption = {
  id: Exclude<AgendaLocationFilter, "all">;
  label: string;
  /** Agrupa sedes de Santo Domingo en el selector. */
  group?: "Santo Domingo";
};

export const AGENDA_LOCATION_OPTIONS: readonly AgendaLocationOption[] = [
  { id: "naco", label: "Naco", group: "Santo Domingo" },
  { id: "los-prados", label: "Los Prados", group: "Santo Domingo" },
  { id: "izbira", label: "Izbira", group: "Santo Domingo" },
  { id: "parque-del-este", label: "Parque del Este", group: "Santo Domingo" },
  { id: "santiago", label: "Santiago" },
  { id: "otros", label: "Otros" },
];

export type AgendaFilterState = {
  category: AgendaCategory | "all";
  location: AgendaLocationFilter;
  /** Mes en formato YYYY-MM */
  month: "all" | string;
};

export const EMPTY_AGENDA_FILTERS: AgendaFilterState = {
  category: "all",
  location: "all",
  month: "all",
};

export type AgendaFilterOptions = {
  categories: AgendaCategory[];
  locations: readonly AgendaLocationOption[];
  months: string[];
};

function normalizeSedeText(sede: string | undefined) {
  return (sede ?? "").trim().toLocaleLowerCase("es");
}

/** Clasifica el texto libre de sede en un lugar canónico del filtro. */
export function resolveAgendaLocation(
  sede: string | undefined,
): Exclude<AgendaLocationFilter, "all"> {
  const text = normalizeSedeText(sede);
  if (!text) return "otros";

  if (text.includes("naco")) return "naco";
  if (text.includes("los prados") || /\bprados\b/.test(text)) {
    return "los-prados";
  }
  if (text.includes("izbira")) return "izbira";
  if (
    text.includes("parque del este") ||
    text.includes("parque ecológico") ||
    text.includes("parque ecologico") ||
    text.includes("santo domingo este")
  ) {
    return "parque-del-este";
  }
  if (
    text.includes("santiago") ||
    text.includes("sede santiago")
  ) {
    return "santiago";
  }

  return "otros";
}

export function agendaLocationLabel(
  location: Exclude<AgendaLocationFilter, "all">,
) {
  return (
    AGENDA_LOCATION_OPTIONS.find((option) => option.id === location)?.label ??
    location
  );
}

export function getAgendaFilterOptions(
  entries: AgendaEntry[],
): AgendaFilterOptions {
  const categories = [...AGENDA_FILTER_CATEGORIES];
  const locations = AGENDA_LOCATION_OPTIONS;

  const months = [
    ...new Set(
      entries
        .map((e) => e.startsAt.slice(0, 7))
        .filter((month) => /^\d{4}-\d{2}$/.test(month)),
    ),
  ].sort();

  return { categories, locations, months };
}

export function formatAgendaMonthLabel(month: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;
  const [, year, monthNum] = match;
  const label = new Date(Number(year), Number(monthNum) - 1, 1).toLocaleDateString(
    "es-DO",
    { month: "long", year: "numeric" },
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function hasActiveAgendaFilters(filters: AgendaFilterState) {
  return (
    filters.category !== "all" ||
    filters.location !== "all" ||
    filters.month !== "all"
  );
}

export function filterAgendaEntries(
  entries: AgendaEntry[],
  filters: AgendaFilterState,
): AgendaEntry[] {
  const filtered = entries.filter((entry) => {
    if (!categoriesMatchFilter(entry.category, filters.category)) {
      return false;
    }
    if (
      filters.location !== "all" &&
      resolveAgendaLocation(entry.sede) !== filters.location
    ) {
      return false;
    }
    if (filters.month !== "all" && !entry.startsAt.startsWith(filters.month)) {
      return false;
    }
    return true;
  });

  return sortAgendaEntries(filtered);
}

export function agendaCategoryLabel(category: AgendaCategory) {
  return AGENDA_CATEGORY_LABEL[category];
}

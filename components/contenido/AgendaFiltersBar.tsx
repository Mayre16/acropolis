"use client";

import { SlidersHorizontal, X } from "lucide-react";
import {
  agendaCategoryLabel,
  agendaLocationLabel,
  EMPTY_AGENDA_FILTERS,
  formatAgendaMonthLabel,
  hasActiveAgendaFilters,
  type AgendaFilterOptions,
  type AgendaFilterState,
  type AgendaLocationFilter,
} from "@/lib/agenda-filters";
import type { AgendaCategory } from "@/lib/agenda";

type AgendaFiltersBarProps = {
  options: AgendaFilterOptions;
  filters: AgendaFilterState;
  onChange: (filters: AgendaFilterState) => void;
  resultCount: number;
  totalCount: number;
};

const selectClass =
  "mt-1.5 w-full rounded-xl border border-na-heket/15 bg-white px-3 py-2.5 text-sm font-medium text-na-heketDark shadow-sm transition focus:border-na-kefer focus:outline-none focus:ring-2 focus:ring-na-kefer/25";

export function AgendaFiltersBar({
  options,
  filters,
  onChange,
  resultCount,
  totalCount,
}: AgendaFiltersBarProps) {
  const showCategory = options.categories.length > 0;
  const showLocation = options.locations.length > 0;
  const showMonth = options.months.length > 1;
  const active = hasActiveAgendaFilters(filters);

  const santoDomingoLocations = options.locations.filter(
    (location) => location.group === "Santo Domingo",
  );
  const otherLocations = options.locations.filter((location) => !location.group);

  if (!showCategory && !showLocation && !showMonth) return null;

  function patch(partial: Partial<AgendaFilterState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="mt-8 rounded-2xl border border-na-heket/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="h-4 w-4 text-na-kefer"
            aria-hidden
          />
          <p className="text-sm font-bold text-na-heketDark">Filtrar agenda</p>
        </div>
        <p className="text-xs font-medium text-na-muted">
          {resultCount === totalCount
            ? `${totalCount} actividad${totalCount === 1 ? "" : "es"}`
            : `${resultCount} de ${totalCount} actividades`}
        </p>
      </div>

      <div
        className={`mt-4 grid gap-4 ${
          [showCategory, showLocation, showMonth].filter(Boolean).length >= 3
            ? "sm:grid-cols-3"
            : [showCategory, showLocation, showMonth].filter(Boolean).length === 2
              ? "sm:grid-cols-2"
              : "max-w-md"
        }`}
      >
        {showCategory ? (
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-na-muted">
              Categoría
            </span>
            <select
              value={filters.category}
              onChange={(e) =>
                patch({
                  category: e.target.value as AgendaCategory | "all",
                })
              }
              className={selectClass}
              aria-label="Filtrar por categoría"
            >
              <option value="all">Todas las categorías</option>
              {options.categories.map((category) => (
                <option key={category} value={category}>
                  {agendaCategoryLabel(category)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showLocation ? (
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-na-muted">
              Lugar
            </span>
            <select
              value={filters.location}
              onChange={(e) =>
                patch({ location: e.target.value as AgendaLocationFilter })
              }
              className={selectClass}
              aria-label="Filtrar por lugar"
            >
              <option value="all">Todos los lugares</option>
              {santoDomingoLocations.length > 0 ? (
                <optgroup label="Santo Domingo">
                  {santoDomingoLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.label}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {otherLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {agendaLocationLabel(location.id)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showMonth ? (
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-na-muted">
              Mes
            </span>
            <select
              value={filters.month}
              onChange={(e) => patch({ month: e.target.value })}
              className={selectClass}
              aria-label="Filtrar por mes"
            >
              <option value="all">Todos los meses</option>
              {options.months.map((month) => (
                <option key={month} value={month}>
                  {formatAgendaMonthLabel(month)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {active ? (
        <button
          type="button"
          onClick={() => onChange(EMPTY_AGENDA_FILTERS)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-na-heket/15 px-3 py-1.5 text-xs font-bold text-na-heket transition hover:border-na-kefer hover:text-na-kefer"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );
}

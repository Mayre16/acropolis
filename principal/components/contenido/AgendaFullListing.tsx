"use client";

import { useMemo, useState } from "react";
import { UpcomingAgenda } from "@/components/UpcomingAgenda";
import { AgendaFiltersBar } from "@/components/contenido/AgendaFiltersBar";
import { useCmsEsferaTrainings, useCmsHomeAgenda } from "@/lib/cms/hooks";
import { getHomeUpcomingAgenda } from "@/lib/agenda-registry";
import { isCmsEnabled } from "@/lib/cms/provider";
import {
  EMPTY_AGENDA_FILTERS,
  filterAgendaEntries,
  getAgendaFilterOptions,
  hasActiveAgendaFilters,
} from "@/lib/agenda-filters";

const DEFAULT_INSCRIBE =
  "Hola, me interesa una actividad de Nueva Acrópolis. ¿Me pueden dar más información?";

/** Listado completo de la agenda disponible con filtros. */
export function AgendaFullListing() {
  const cmsItems = useCmsHomeAgenda();
  const esferaTrainings = useCmsEsferaTrainings();
  const fallbackItems = getHomeUpcomingAgenda(undefined, esferaTrainings);
  const [filters, setFilters] = useState(EMPTY_AGENDA_FILTERS);

  const items = isCmsEnabled() ? cmsItems : fallbackItems;

  const filterOptions = useMemo(
    () => getAgendaFilterOptions(items),
    [items],
  );

  const filteredItems = useMemo(
    () => filterAgendaEntries(items, filters),
    [items, filters],
  );

  if (items.length === 0) {
    return (
      <section className="border-t border-na-heket/10 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm text-na-muted">
            No hay actividades programadas en este momento. Vuelve pronto o
            contáctanos por WhatsApp para más información.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          Agenda
        </p>
        <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          Próximos talleres y actividades
        </h2>
        <p className="mt-3 max-w-2xl text-na-muted">
          Filtra por categoría, sede o mes. Los cursos y talleres se consultan por
          WhatsApp; las actividades Esfera, por correo al Punto Focal.
        </p>

        <AgendaFiltersBar
          options={filterOptions}
          filters={filters}
          onChange={setFilters}
          resultCount={filteredItems.length}
          totalCount={items.length}
        />

        {filteredItems.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-na-heket/15 bg-white/70 px-5 py-8 text-center text-sm text-na-muted">
            {hasActiveAgendaFilters(filters)
              ? "Ninguna actividad coincide con los filtros seleccionados. Prueba con otra combinación o limpia los filtros."
              : "No hay actividades para mostrar."}
          </p>
        ) : (
          <UpcomingAgenda
            embedded
            items={filteredItems}
            defaultInscribeMessage={DEFAULT_INSCRIBE}
          />
        )}
      </div>
    </section>
  );
}

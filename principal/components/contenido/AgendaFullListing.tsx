"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { UpcomingAgenda } from "@/components/UpcomingAgenda";
import { AgendaFiltersBar } from "@/components/contenido/AgendaFiltersBar";
import { useAgendaCmsEdit } from "@/components/cms/AgendaCmsEditContext";
import { AgendaCardBody, AgendaCardThumbnail } from "@/components/ContentCardMedia";
import { sortAgendaEntries } from "@/lib/agenda";
import { cmsEntryToAgenda } from "@/lib/cms/agenda-edit";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useCmsEsferaTrainings, useCmsHomeAgenda } from "@/lib/cms/hooks";
import { getHomeUpcomingAgenda } from "@/lib/agenda-registry";
import { isCmsEnabled } from "@/lib/cms/provider";
import { AGENDA_CATEGORY_LABEL } from "@/lib/agenda";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";
import {
  EMPTY_AGENDA_FILTERS,
  filterAgendaEntries,
  getAgendaFilterOptions,
  hasActiveAgendaFilters,
} from "@/lib/agenda-filters";

const DEFAULT_INSCRIBE =
  "Hola, me interesa una actividad de Nueva Acrópolis. ¿Me pueden dar más información?";

function withResolvedImages<T extends { image?: string }>(items: T[]): T[] {
  return items.map((e) => ({
    ...e,
    image: resolveCmsMediaUrl(e.image) ?? e.image,
  }));
}

/** Listado completo de la agenda disponible con filtros. */
export function AgendaFullListing() {
  const edit = useAgendaCmsEdit();
  const cmsItems = useCmsHomeAgenda();
  const esferaTrainings = useCmsEsferaTrainings();
  const fallbackItems = getHomeUpcomingAgenda(undefined, esferaTrainings);
  const [filters, setFilters] = useState(EMPTY_AGENDA_FILTERS);

  const publicItems = isCmsEnabled() ? cmsItems : fallbackItems;

  const editItems = useMemo(() => {
    if (!edit?.ready) return [];
    return withResolvedImages(
      sortAgendaEntries(edit.items.map(cmsEntryToAgenda)),
    );
  }, [edit?.ready, edit?.items]);

  const items = edit?.ready ? editItems : publicItems;

  const filterOptions = useMemo(
    () => getAgendaFilterOptions(items),
    [items],
  );

  const filteredItems = useMemo(
    () => filterAgendaEntries(items, filters),
    [items, filters],
  );

  const sectionHeader = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
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
      </div>
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.addItem()}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
        >
          <Plus className="h-4 w-4" />
          Añadir actividad
        </button>
      ) : null}
    </div>
  );

  if (items.length === 0) {
    return (
      <section
        id="agenda-listing"
        className="border-t border-na-heket/10 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {sectionHeader}
          <p className="mt-8 text-sm text-na-muted">
            {edit?.ready
              ? "No hay actividades con fecha próxima. Pulsa «Añadir actividad» para crear una (elige categoría, fecha ISO y sede en el panel)."
              : "No hay actividades programadas en este momento. Vuelve pronto o contáctanos por WhatsApp para más información."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="agenda-listing"
      className="border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {sectionHeader}

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
              : edit?.ready
                ? "No hay actividades próximas con estos filtros. Añade una actividad o ajusta las fechas."
                : "No hay actividades para mostrar."}
          </p>
        ) : edit?.ready ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {filteredItems.map((it, i) => {
              const a = accentTokens(i);
              const category =
                "category" in it
                  ? AGENDA_CATEGORY_LABEL[
                      (it as typeof it & { category: keyof typeof AGENDA_CATEGORY_LABEL })
                        .category
                    ]
                  : undefined;
              return (
                <li key={it.id ?? `${it.title}-${i}`} className="flex">
                  <button
                    type="button"
                    onClick={() => it.id && edit.setSelectedId(it.id)}
                    className={`group relative flex h-full w-full items-stretch gap-4 overflow-hidden p-5 text-left ring-amber-400/60 hover:ring-2 ${accentCardShell(i)}`}
                  >
                    <span className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow">
                      <Pencil className="h-4 w-4" aria-hidden />
                    </span>
                    <AgendaCardThumbnail
                      src={it.image}
                      alt={it.imageAlt ?? it.title}
                    />
                    <AgendaCardBody
                      className="pr-8"
                      tag={it.tag ?? category}
                      title={it.title}
                      date={it.date}
                      time={it.time}
                      sede={it.sede}
                      iconClass={a.icon}
                      iconWrapClass={a.iconWrap}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
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

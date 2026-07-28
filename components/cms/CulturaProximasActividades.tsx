"use client";

import {
  Pencil,
  Plus,
} from "lucide-react";
import { getUpcomingAgendaItems } from "@/lib/agenda";
import { cmsEntryToAgenda } from "@/lib/cms/agenda-edit";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  useCmsCulturaAgenda,
  useCmsCulturaSectionText,
} from "@/lib/cms/hooks";
import { isCmsEnabled } from "@/lib/cms/provider";
import { CULTURA_PROXIMAS_ACTIVIDADES } from "@/lib/cultura-agenda";
import { UpcomingAgenda } from "@/components/UpcomingAgenda";
import { AgendaCardBody, AgendaCardThumbnail } from "@/components/ContentCardMedia";
import { useCulturaCmsEdit } from "@/components/cms/CulturaCmsEditContext";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";

const DEFAULT_INSCRIBE =
  "Hola, me interesa una actividad cultural de Nueva Acrópolis. ¿Me pueden dar más información?";

export function CulturaProximasActividades() {
  const edit = useCulturaCmsEdit();
  const cmsItems = useCmsCulturaAgenda();
  const sectionText = useCmsCulturaSectionText();
  const fallback = getUpcomingAgendaItems(CULTURA_PROXIMAS_ACTIVIDADES).map(
    (e) => ({
      ...e,
      image: resolveCmsMediaUrl(e.image) ?? e.image,
    }),
  );

  const publicItems = isCmsEnabled()
    ? cmsItems.map((e) => ({
        ...e,
        image: resolveCmsMediaUrl(e.image) ?? e.image,
      }))
    : fallback;

  if (edit?.ready) {
    const items = getUpcomingAgendaItems(
      edit.items.map(cmsEntryToAgenda),
    ).map((e) => ({
      ...e,
      image: resolveCmsMediaUrl(e.image) ?? e.image,
    }));

    return (
      <section
        id="cultura-proximas"
        className="scroll-mt-24 border-t border-na-heket/10 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
                Agenda
              </p>
              <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
                {edit.culturaPage.proximasTitle ?? sectionText.title}
              </h2>
              <p className="mt-3 max-w-2xl text-na-muted">
                {edit.culturaPage.proximasIntro ?? sectionText.intro}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => edit.setSelectedId("__section__")}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar textos
              </button>
              <button
                type="button"
                onClick={() => edit.addItem()}
                className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
              >
                <Plus className="h-4 w-4" />
                Añadir actividad
              </button>
            </div>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => {
              const a = accentTokens(i);
              const cmsItem = edit.items.find((e) => e.id === it.id);
              return (
                <li key={it.id} className="flex">
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
                      tag={it.tag}
                      title={it.title}
                      date={it.date || cmsItem?.startsAt}
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
          {items.length === 0 ? (
            <p className="mt-6 text-sm text-na-muted">
              No hay actividades — pulsa «Añadir actividad».
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <UpcomingAgenda
      title={sectionText.title}
      intro={sectionText.intro}
      items={publicItems}
      defaultInscribeMessage={DEFAULT_INSCRIBE}
    />
  );
}

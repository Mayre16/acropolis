"use client";

import Link from "next/link";
import {
  ArrowRight,
  Pencil,
  Plus,
} from "lucide-react";
import { getActiveAgendaItems } from "@/lib/agenda";
import { cmsEntryToAgenda } from "@/lib/cms/agenda-edit";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  useCmsCursosAgenda,
  useCmsCursosSectionText,
} from "@/lib/cms/hooks";
import { filterCursosAgendaEntries } from "@/lib/cursos-agenda";
import { UpcomingAgenda } from "@/components/UpcomingAgenda";
import { AgendaCardBody, AgendaCardThumbnail } from "@/components/ContentCardMedia";
import { useCursosCmsEdit } from "@/components/cms/CursosCmsEditContext";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";

const DEFAULT_INSCRIBE =
  "Hola, me interesan los cursos y talleres de Nueva Acrópolis. ¿Me dan información de las próximas convocatorias?";

export function CursosProximasActividades() {
  const edit = useCursosCmsEdit();
  const cmsItems = useCmsCursosAgenda();
  const sectionText = useCmsCursosSectionText();
  const publicItems = cmsItems.map((e) => ({
    ...e,
    image: resolveCmsMediaUrl(e.image) ?? e.image,
  }));

  if (edit?.ready) {
    const items = filterCursosAgendaEntries(
      getActiveAgendaItems(edit.agendaItems.map(cmsEntryToAgenda)),
    ).map((e) => ({
      ...e,
      image: resolveCmsMediaUrl(e.image) ?? e.image,
    }));

    return (
      <section
        id="cursos-proximas"
        className="scroll-mt-24 border-t border-na-heket/10 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
                Agenda
              </p>
              <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
                {edit.page.proximasTitle ?? sectionText.title}
              </h2>
              <p className="mt-3 max-w-2xl text-na-muted">
                {edit.page.proximasIntro ?? sectionText.intro}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => edit.setSelectedId("__proximasSection__")}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar textos
              </button>
              <button
                type="button"
                onClick={() => edit.addAgendaItem()}
                className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
              >
                <Plus className="h-4 w-4" />
                Añadir convocatoria
              </button>
            </div>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => {
              const a = accentTokens(i);
              const cmsItem = edit.agendaItems.find((e) => e.id === it.id);
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
              No hay convocatorias — pulsa «Añadir convocatoria».
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (publicItems.length === 0) return null;

  return (
    <section
      id="cursos-proximas"
      className="scroll-mt-24 border-t border-na-heket/10 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
              Agenda
            </p>
            <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              {sectionText.title}
            </h2>
            <p className="mt-3 max-w-2xl text-na-muted">{sectionText.intro}</p>
          </div>
          <Link
            href="/agenda"
            className="inline-flex items-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer"
          >
            Ver agenda completa
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <UpcomingAgenda
          embedded
          items={publicItems}
          defaultInscribeMessage={DEFAULT_INSCRIBE}
        />
      </div>
    </section>
  );
}

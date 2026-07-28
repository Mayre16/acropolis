"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, Pencil, Plus } from "lucide-react";
import { DiplomadoSessionsCarousel } from "@/components/diplomado/DiplomadoSessionsCarousel";
import { getActiveAgendaItems } from "@/lib/agenda";
import { cmsEntryToAgenda } from "@/lib/cms/agenda-edit";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useCmsDiplomadoSessions } from "@/lib/cms/hooks";
import { isCmsEnabled } from "@/lib/cms/provider";
import { DIPLOMADO_PROXIMAS_SESIONES } from "@/lib/diplomado-sessions";
import { useDiplomadoPageDisplay } from "@/lib/cms/diplomado-display";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";

/** Otras sesiones del Diplomado — misma agenda que Filosofía (CMS). */
export function DiplomadoOtherSessions() {
  const edit = useFilosofiaCmsEdit();
  const pageText = useDiplomadoPageDisplay();
  const cmsItems = useCmsDiplomadoSessions();
  const fallback = getActiveAgendaItems(DIPLOMADO_PROXIMAS_SESIONES);
  const items = edit?.ready
    ? getActiveAgendaItems(edit.diplomadoAgenda.map(cmsEntryToAgenda)).map(
        (e) => ({
          ...e,
          image: resolveCmsMediaUrl(e.image),
        }),
      )
    : isCmsEnabled()
      ? cmsItems
      : fallback;

  if (items.length === 0 && !edit?.ready) return null;

  return (
    <section
      id="otras-sesiones"
      className="scroll-mt-20 bg-[var(--dip-panel)] px-4 py-10 text-[var(--dip-ink)] lg:px-8 lg:py-14"
      aria-labelledby="diplomado-otras-sesiones-title"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="relative">
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.setActiveSection("sesiones")}
              className="absolute -top-1 right-0 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase text-white shadow"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </button>
          ) : null}
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--dip-teal)]">
            Convocatorias
          </p>
          <h2
            id="diplomado-otras-sesiones-title"
            className="mt-2 text-[2rem] font-extrabold leading-[1.08] tracking-tight"
          >
            {pageText.otrasSesionesTitle}
          </h2>
          {pageText.otrasSesionesIntro ? (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--dip-muted)]">
              {pageText.otrasSesionesIntro}
            </p>
          ) : null}
        </div>
        <Link
          href="/filosofia"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--dip-teal)] transition hover:text-[var(--dip-bg)]"
        >
          Ver todas en Filosofía
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {edit?.ready ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              edit.addAgendaEntry("diplomado");
              edit.setActiveSection("sesiones");
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--dip-gold)] px-4 py-2 text-xs font-bold uppercase text-[#1a1a18] shadow"
          >
            <Plus className="h-4 w-4" />
            Añadir sesión
          </button>
          <button
            type="button"
            onClick={() => edit.setActiveSection("sesiones")}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-4 py-2 text-xs font-bold uppercase text-amber-950"
          >
            <Pencil className="h-4 w-4" />
            Editar sesiones
          </button>
        </div>
      ) : null}

      {items.length > 0 ? (
        <DiplomadoSessionsCarousel
          items={items}
          onEditItem={
            edit?.ready
              ? (id) => {
                  edit.setSelectedAgendaId(id);
                  edit.setActiveSection("sesiones");
                }
              : undefined
          }
        />
      ) : edit?.ready ? (
        <p className="mt-6 text-sm text-[var(--dip-muted)]">
          No hay sesiones — pulsa «Añadir sesión».
        </p>
      ) : null}

      {edit?.ready ? (
        <ul className="mt-8 space-y-2">
          <li>
            <button
              type="button"
              onClick={() => {
                edit.addAgendaEntry("diplomado", { atStart: true });
                edit.setActiveSection("sesiones");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300/80 bg-amber-50/60 px-4 py-2.5 text-xs font-bold uppercase text-amber-900 transition hover:border-amber-400 hover:bg-amber-100"
            >
              <Plus className="h-4 w-4" />
              Añadir sesión al inicio
            </button>
          </li>
          {edit.diplomadoAgenda.map((e) => (
            <Fragment key={e.id}>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    edit.setSelectedAgendaId(e.id);
                    edit.setActiveSection("sesiones");
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-white px-4 py-3 text-left text-sm hover:ring-2 hover:ring-amber-400/60"
                >
                  <span>
                    <strong>{e.sede || "Sin sede"}</strong>
                    <span className="mx-2 text-[var(--dip-muted)]">·</span>
                    {e.date || e.startsAt}
                  </span>
                  <Pencil className="h-4 w-4 shrink-0 text-amber-600" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    edit.addAgendaEntry("diplomado", { afterId: e.id });
                    edit.setActiveSection("sesiones");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300/80 bg-amber-50/60 px-4 py-2 text-[11px] font-bold uppercase text-amber-900 transition hover:border-amber-400 hover:bg-amber-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir aquí
                </button>
              </li>
            </Fragment>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

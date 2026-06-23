"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import { CivisMediaImage } from "@/components/cms/CivisMediaImage";
import { CivisEditPencil } from "@/components/cms/CmsEditFields";
import { useCivisCmsEdit } from "@/components/cms/CivisCmsEditContext";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import {
  ActividadModal,
} from "@/components/ProximasActividades";
import { CIVIS_FORM_HREF } from "@/lib/civis-content";
import {
  useCivisTalleresPageCopy,
  useMergedOferta,
  useMergedProximasActividades,
} from "@/lib/cms/hooks";
import type { ProximaActividad } from "@/lib/talleres-actividades";
import { cn } from "@/lib/utils/cn";

function AgendaCarouselMeta({ act }: { act: ProximaActividad }) {
  const rows = [
    { icon: CalendarDays, label: "Fecha", value: act.date },
    { icon: Clock, label: "Hora", value: act.time },
    { icon: MapPin, label: "Sede", value: act.sede },
  ] as const;

  return (
    <dl className="mt-3 grid min-h-[4.75rem] shrink-0 grid-cols-1 gap-y-2 text-sm text-na-muted sm:grid-cols-2">
      {rows.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className={cn(
            "inline-flex min-h-[1.375rem] items-center gap-1.5",
            label === "Sede" && "sm:col-span-2",
            !value && "invisible",
          )}
          aria-hidden={!value}
        >
          <Icon className="h-4 w-4 shrink-0 text-na-civis" aria-hidden />
          <dt className="sr-only">{label}</dt>
          <dd
            className={cn(
              label === "Fecha" && "font-semibold text-na-civisDark",
            )}
          >
            {value || "—"}
          </dd>
        </div>
      ))}
      {act.format ? (
        <div className="sm:col-span-2 text-sm font-medium text-na-muted">
          {act.format}
        </div>
      ) : null}
    </dl>
  );
}

/** Carrusel de próximas actividades Civis en el home. */
export function CivisProximasAgendaHome() {
  const edit = useCivisCmsEdit();
  const copy = useCivisTalleresPageCopy();
  const lineas = useMergedOferta();
  const items = useMergedProximasActividades();
  const section = copy.agenda ?? {};

  const LINEA_LABEL: Record<string, string> = Object.fromEntries(
    lineas.map((t) => [t.id, t.title]),
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ProximaActividad | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const n = items.length;
  const current = items[index];

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [n]);

  useEffect(() => {
    if (n <= 1 || reduceMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 7000);
    return () => clearInterval(t);
  }, [n, reduceMotion]);

  if (!current) return null;

  const categoryLabel = LINEA_LABEL[current.lineaId] ?? current.lineaId;

  return (
    <>
      <section
        id="home-agenda-carrusel"
        className="scroll-mt-24 border-t border-na-civis/10 bg-gradient-to-br from-na-civis/[0.06] via-white to-na-civis/[0.04] py-10 sm:py-11"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            {edit?.ready ? (
              <CivisEditPencil
                label="Editar sección agenda"
                onClick={() => edit.setSelectedId("__talleres-agenda-section__")}
                className="right-0 top-0"
              />
            ) : null}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-na-civisDark">
                {section.eyebrow}
              </p>
              <h2 className="mt-2 text-balance text-xl font-black text-na-ink sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-na-muted">
                {section.lede}
              </p>
            </div>
            <Link
              href="/talleres"
              className="inline-flex items-center gap-2 text-sm font-bold text-na-civis transition hover:text-na-civisDark"
            >
              Ver talleres y agenda
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="relative mt-5">
            <article className="overflow-hidden rounded-xl border border-na-civis/12 bg-white shadow-na-card lg:h-[380px] lg:min-h-[380px]">
              {edit?.ready ? (
                <CivisEditPencil
                  label={`Editar ${current.title}`}
                  onClick={() => edit.setSelectedId(`actividad:${current.id}`)}
                  className="right-3 top-3 z-20"
                />
              ) : null}
              <div className="grid lg:h-[380px] lg:min-h-[380px] lg:grid-cols-[1fr_1.05fr]">
                <div className="relative aspect-[16/10] bg-na-civis/5 lg:aspect-auto lg:min-h-0 lg:h-[380px]">
                  {items.map((act, i) => (
                    <div
                      key={act.id}
                      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                      style={{ opacity: i === index ? 1 : 0 }}
                      aria-hidden={i !== index}
                    >
                      <CivisMediaImage
                        src={act.image.src}
                        alt={act.image.alt}
                        fill
                        className="object-cover"
                        style={{
                          objectPosition:
                            act.image.objectPosition ?? "50% 30%",
                        }}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-na-ink/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white/10"
                        aria-hidden
                      />
                    </div>
                  ))}
                  <div className="absolute left-4 top-4 flex min-h-[1.75rem] flex-wrap gap-2">
                    <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-civisDark shadow-sm">
                      {categoryLabel}
                    </span>
                    {current.open ? (
                      <span className="rounded-full bg-na-civis px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                        Abierto
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col overflow-hidden p-5 sm:p-6 lg:h-[380px]">
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <OfertaFormativaItem
                      variant="summary"
                      title={current.title}
                      intro={current.excerpt?.trim() || "\u00A0"}
                      meta={<AgendaCarouselMeta act={current} />}
                      titleClassName="line-clamp-2 min-h-[3.25rem] shrink-0 text-lg sm:min-h-[3.5rem] sm:text-xl"
                      introClassName="mt-2 line-clamp-3 min-h-0 flex-none text-na-muted [&:empty]:invisible"
                    />
                  </div>

                  <div className="mt-auto flex shrink-0 flex-wrap items-center gap-3 border-t border-na-civis/8 pt-5">
                    <Link
                      href={CIVIS_FORM_HREF}
                      className="inline-flex items-center gap-2 rounded-full bg-na-civis px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-na-civis/20 transition hover:bg-na-civisDark"
                    >
                      Solicitar propuesta
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(current)}
                      className="inline-flex items-center gap-2 rounded-full border border-na-civis/25 px-5 py-2.5 text-sm font-semibold text-na-civis transition hover:bg-na-civis/5"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {n > 1 ? (
              <>
                <div className="mt-5 flex items-center justify-center gap-2">
                  {items.map((act, i) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        i === index
                          ? "w-8 bg-na-civis"
                          : "w-2.5 bg-na-civis/25 hover:bg-na-civis/45",
                      )}
                      aria-label={
                        act.date
                          ? `Ver: ${act.title}, ${act.date}`
                          : `Ver: ${act.title}`
                      }
                      aria-current={i === index ? "true" : undefined}
                    />
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 lg:flex">
                  <button
                    type="button"
                    onClick={() => setIndex((i) => (i - 1 + n) % n)}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-na-civis/15 bg-white/95 text-na-civis shadow-na-soft transition hover:bg-white"
                    aria-label="Actividad anterior"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndex((i) => (i + 1) % n)}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-na-civis/15 bg-white/95 text-na-civis shadow-na-soft transition hover:bg-white"
                    aria-label="Siguiente actividad"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {selected ? (
        <ActividadModal act={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { whatsAppHref, whatsAppUrlForCategory, type WhatsAppUrls } from "@/lib/whatsapp-messages";
import type { AgendaCategory } from "@/lib/agenda";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import { EsferaInquiryButton } from "@/components/EsferaInquiryButton";
import { AgendaCardBody, AgendaCardThumbnail } from "@/components/ContentCardMedia";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";
import { useWhatsAppUrls } from "@/lib/cms/hooks";

export type AgendaItem = {
  id?: string;
  title: string;
  date: string;
  time: string;
  sede: string;
  tag?: string;
  /** Foto opcional (p. ej. del Diplomado). Se muestra como miniatura. */
  image?: string;
  imageAlt?: string;
  /** Texto ampliado para el popup. */
  description?: string;
  /** Mensaje prellenado de WhatsApp al pulsar inscribirse. */
  inscribeMessage?: string;
};

type Props = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  items: AgendaItem[];
  /** Sin cabecera ni sección externa — para incrustar en otra página. */
  embedded?: boolean;
  /** Fondo alterno suave para separar visualmente la sección. */
  tinted?: boolean;
  /** Etiqueta del botón de inscripción en el popup. */
  inscribeLabel?: string;
  /** Mensaje de WhatsApp si el ítem no define `inscribeMessage`. */
  defaultInscribeMessage?: string;
  /** Línea de WhatsApp según tipo de actividad. */
  whatsappCategory?: AgendaCategory;
};

function inscribeUrlFor(
  item: AgendaItem,
  fallback: string | undefined,
  whatsappCategory: AgendaCategory,
  urls?: WhatsAppUrls,
) {
  const text = item.inscribeMessage ?? fallback;
  if (!text) return null;
  return whatsAppHref(text, whatsAppUrlForCategory(whatsappCategory, urls));
}

function itemCategory(item: AgendaItem): AgendaCategory | undefined {
  return "category" in item
    ? (item as AgendaItem & { category?: AgendaCategory }).category
    : undefined;
}

function modalInscribeLabel(item: AgendaItem) {
  const category = itemCategory(item);
  if (category === "conferencia" && item.tag?.toLowerCase().includes("gratuita")) {
    return "Quiero asistir";
  }
  if (
    category === "esfera" ||
    category === "curso" ||
    category === "taller" ||
    category === "conferencia"
  ) {
    return "Solicitar info";
  }
  if (category === "voluntariado") {
    return "Quiero participar";
  }
  return "Quiero inscribirme";
}

function itemKey(item: AgendaItem, index: number) {
  return item.id ?? `${item.title}-${item.date}-${item.sede}-${index}`;
}

export function UpcomingAgenda({
  eyebrow = "Agenda",
  title,
  intro,
  items,
  embedded = false,
  tinted = false,
  inscribeLabel = "Quiero inscribirme",
  defaultInscribeMessage,
  whatsappCategory = "curso",
}: Props) {
  const [selected, setSelected] = useState<AgendaItem | null>(null);
  const whatsappUrls = useWhatsAppUrls();

  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected, close]);

  const selectedCategory = selected ? itemCategory(selected) : undefined;
  const inscribeHref =
    selected && selectedCategory !== "esfera"
      ? inscribeUrlFor(
          selected,
          defaultInscribeMessage,
          selectedCategory ?? whatsappCategory,
          whatsappUrls,
        )
      : null;

  const grid = (
    <ul className={embedded ? "mt-8 grid gap-4 sm:grid-cols-2" : "mt-10 grid gap-4 sm:grid-cols-2"}>
      {items.map((it, i) => {
        const a = accentTokens(i);
        return (
          <li key={itemKey(it, i)} className="flex">
            <button
              type="button"
              onClick={() => setSelected(it)}
              className={`flex h-full w-full items-stretch gap-4 overflow-hidden p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-kefer ${accentCardShell(i)}`}
            >
              <AgendaCardThumbnail
                src={it.image}
                alt={it.imageAlt ?? it.title}
              />
              <AgendaCardBody
                tag={it.tag}
                title={it.title}
                date={it.date}
                time={it.time}
                sede={it.sede}
                iconClass={a.icon}
                iconWrapClass={a.iconWrap}
                footer={
                  <p className={`text-xs font-medium ${a.link}`}>
                    Ver detalles →
                  </p>
                }
              />
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {embedded ? (
        grid
      ) : (
        <section
          className={
            tinted
              ? "border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
              : "border-t border-na-heket/10 py-14 sm:py-16"
          }
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              {title ?? "Próximas actividades"}
            </h2>
            {intro ? (
              <p className="mt-3 max-w-2xl text-na-muted">{intro}</p>
            ) : null}
            {grid}
          </div>
        </section>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="presentation"
          onClick={close}
        >
          <div className="absolute inset-0 bg-na-ink/60 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-modal-title"
            className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.5rem] border border-na-heket/10 bg-na-surface shadow-na-card sm:max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-na-ink/50 text-white backdrop-blur-sm transition hover:bg-na-ink/70"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            {selected.image ? (
              <div className="relative aspect-[16/9] w-full shrink-0 bg-na-heket/5">
                <Image
                  src={selected.image}
                  alt={selected.imageAlt ?? selected.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 36rem"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8">
              {selected.tag ? (
                <span className="inline-block w-fit rounded-full bg-na-amon/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-na-amon">
                  {selected.tag}
                </span>
              ) : null}
              <OfertaFormativaItem
                titleId="agenda-modal-title"
                title={selected.title}
                intro={
                  selected.description ??
                  `Sesión presencial del ${selected.title.toLowerCase()}. Consulta disponibilidad de cupos y confirma horario con la sede.`
                }
                titleClassName="text-2xl sm:text-3xl"
              />

              <dl className="mt-5 space-y-3 rounded-xl bg-na-heket/[0.05] p-4">
                {selected.date ? (
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      className="mt-0.5 h-5 w-5 shrink-0 text-na-kefer"
                      aria-hidden
                    />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-na-muted">
                        Fecha
                      </dt>
                      <dd className="mt-0.5 text-base font-semibold text-na-heketDark">
                        {selected.date}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {selected.time ? (
                  <div className="flex items-start gap-3">
                    <Clock
                      className="mt-0.5 h-5 w-5 shrink-0 text-na-kefer"
                      aria-hidden
                    />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-na-muted">
                        Hora
                      </dt>
                      <dd className="mt-0.5 text-base font-semibold text-na-heketDark">
                        {selected.time}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {selected.sede ? (
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="mt-0.5 h-5 w-5 shrink-0 text-na-kefer"
                      aria-hidden
                    />
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-na-muted">
                        Lugar
                      </dt>
                      <dd className="mt-0.5 text-base font-semibold text-na-heketDark">
                        {selected.sede}
                      </dd>
                    </div>
                  </div>
                ) : null}
              </dl>

              {selectedCategory === "esfera" ? (
                <EsferaInquiryButton
                  taller={selected.title}
                  date={selected.date}
                  time={selected.time}
                  sede={selected.sede}
                  triggerClassName="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105 sm:w-auto sm:self-start"
                />
              ) : inscribeHref ? (
                <a
                  href={inscribeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105 sm:w-auto sm:self-start"
                >
                  {modalInscribeLabel(selected)}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

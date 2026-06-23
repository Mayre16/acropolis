"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Pencil, Plus } from "lucide-react";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import { useCulturaCmsEdit } from "@/components/cms/CulturaCmsEditContext";
import {
  culturaCardSelectedId,
  useCulturaEventosPreviewDisplay,
} from "@/lib/cms/cultura-display";
import { accentCardShell, accentEyebrowClass, accentTokens } from "@/lib/brand-accents";

function EventoCardBody({
  title,
  text,
  date,
  sede,
  accentIndex,
}: {
  title: string;
  text: string;
  date?: string;
  sede?: string;
  accentIndex: number;
}) {
  const a = accentTokens(accentIndex);

  return (
    <>
      <OfertaFormativaItem
        title={title}
        intro={text}
        titleClassName="text-lg"
        introClassName="mt-2 flex-1"
      />
      <div className="mt-3 flex min-h-[2.5rem] flex-col gap-1.5 text-xs text-na-muted">
        <p className="flex min-h-5 items-center gap-1.5">
          <CalendarDays
            className="h-3.5 w-3.5 shrink-0 text-na-kefer"
            aria-hidden
          />
          <span className={date ? "" : "invisible select-none"} aria-hidden={!date}>
            {date || "\u00a0"}
          </span>
        </p>
        <p className="flex min-h-5 items-center gap-1.5">
          <MapPin
            className="h-3.5 w-3.5 shrink-0 text-na-kefer"
            aria-hidden
          />
          <span className={sede ? "" : "invisible select-none"} aria-hidden={!sede}>
            {sede || "\u00a0"}
          </span>
        </p>
      </div>
      <span
        className={`mt-4 inline-flex items-center gap-2 text-sm font-bold transition group-hover:gap-3 ${a.link}`}
      >
        Ver en Eventos
        <ArrowRight className="h-4 w-4" />
      </span>
    </>
  );
}

export function CulturaEventosPreview() {
  const edit = useCulturaCmsEdit();
  const section = useCulturaEventosPreviewDisplay();

  return (
    <section
      id="cultura-eventos"
      className="scroll-mt-24 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="relative flex-1">
            {edit?.ready ? (
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => edit.setSelectedId("__eventos-section__")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar textos
                </button>
                <button
                  type="button"
                  onClick={() => edit.addEventoPreview()}
                  className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
                >
                  <Plus className="h-4 w-4" />
                  Añadir evento
                </button>
              </div>
            ) : null}
            <p className={accentEyebrowClass(2)}>{section.eyebrow}</p>
            <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              {section.title}
            </h2>
            <p className="mt-4 max-w-2xl text-na-muted">{section.intro}</p>
          </div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer"
          >
            Ver todos los eventos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.cards.map(({ id, src, alt, title, text, date, sede, href }, i) => (
            <li key={id} className="relative">
              {edit?.ready ? (
                <button
                  type="button"
                  onClick={() =>
                    edit.setSelectedId(culturaCardSelectedId("evento", id))
                  }
                  className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                  aria-label={`Editar ${title}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}
              {edit?.ready ? (
                <div
                  className={`flex h-full flex-col overflow-hidden ${accentCardShell(i)}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-na-heket/5">
                    {src ? (
                      <Image
                        src={src}
                        alt={alt}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-semibold text-amber-800">
                        Sin foto — clic en ✎
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <EventoCardBody
                      title={title}
                      text={text}
                      date={date}
                      sede={sede}
                      accentIndex={i}
                    />
                  </div>
                </div>
              ) : (
                <Link
                  href={href ?? "/eventos"}
                  className={`group flex h-full flex-col overflow-hidden ${accentCardShell(i)}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <EventoCardBody
                      title={title}
                      text={text}
                      date={date}
                      sede={sede}
                      accentIndex={i}
                    />
                  </div>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { CalendarDays, MapPin, Pencil } from "lucide-react";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import { CourseInscribeButton } from "@/components/CourseInscribeButton";
import { useCulturaCmsEdit } from "@/components/cms/CulturaCmsEditContext";
import {
  culturaCardSelectedId,
  useCulturaTalleresDisplay,
} from "@/lib/cms/cultura-display";
import { accentCardShell, accentEyebrowClass } from "@/lib/brand-accents";

export function CulturaTalleresSection() {
  const edit = useCulturaCmsEdit();
  const section = useCulturaTalleresDisplay();

  return (
    <section id="cultura-talleres" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="relative">
        {edit?.ready ? (
          <button
            type="button"
            onClick={() => edit.setSelectedId("__talleres-section__")}
            className="absolute right-0 top-0 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar textos
          </button>
        ) : null}
        <p className={accentEyebrowClass(1)}>{section.eyebrow}</p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {section.title}
        </h2>
        <p className="mt-4 max-w-2xl text-na-muted">{section.intro}</p>
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {section.cards.map(
          (
            {
              id,
              src,
              alt,
              title,
              text,
              date,
              sede,
              inscribeWhatsappNumber,
              inscribeWhatsappMessage,
            },
            i,
          ) => (
          <li
            key={id}
            className={`relative flex flex-col overflow-hidden ${accentCardShell(i)}`}
          >
            {edit?.ready ? (
              <button
                type="button"
                onClick={() =>
                  edit.setSelectedId(culturaCardSelectedId("taller", id))
                }
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                aria-label={`Editar ${title}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={src}
                alt={alt}
                fill
                unoptimized
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
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
              <CourseInscribeButton
                title={`Taller de ${title}`}
                kind="taller"
                sede={sede}
                accentIndex={i}
                whatsappNumber={inscribeWhatsappNumber}
                whatsappMessage={inscribeWhatsappMessage}
              />
            </div>
          </li>
        ),
        )}
      </ul>
    </section>
  );
}

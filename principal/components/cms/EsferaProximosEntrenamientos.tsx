"use client";

import Image from "next/image";
import { CalendarDays, Clock, MapPin, Pencil, Plus } from "lucide-react";
import { EsferaInquiryButton } from "@/components/EsferaInquiryButton";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  useCmsEsferaSectionText,
  useCmsEsferaTrainings,
} from "@/lib/cms/hooks";
import { mergeEsferaPage } from "@/lib/cms/esfera-page-edit";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";

export function EsferaProximosEntrenamientos() {
  const edit = useEsferaCmsEdit();
  const publicTrainings = useCmsEsferaTrainings();
  const sectionText = useCmsEsferaSectionText();

  const page = edit?.ready ? mergeEsferaPage(edit.page) : null;
  const trainings = page?.trainings ?? publicTrainings;
  const eyebrow = page?.agendaEyebrow ?? sectionText.eyebrow;
  const title = page?.agendaTitle ?? sectionText.title;
  const intro = page?.agendaIntro ?? sectionText.intro;

  return (
    <section
      id="esfera-entrenamientos"
      className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-na-muted">{intro}</p>
        </div>
        {edit?.ready ? (
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
              onClick={() => edit.addTraining()}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir entrenamiento
            </button>
          </div>
        ) : null}
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {trainings.map((item) => {
          const imageSrc =
            resolveCmsMediaUrl(item.imageSrc) ?? item.imageSrc ?? "";
          return (
            <li
              key={item.id}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"
            >
              {edit?.ready ? (
                <button
                  type="button"
                  onClick={() => edit.setSelectedId(item.id)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-amber-500 p-2 text-white shadow"
                  aria-label={`Editar ${item.title}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-na-heket/5">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={item.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : edit?.ready ? (
                  <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                    Sin imagen — clic en lápiz
                  </div>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-wide text-na-kefer">
                  {item.date ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                      {item.date}
                    </span>
                  ) : null}
                  {item.time ? (
                    <span className="inline-flex items-center gap-1.5 normal-case">
                      <Clock className="h-4 w-4 shrink-0" aria-hidden />
                      {item.time}
                    </span>
                  ) : null}
                  {item.sede ? (
                    <span className="inline-flex items-center gap-1.5 normal-case">
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                      {item.sede}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-black text-na-heketDark">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">
                  {item.blurb}
                </p>
                <div className="mt-5 border-t border-na-heket/8 pt-4">
                  <EsferaInquiryButton
                    taller={item.title}
                    date={item.date}
                    time={item.time}
                    sede={item.sede}
                    triggerClassName="inline-flex w-full items-center justify-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-kefer sm:w-auto"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {edit?.ready && trainings.length === 0 ? (
        <p className="mt-6 text-sm text-na-muted">
          No hay entrenamientos — pulsa «Añadir entrenamiento».
        </p>
      ) : null}
    </section>
  );
}

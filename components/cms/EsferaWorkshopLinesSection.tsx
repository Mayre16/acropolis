"use client";

import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { CmsSectionEditBar, CmsEditPencil } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import {
  ESFERA_WORKSHOP_SECTION_ID,
  esferaWorkshopSelectedId,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

export function EsferaWorkshopLinesSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const lines = page.workshopLines ?? [];

  return (
    <section className="relative border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección"
            onClick={() => edit.setSelectedId(ESFERA_WORKSHOP_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-na-heketDark sm:text-3xl">
              {page.workshopLinesTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-na-muted sm:text-base">
              {page.workshopLinesIntro}
            </p>
          </div>
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.addWorkshopLine()}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir línea
            </button>
          ) : null}
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {lines.map(({ id, src, alt, title, text }) => {
            const imageSrc = resolveCmsMediaUrl(src) ?? src;
            return (
              <li
                key={id}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"
              >
                {edit?.ready ? (
                  <CmsEditPencil
                    label={`Editar ${title}`}
                    onClick={() =>
                      edit.setSelectedId(esferaWorkshopSelectedId(id))
                    }
                  />
                ) : null}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={alt}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : edit?.ready ? (
                    <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                      Sin imagen — clic en lápiz
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-black text-na-heketDark">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">
                    {text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

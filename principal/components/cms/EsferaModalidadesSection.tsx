"use client";

import Image from "next/image";
import { Clock, FileDown, Plus } from "lucide-react";
import { SolicitudEsferaDialog } from "@/components/SolicitudEsferaDialog";
import { CmsSectionEditBar, CmsEditPencil } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import {
  ESFERA_BROCHURE_SECTION_ID,
  ESFERA_MODALIDADES_SECTION_ID,
  esferaModalidadSelectedId,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

export function EsferaModalidadesSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const modalidades = page.modalidades ?? [];
  const brochureHref =
    resolveCmsMediaUrl(page.brochureHref) ?? page.brochureHref ?? "";
  const brochureLabel =
    page.brochureButtonLabel ?? "Descarga nuestro brochure";

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección"
            onClick={() => edit.setSelectedId(ESFERA_MODALIDADES_SECTION_ID)}
          />
        </div>
      ) : null}

      <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
        {page.modalidadesEyebrow}
      </p>
      <h2 className="mt-2 text-balance text-2xl font-black text-na-heketDark sm:text-3xl">
        {page.modalidadesTitle}
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-na-muted sm:text-base">
        {page.modalidadesIntro}{" "}
        {page.modalidadesNota ? <span>{page.modalidadesNota}</span> : null}
      </p>

      {edit?.ready ? (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => edit.addModalidad()}
            className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
          >
            <Plus className="h-4 w-4" />
            Añadir taller
          </button>
        </div>
      ) : null}

      <ul className="mt-6 space-y-5">
        {modalidades.map((mod) => {
          const imageSrc = resolveCmsMediaUrl(mod.image) ?? mod.image;
          return (
            <li
              key={mod.id}
              className="relative overflow-hidden rounded-xl border border-na-heket/10 bg-na-surface shadow-na-soft"
            >
              {edit?.ready ? (
                <CmsEditPencil
                  label={`Editar ${mod.title}`}
                  onClick={() =>
                    edit.setSelectedId(esferaModalidadSelectedId(mod.id))
                  }
                />
              ) : null}
              <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch">
                <div className="relative aspect-[5/3] max-h-44 w-full bg-na-heket/5 lg:max-h-none lg:min-h-[168px]">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={mod.imageAlt}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  ) : edit?.ready ? (
                    <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                      Sin imagen — clic en lápiz
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col justify-center p-4 sm:p-5">
                  <OfertaFormativaItem
                    variant="summary"
                    title={mod.title}
                    intro={mod.intro}
                    topics={mod.topics}
                    titleClassName="text-lg sm:text-xl"
                    introClassName="mt-2 text-sm"
                    topicClassName="text-xs sm:text-sm"
                    meta={
                      <div className="mt-1.5 flex flex-wrap gap-2.5 text-[11px] font-semibold uppercase tracking-wide text-na-kefer sm:text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {mod.duration}
                        </span>
                        <span>{mod.format}</span>
                      </div>
                    }
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <SolicitudEsferaDialog triggerLabel="Solicitar taller o charla para mi organización" />
        {brochureHref ? (
          <a
            href={brochureHref}
            download
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-na-heket px-6 py-3 text-sm font-bold text-na-heket transition hover:bg-na-heket hover:text-white"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {brochureLabel}
          </a>
        ) : edit?.ready ? (
          <button
            type="button"
            onClick={() => edit.setSelectedId(ESFERA_BROCHURE_SECTION_ID)}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-dashed border-amber-400 px-6 py-3 text-sm font-bold text-amber-900"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            Configurar brochure PDF
          </button>
        ) : null}
      </div>
    </section>
  );
}

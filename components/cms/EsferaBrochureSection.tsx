"use client";

import { FileDown } from "lucide-react";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { ESFERA_BROCHURE_SECTION_ID } from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

export function EsferaBrochureSection() {
  const page = useEsferaPageDisplay();
  const edit = useEsferaCmsEdit();
  const href = resolveCmsMediaUrl(page.brochureHref) ?? page.brochureHref ?? "#";
  const editing = !!edit?.ready;

  return (
    <section className="relative border-t border-na-heket/10 bg-na-surface py-14 sm:py-16">
      {editing ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar brochure PDF"
            onClick={() => edit?.setSelectedId(ESFERA_BROCHURE_SECTION_ID)}
          />
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {page.brochureEyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            {page.brochureEyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-2xl font-black text-na-heketDark sm:text-3xl">
          {page.brochureTitle}
        </h2>
        {page.brochureLede ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-na-muted sm:text-base">
            {page.brochureLede}
          </p>
        ) : null}
        {page.brochureNote ? (
          <p className="mt-2 text-xs text-na-muted">{page.brochureNote}</p>
        ) : null}
        {href && href !== "#" ? (
          <a
            href={href}
            download
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-kefer"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {page.brochureButtonLabel ?? "Descargar brochure (PDF)"}
          </a>
        ) : editing ? (
          <p className="mt-6 text-sm font-semibold text-amber-800">
            Sin PDF — suba o indique la URL en el editor.
          </p>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import { FileDown } from "lucide-react";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { useQuienesSomosCmsEdit } from "@/components/cms/InstitutionalPageCmsEditContext";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { PERFIL_INSTITUCIONAL_SECTION_ID } from "@/lib/cms/institutional-page-edit";
import { useQuienesSomosPageDisplay } from "@/lib/cms/quienes-somos-display";

export function PerfilInstitucionalSection() {
  const page = useQuienesSomosPageDisplay();
  const edit = useQuienesSomosCmsEdit();
  const href =
    resolveCmsMediaUrl(page.perfilInstitucionalHref) ??
    page.perfilInstitucionalHref ??
    "#";
  const editing = !!edit?.ready;

  return (
    <section
      id="perfil-institucional"
      className="relative scroll-mt-36 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
    >
      {editing ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar perfil institucional"
            onClick={() => edit?.setSelectedId(PERFIL_INSTITUCIONAL_SECTION_ID)}
          />
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          {page.perfilInstitucionalEyebrow}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {page.perfilInstitucionalTitle}
        </h2>
        <p className="mt-5 max-w-3xl leading-relaxed text-na-muted">
          {page.perfilInstitucionalLede}
        </p>
        {page.perfilInstitucionalNote ? (
          <p className="mt-3 text-sm text-na-muted">
            {page.perfilInstitucionalNote}
          </p>
        ) : null}
        <div className="mt-6">
          {href && href !== "#" ? (
            <a
              href={href}
              download
              className="inline-flex items-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-kefer"
            >
              <FileDown className="h-4 w-4" aria-hidden />
              {page.perfilInstitucionalButtonLabel ??
                "Descargar perfil institucional (PDF)"}
            </a>
          ) : editing ? (
            <p className="text-sm font-semibold text-amber-800">
              Sin PDF — suba o indique la URL en el editor.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

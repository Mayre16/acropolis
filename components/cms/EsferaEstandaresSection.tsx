"use client";

import Image from "next/image";
import { ArrowUpRight, CheckCircle2, Quote } from "lucide-react";
import { CmsSectionEditBar, CmsEditPencil } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { EsferaLogo } from "@/components/EsferaLogo";
import { EsferaPrincipiosSection } from "@/components/cms/EsferaPrincipiosSection";
import {
  ESFERA_ESTANDARES_SECTION_ID,
  ESFERA_ESTANDARES_SIDEBAR_ID,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { accentEyebrowClass } from "@/lib/brand-accents";
import {
  ESFERA_OFFICIAL_SITE_LABEL,
  SPHERE_OFFICIAL,
} from "@/lib/esfera-content";

export function EsferaEstandaresSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const manualSrc = resolveCmsMediaUrl(page.manualCoverSrc) ?? page.manualCoverSrc;

  return (
    <section className="relative py-14 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar textos"
            onClick={() => edit.setSelectedId(ESFERA_ESTANDARES_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <p className={accentEyebrowClass(2)}>{page.estandaresEyebrow}</p>
            <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              {page.estandaresTitle}
            </h2>
            <p className="mt-5 rounded-xl border border-na-amon/25 bg-gradient-to-r from-na-amon/10 to-na-helios/10 px-5 py-4 text-sm font-semibold leading-relaxed text-na-heketDark sm:text-base">
              {page.estandaresPuntoFocal}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-na-muted sm:text-base">
              {page.estandaresText}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-na-muted sm:text-base">
              {page.estandaresDetail}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {(page.estandaresSectores ?? []).map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 rounded-lg border border-na-kefer/15 bg-na-kefer/[0.06] px-3 py-2 text-sm font-medium text-na-heketDark"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-na-kefer"
                    aria-hidden
                  />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-na-muted sm:text-base">
              {page.estandaresManual}
            </p>
            <blockquote className="mt-8 flex gap-4 rounded-2xl border border-na-heket/10 bg-na-surface p-5 shadow-na-soft">
              <Quote
                className="h-7 w-7 shrink-0 text-na-amon"
                strokeWidth={1.5}
                aria-hidden
              />
              <div>
                <p className="text-base font-semibold italic text-na-heketDark sm:text-lg">
                  «{page.estandaresQuote}»
                </p>
                <footer className="mt-2 text-xs font-medium text-na-muted">
                  {page.estandaresQuoteSource}
                </footer>
              </div>
            </blockquote>
          </div>

          <div className="relative lg:sticky lg:top-24">
            {edit?.ready ? (
              <CmsEditPencil
                label="Editar cuadro lateral"
                onClick={() => edit.setSelectedId(ESFERA_ESTANDARES_SIDEBAR_ID)}
                className="right-2 top-2"
              />
            ) : null}
            <div className="overflow-hidden rounded-2xl border border-na-kefer/15 bg-gradient-to-br from-na-heket/[0.06] via-na-surface to-na-kefer/[0.1] p-6 shadow-na-card sm:p-8">
              <div className="flex justify-center border-b border-na-heket/10 pb-6">
                <EsferaLogo
                  variant="punto-focal"
                  className="h-auto w-full max-w-[14rem] sm:max-w-[16rem]"
                />
              </div>
              <div className="relative mx-auto mt-6 aspect-[5/4] w-full max-w-[360px]">
                {manualSrc ? (
                  <Image
                    src={manualSrc}
                    alt={page.manualCoverAlt ?? ""}
                    fill
                    unoptimized
                    sizes="360px"
                    className="object-contain object-center drop-shadow-2xl"
                  />
                ) : edit?.ready ? (
                  <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                    Sin imagen — clic en lápiz
                  </div>
                ) : null}
              </div>
              <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wide text-na-kefer">
                {page.manualCaption}
              </p>
              <p className="mt-2 text-center text-sm leading-relaxed text-na-muted">
                {page.manualSubtitle}
              </p>
              <p className="mt-4 text-center">
                <a
                  href={SPHERE_OFFICIAL.home}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-sm font-bold text-na-kefer transition hover:gap-2 hover:text-na-heket"
                >
                  {ESFERA_OFFICIAL_SITE_LABEL}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </p>
            </div>
          </div>
        </div>

        <EsferaPrincipiosSection />
      </div>
    </section>
  );
}

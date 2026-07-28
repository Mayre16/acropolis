"use client";

import {
  BadgeCheck,
  Globe2,
  HeartHandshake,
  Network,
  Plus,
  Quote,
  Share2,
  Shield,
} from "lucide-react";
import { CmsSectionEditBar, CmsEditPencil } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import {
  ESFERA_BENEFICIOS_SECTION_ID,
  esferaBeneficioSelectedId,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import {
  accentEyebrowClass,
  accentInfoCardClass,
  accentTokens,
} from "@/lib/brand-accents";

const BENEFICIO_ICONS = [
  Shield,
  Globe2,
  HeartHandshake,
  Share2,
  BadgeCheck,
  Network,
] as const;

export function EsferaBeneficiosSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const beneficios = page.beneficios ?? [];

  return (
    <section className="relative border-t border-na-heket/10 bg-gradient-to-br from-na-heket/[0.04] via-na-surface to-na-helios/[0.08] py-14 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección"
            onClick={() => edit.setSelectedId(ESFERA_BENEFICIOS_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className={accentEyebrowClass(2)}>{page.beneficiosEyebrow}</p>
        <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {page.beneficiosTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-na-muted sm:text-base">
          {page.beneficiosIntro}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.addBeneficio()}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir tarjeta
            </button>
          ) : null}
        </div>

        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {beneficios.map(({ id, title, text }, i) => {
            const a = accentTokens(i);
            const Icon = BENEFICIO_ICONS[i % BENEFICIO_ICONS.length] ?? Shield;
            return (
              <li key={id} className={`relative ${accentInfoCardClass(i)}`}>
                {edit?.ready ? (
                  <CmsEditPencil
                    label={`Editar ${title}`}
                    onClick={() =>
                      edit.setSelectedId(esferaBeneficioSelectedId(id))
                    }
                  />
                ) : null}
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${a.iconBox}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.85} aria-hidden />
                </div>
                <h3 className={`mt-4 text-base font-black ${a.icon}`}>
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-na-muted">
                  {text}
                </p>
              </li>
            );
          })}
        </ul>

        <blockquote className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-na-kefer/25 bg-gradient-to-br from-na-kefer/10 via-na-surface to-na-amon/12 px-6 py-8 text-center shadow-na-card sm:px-10 sm:py-10">
          <Quote
            className="mx-auto h-9 w-9 text-na-amon"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-4 text-balance text-lg font-bold italic leading-snug text-na-heketDark sm:text-xl">
            {page.beneficiosQuote}
          </p>
          <div
            className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-na-helios/20 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-na-kefer/15 blur-2xl"
            aria-hidden
          />
        </blockquote>
      </div>
    </section>
  );
}

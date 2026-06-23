"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { EsferaImpactStats } from "@/components/EsferaImpactStats";
import {
  ESFERA_IMPACT_GALLERY_SECTION_ID,
  ESFERA_IMPACT_SECTION_ID,
  cmsImpactStatToDisplay,
  esferaImpactGallerySelectedId,
  esferaImpactStatSelectedId,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type { CmsEsferaGallerySlide } from "@/lib/cms/types";

function EsferaImpactGalleryCarousel({
  slides,
  editing,
  onEditSlide,
}: {
  slides: CmsEsferaGallerySlide[];
  editing?: boolean;
  onEditSlide?: (id: string) => void;
}) {
  const visible = slides.filter((s) => s.src?.trim());
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = visible.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    if (n <= 1 || reduceMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 5500);
    return () => clearInterval(t);
  }, [n, reduceMotion]);

  useEffect(() => {
    if (index >= n) setIndex(0);
  }, [index, n]);

  if (n === 0) return null;

  const current = visible[index] ?? visible[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft">
      <div className="relative aspect-[16/9] sm:aspect-[21/9]">
        {visible.map((slide, i) => {
          const slideSrc = resolveCmsMediaUrl(slide.src) ?? slide.src;
          return (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              {editing ? (
                <button
                  type="button"
                  onClick={() => onEditSlide?.(slide.id)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-na-helios p-2 text-na-ink shadow"
                  aria-label="Editar foto"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              ) : null}
              {slideSrc ? (
                <Image
                  src={slideSrc}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 72rem"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-amber-50 text-sm font-semibold text-amber-800">
                  Sin imagen — clic en lápiz
                </div>
              )}
            </div>
          );
        })}

        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + n) % n)}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-na-heketDark/70 p-2 text-white shadow transition hover:bg-na-heketDark"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % n)}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-na-heketDark/70 p-2 text-white shadow transition hover:bg-na-heketDark"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
              {visible.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Ir a foto ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {current.caption ? (
        <p className="border-t border-na-heket/10 px-4 py-3 text-center text-sm text-na-muted">
          {current.caption}
        </p>
      ) : null}
    </div>
  );
}

export function EsferaImpactoSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const stats = page.impactStats ?? [];
  const gallery = page.impactGallery ?? [];
  const displayStats = stats.map(cmsImpactStatToDisplay);
  const statIds = stats.map((s) => s.id);
  const hasGallery = gallery.some((s) => s.src?.trim());

  return (
    <section className="relative border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar impacto"
            onClick={() => edit.setSelectedId(ESFERA_IMPACT_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          {page.impactEyebrow}
        </p>
        <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {page.impactTitle}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-na-muted sm:text-base">
          {page.impactIntro}
        </p>

        <EsferaImpactStats
          stats={displayStats}
          statIds={statIds}
          onEditStat={
            edit?.ready
              ? (id) => edit.setSelectedId(esferaImpactStatSelectedId(id))
              : undefined
          }
        />

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-na-muted sm:text-base">
          {page.impactTestimonial}
        </p>

        {hasGallery || edit?.ready ? (
        <div className="relative mt-10">
          {edit?.ready ? (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  edit.setSelectedId(ESFERA_IMPACT_GALLERY_SECTION_ID)
                }
                className="inline-flex items-center gap-2 rounded-full border border-na-heket/20 bg-na-surface px-4 py-2 text-xs font-bold uppercase text-na-heketDark shadow-sm"
              >
                Editar galería
              </button>
              <button
                type="button"
                onClick={() => edit.addImpactGallerySlide()}
                className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
              >
                <Plus className="h-4 w-4" />
                Añadir foto
              </button>
            </div>
          ) : null}

          {hasGallery ? (
            <EsferaImpactGalleryCarousel
              slides={gallery}
              editing={edit?.ready}
              onEditSlide={(id) =>
                edit?.setSelectedId(esferaImpactGallerySelectedId(id))
              }
            />
          ) : edit?.ready ? (
            <div className="rounded-2xl border border-dashed border-na-heket/25 bg-na-surface/60 px-6 py-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
                {page.impactGalleryTitle}
              </p>
              <p className="mt-3 text-sm text-na-muted">
                {page.impactGalleryEmptyText}
              </p>
              <p className="mt-2 text-xs font-semibold text-amber-800">
                Usa <strong>Añadir foto</strong> para crear el carrusel.
              </p>
            </div>
          ) : null}
        </div>
        ) : null}
      </div>
    </section>
  );
}

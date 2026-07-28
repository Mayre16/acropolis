"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { EsferaImpactStats } from "@/components/EsferaImpactStats";
import {
  ESFERA_IMPACT_GALLERY_SECTION_ID,
  ESFERA_IMPACT_SECTION_ID,
  cmsImpactStatToDisplay,
  esferaImpactGallerySelectedId,
  esferaImpactStatSelectedId,
  newEsferaGallerySlideId,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl, uploadCmsImage } from "@/lib/cms/api-client";
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
  // En edición también mostramos diapositivas sin imagen (placeholder).
  const visible = editing ? slides : slides.filter((s) => s.src?.trim());
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
    if (n <= 1 || reduceMotion || editing) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 6500);
    return () => clearInterval(t);
  }, [n, reduceMotion, editing]);

  useEffect(() => {
    if (index >= n) setIndex(0);
  }, [index, n]);

  if (n === 0) return null;

  const current = visible[index] ?? visible[0];

  const go = (next: number) => setIndex((next + n) % n);

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft sm:rounded-[1.35rem]">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[21/9]">
          {visible.map((slide, i) => {
            const slideSrc = resolveCmsMediaUrl(slide.src) ?? slide.src;
            return (
              <div
                key={slide.id}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: i === index ? 1 : 0 }}
                aria-hidden={i !== index}
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
                    priority={i === 0}
                    className="object-cover object-center"
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
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-na-heketDark/55 to-transparent" />
              <div className="absolute bottom-3 right-3 z-10 rounded-full bg-na-heketDark/70 px-3 py-1 text-[11px] font-bold tabular-nums text-white">
                {index + 1} / {n}
              </div>
            </>
          ) : null}
        </div>

        {current.caption ? (
          <p className="border-t border-na-heket/10 px-4 py-3 text-center text-sm leading-relaxed text-na-muted sm:px-6">
            {current.caption}
          </p>
        ) : null}
      </div>

      {n > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-y-4 left-0 right-0 z-10 hidden items-center justify-between px-2 sm:flex">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-na-soft transition hover:bg-white"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-na-soft transition hover:bg-white"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <ul
            className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:gap-3"
            aria-label="Miniaturas de la galería"
          >
            {visible.map((slide, i) => {
              const thumbSrc = resolveCmsMediaUrl(slide.src) ?? slide.src;
              const active = i === index;
              return (
                <li key={slide.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`relative block h-16 w-24 overflow-hidden rounded-xl border-2 transition sm:h-[4.5rem] sm:w-[7rem] ${
                      active
                        ? "border-na-heket ring-2 ring-na-heket/25 ring-offset-2"
                        : "border-na-heket/15 opacity-80 hover:border-na-heket/35 hover:opacity-100"
                    }`}
                    aria-label={`Ver foto ${i + 1}${slide.alt ? `: ${slide.alt}` : ""}`}
                    aria-current={active ? "true" : undefined}
                  >
                    {thumbSrc ? (
                      <Image
                        src={thumbSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center bg-amber-50 text-[10px] font-semibold text-amber-800">
                        Vacía
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
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
  const showCarousel =
    hasGallery || (!!edit?.ready && gallery.length > 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMany, setUploadingMany] = useState(false);

  async function uploadManyPhotos(files: FileList | null) {
    if (!files?.length || !edit?.token) return;
    setUploadingMany(true);
    try {
      const items: CmsEsferaGallerySlide[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadCmsImage("acropolis", edit.token, file);
        items.push({
          id: newEsferaGallerySlideId(),
          src: url,
          alt: "Momento de taller Esfera",
          caption: "",
        });
      }
      edit.appendImpactGallerySlides(items);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    } finally {
      setUploadingMany(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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

        {showCarousel || edit?.ready ? (
        <div className="relative mt-10">
          {(hasGallery || edit?.ready) && page.impactGalleryTitle ? (
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-na-kefer">
              {page.impactGalleryTitle}
            </p>
          ) : null}

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
                {gallery.length > 0 ? (
                  <span className="rounded-full bg-na-heket/10 px-2 py-0.5 text-[10px] tabular-nums">
                    {gallery.length}
                  </span>
                ) : null}
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/webp,image/jpeg,image/png,.webp,.jpg,.jpeg,.png"
                  multiple
                  className="sr-only"
                  disabled={uploadingMany}
                  onChange={(e) => void uploadManyPhotos(e.target.files)}
                />
                <button
                  type="button"
                  disabled={uploadingMany || !edit.token}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {uploadingMany ? "Subiendo…" : "Añadir fotos"}
                </button>
              </div>
            </div>
          ) : null}

          {edit?.ready ? (
            <p className="mb-3 text-xs text-na-muted">
              Puede elegir <strong>varias fotos a la vez</strong>. Con 2 o más se
              muestra el carrusel (flechas y miniaturas).
            </p>
          ) : null}

          {showCarousel ? (
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
                Usa <strong>Añadir fotos</strong> y selecciona varias imágenes
                para el carrusel.
              </p>
            </div>
          ) : null}
        </div>
        ) : null}
      </div>
    </section>
  );
}

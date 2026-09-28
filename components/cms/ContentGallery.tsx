"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselDotButton } from "@/components/CarouselDotButton";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type { CmsMedia } from "@/lib/cms/types";

/** Galería de fotos de crónicas y artículos: una foto a la vez, entera. */
export function ContentGallery({ images }: { images: CmsMedia[] }) {
  const slides = images.filter((img) => img.src?.trim());
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex((i) => (n === 0 ? 0 : Math.min(i, n - 1)));
  }, [n]);

  useEffect(() => {
    if (n <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, 5000);
    return () => window.clearInterval(t);
  }, [n, paused]);

  if (n === 0) return null;

  const slide = slides[index]!;
  const src = resolveCmsMediaUrl(slide.src) ?? slide.src;

  function go(delta: number) {
    setIndex((i) => (i + delta + n) % n);
  }

  return (
    <div
      className="mt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        <div className="flex h-[min(72vh,560px)] items-center justify-center overflow-hidden rounded-2xl bg-na-heket/[0.04]">
          <img
            key={src}
            src={src}
            alt={slide.alt || `Foto ${index + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-na-heket shadow-md transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-na-heket shadow-md transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {slide.credit ? (
        <p className="mt-2 text-right text-xs text-na-muted">
          Imagen: {slide.credit}
        </p>
      ) : null}

      {n > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <p className="text-xs font-semibold tabular-nums text-na-muted">
            {index + 1} / {n}
          </p>
          <div className="flex gap-1.5" role="group" aria-label="Fotos de la crónica">
            {slides.map((img, i) => (
              <CarouselDotButton
                key={`${img.src}-${i}`}
                size="sm"
                active={i === index}
                onClick={() => setIndex(i)}
                label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

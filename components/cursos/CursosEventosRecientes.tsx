"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useCmsDocument } from "@/lib/cms/provider";
import { CURSOS_EVENTOS_RECIENTES_SECTION } from "@/lib/cursos-content";
import { getCursosRecientesFromEventos } from "@/lib/cursos-eventos-recientes";
import type { CmsVoluntariadoReciente } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";
import { accentEyebrowClass } from "@/lib/brand-accents";

const CARD_HEIGHT = "h-[220px] sm:h-[240px]";

function CursosRecientesCarousel({ items }: { items: CmsVoluntariadoReciente[] }) {
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const current = items[index];

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [n]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % n);
  }, [n]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + n) % n);
  }, [n]);

  useEffect(() => {
    if (n <= 1 || reduceMotion) return;
    const t = setInterval(goNext, 7000);
    return () => clearInterval(t);
  }, [n, reduceMotion, goNext]);

  if (!current) return null;

  return (
    <div className="relative mt-5">
      <article
        className={cn(
          "overflow-hidden rounded-xl border border-na-heket/12 bg-white shadow-na-soft",
          CARD_HEIGHT,
        )}
      >
        <div className={cn("grid h-full sm:grid-cols-[minmax(0,1.05fr)_1fr]", CARD_HEIGHT)}>
          <div className={cn("relative min-h-[9rem] bg-na-heket/5 sm:min-h-0", CARD_HEIGHT)}>
            {items.map((item, i) => {
              const src = item.src;
              return (
                <div
                  key={item.id}
                  className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                  style={{ opacity: i === index ? 1 : 0 }}
                  aria-hidden={i !== index}
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 40vw"
                      unoptimized
                    />
                  ) : null}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-na-heketDark/35 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-white/15"
                    aria-hidden
                  />
                </div>
              );
            })}
          </div>

          <div className={cn("flex min-h-0 flex-col p-4 sm:p-5", CARD_HEIGHT)}>
            <div className="min-h-0 flex-1 overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-na-kefer">
                {current.date}
              </p>
              <h3 className="mt-1 line-clamp-2 text-base font-black text-na-heketDark sm:text-lg">
                {current.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-na-muted sm:text-sm">
                {current.text}
              </p>
            </div>
            {current.href ? (
              <Link
                href={current.href}
                className="mt-3 inline-flex shrink-0 items-center gap-1 text-xs font-bold text-na-kefer transition hover:gap-1.5 sm:text-sm"
              >
                Ver crónica
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      </article>

      {n > 1 ? (
        <>
          <div className="mt-4 flex items-center justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-7 bg-na-heket"
                    : "w-2 bg-na-heket/25 hover:bg-na-heket/45"
                }`}
                aria-label={`Ver crónica: ${item.title}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 -left-2 -right-2 flex items-center justify-between sm:-left-3 sm:-right-3">
            <button
              type="button"
              onClick={goPrev}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-sm transition hover:bg-white sm:h-9 sm:w-9"
              aria-label="Crónica anterior"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-sm transition hover:bg-white sm:h-9 sm:w-9"
              aria-label="Siguiente crónica"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function CursosEventosRecientes() {
  const cms = useCmsDocument();
  const items = getCursosRecientesFromEventos(cms).map((item) => ({
    ...item,
    src: resolveCmsMediaUrl(item.src) ?? item.src,
  }));

  if (items.length === 0) return null;

  return (
    <section
      id="cursos-eventos-recientes"
      className="scroll-mt-24 border-t border-na-heket/10 bg-na-sand/30 py-10 sm:py-11"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={accentEyebrowClass(1)}>
              {CURSOS_EVENTOS_RECIENTES_SECTION.eyebrow}
            </p>
            <h2 className="mt-2 text-balance text-xl font-black text-na-heketDark sm:text-2xl">
              {CURSOS_EVENTOS_RECIENTES_SECTION.title}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-na-muted">
              {CURSOS_EVENTOS_RECIENTES_SECTION.intro}
            </p>
          </div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 text-sm font-bold text-na-heket transition hover:text-na-kefer"
          >
            Ver todos los eventos
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <CursosRecientesCarousel items={items} />
      </div>
    </section>
  );
}

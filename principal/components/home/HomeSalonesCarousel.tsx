"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  MapPin,
  UsersRound,
} from "lucide-react";
import { SalonInquiryButton } from "@/components/SalonInquiryButton";
import { cn } from "@/lib/utils/cn";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useMergedSalones } from "@/lib/cms/salones-hooks";
import { HOME_SALONES_CAROUSEL } from "@/lib/home-cursos-carousels";
import { LAYOUT_LABELS, type Salon } from "@/lib/salones";

const CARD_LG_HEIGHT = "lg:h-[380px] lg:min-h-[380px]";

function SalonCarouselMeta({ salon }: { salon: Salon }) {
  const maxCapacity = Math.max(
    salon.capacities.butacas,
    salon.capacities.mesas,
    salon.capacities.herradura,
  );

  return (
    <dl className="mt-3 grid gap-2 text-sm text-na-muted">
      <div className="inline-flex items-center gap-1.5">
        <MapPin className="h-4 w-4 shrink-0 text-na-kefer" aria-hidden />
        <dt className="sr-only">Sede</dt>
        <dd>Sede {salon.sede} · {salon.city}</dd>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <LayoutGrid className="h-4 w-4 shrink-0 text-na-kefer" aria-hidden />
        <dt className="sr-only">Disposición</dt>
        <dd>{LAYOUT_LABELS[salon.featuredLayout]}</dd>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <UsersRound className="h-4 w-4 shrink-0 text-na-kefer" aria-hidden />
        <dt className="sr-only">Capacidad</dt>
        <dd>Hasta {maxCapacity} personas</dd>
      </div>
    </dl>
  );
}

export function HomeSalonesCarousel() {
  const salones = useMergedSalones();
  const items = useMemo(
    () => salones.filter((s) => s.image?.src?.trim()),
    [salones],
  );

  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = items.length;
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

  useEffect(() => {
    if (n <= 1 || reduceMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 8500);
    return () => clearInterval(t);
  }, [n, reduceMotion]);

  if (!current || n === 0) return null;

  return (
    <section
      id="home-salones"
      className="scroll-mt-24 border-t border-na-heket/10 bg-na-heket/[0.04] py-10 sm:py-11"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-na-kefer">
              {HOME_SALONES_CAROUSEL.eyebrow}
            </p>
            <h2 className="mt-2 text-balance text-xl font-black text-na-heketDark sm:text-2xl">
              {HOME_SALONES_CAROUSEL.title}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-na-muted">
              {HOME_SALONES_CAROUSEL.intro}
            </p>
          </div>
          <Link
            href={HOME_SALONES_CAROUSEL.linkHref}
            className="inline-flex items-center gap-2 text-sm font-bold text-na-heket transition hover:text-na-kefer"
          >
            {HOME_SALONES_CAROUSEL.linkLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="relative mt-5">
          <article
            className={cn(
              "overflow-hidden rounded-xl border border-na-heket/12 bg-white shadow-na-card",
              CARD_LG_HEIGHT,
            )}
          >
            <div className={cn("grid lg:grid-cols-[1.05fr_1fr]", CARD_LG_HEIGHT)}>
              <div
                className={cn(
                  "relative aspect-[16/10] bg-na-heket/5 lg:order-1 lg:aspect-auto lg:min-h-0",
                  CARD_LG_HEIGHT,
                )}
              >
                {items.map((item, i) => {
                  const src =
                    resolveCmsMediaUrl(item.image.src) ?? item.image.src;
                  return (
                    <div
                      key={item.id}
                      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                      style={{ opacity: i === index ? 1 : 0 }}
                      aria-hidden={i !== index}
                    >
                      <Image
                        src={src}
                        alt={item.image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        unoptimized
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-na-heketDark/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white/10"
                        aria-hidden
                      />
                    </div>
                  );
                })}
                <div className="absolute left-4 top-4 flex min-h-[1.75rem] flex-wrap gap-2">
                  <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-heketDark shadow-sm">
                    Alquiler
                  </span>
                  <span className="rounded-full bg-na-helios px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-ink shadow-sm">
                    {LAYOUT_LABELS[current.featuredLayout]}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "flex flex-col overflow-hidden p-5 sm:p-6 lg:order-2",
                  CARD_LG_HEIGHT,
                )}
              >
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <h3 className="line-clamp-2 text-lg font-black text-na-heketDark sm:text-xl">
                    Salón {current.name}
                  </h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-na-muted">
                    {current.summary}
                  </p>
                  <SalonCarouselMeta salon={current} />
                </div>

                <div className="mt-auto flex shrink-0 flex-wrap items-center gap-3 pt-4">
                  <SalonInquiryButton
                    salon={current.name}
                    sede={current.sede}
                    triggerLabel={HOME_SALONES_CAROUSEL.ctaLabel}
                    className="inline-flex rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-kefer"
                  />
                  <Link
                    href={HOME_SALONES_CAROUSEL.linkHref}
                    className="inline-flex items-center gap-2 rounded-full border border-na-heket/25 px-5 py-2.5 text-sm font-semibold text-na-heket transition hover:bg-na-heket/5"
                  >
                    Ver salones
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {n > 1 ? (
            <>
              <div className="mt-5 flex items-center justify-center gap-2">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index
                        ? "w-8 bg-na-heket"
                        : "w-2.5 bg-na-heket/25 hover:bg-na-heket/45"
                    }`}
                    aria-label={`Ver salón: ${item.name}`}
                    aria-current={i === index ? "true" : undefined}
                  />
                ))}
              </div>

              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 lg:flex">
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + n) % n)}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-na-soft transition hover:bg-white"
                  aria-label="Salón anterior"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % n)}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-na-soft transition hover:bg-white"
                  aria-label="Siguiente salón"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

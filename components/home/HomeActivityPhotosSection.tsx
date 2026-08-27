"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditHooks";
import { CarouselDotButton } from "@/components/CarouselDotButton";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useMergedEventos } from "@/lib/cms/hooks";
import { EVENTOS, sortEventosByDateDesc } from "@/lib/eventos";
import { isCmsEnabled } from "@/lib/cms/provider";

const HOME_CRONICAS_LIMIT = 6;

function usePerView(itemCount: number) {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const max = Math.min(itemCount, 3);
      setPerView(w >= 1024 ? max : w >= 640 ? Math.min(2, max) : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [itemCount]);

  return perView;
}

export function HomeActivityPhotosSection() {
  const edit = useHomeCmsEdit();
  const merged = useMergedEventos();

  const cronicas = useMemo(() => {
    const source = isCmsEnabled() ? merged : EVENTOS;
    return sortEventosByDateDesc(source)
      .filter((e) => e.image?.src?.trim())
      .slice(0, HOME_CRONICAS_LIMIT);
  }, [merged]);

  const n = cronicas.length;
  const perView = usePerView(n);
  const maxIndex = Math.max(0, n - perView);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (n <= perView || paused || reduceMotion) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % (maxIndex + 1));
    }, 4500);
    return () => window.clearInterval(t);
  }, [n, perView, maxIndex, paused, reduceMotion]);

  if (n === 0) return null;

  const gapRem = 0.75;

  return (
    <section
      id="home-fotos"
      className="scroll-mt-24 border-t border-na-heket/10 bg-na-sand/60 py-14 sm:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 max-w-2xl flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
              Crónicas
            </p>
            <h2 className="mt-2 text-2xl font-black text-na-heketDark sm:text-3xl">
              Últimas actividades
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-na-muted sm:mx-0 sm:text-base">
              Las crónicas más recientes — filosofía, cultura y voluntariado en
              acción. Entra a cada una para leer lo que se vivió.
              {edit?.ready ? (
                <span className="mt-1 block text-xs font-semibold text-amber-800">
                  Esta sección toma las últimas crónicas de Eventos. Edítalas en
                  /eventos.
                </span>
              ) : null}
            </p>
          </div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-1 text-sm font-bold text-na-kefer transition hover:gap-2"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="relative mt-8">
          <div className="overflow-hidden">
            <ul
              className="flex gap-3 transition-transform duration-700 ease-in-out sm:gap-4"
              style={{
                transform: `translateX(calc(-${index} * ((100% - ${(perView - 1) * gapRem}rem) / ${perView} + ${gapRem}rem)))`,
              }}
            >
              {cronicas.map((ev) => {
                const src =
                  resolveCmsMediaUrl(ev.image.src) ?? ev.image.src;
                return (
                  <li
                    key={ev.slug}
                    className="shrink-0"
                    style={{
                      width:
                        perView === 1
                          ? "100%"
                          : perView === 2
                            ? `calc((100% - ${gapRem}rem) / 2)`
                            : `calc((100% - ${gapRem * 2}rem) / 3)`,
                    }}
                  >
                    <Link
                      href={`/eventos/${ev.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-white shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card"
                    >
                      <div className="relative aspect-[4/3] w-full bg-na-heket/5">
                        {src ? (
                          <Image
                            src={src}
                            alt={ev.image.alt || ev.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized
                          />
                        ) : null}
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-heketDark backdrop-blur">
                          {ev.category}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-na-muted">
                          <CalendarDays className="h-3.5 w-3.5 text-na-kefer" />
                          {ev.date || "Sin fecha"}
                        </span>
                        <h3 className="mt-2 line-clamp-2 text-base font-black leading-snug text-na-heketDark">
                          {ev.title}
                        </h3>
                        {ev.excerpt ? (
                          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-na-muted">
                            {ev.excerpt}
                          </p>
                        ) : null}
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-na-kefer transition group-hover:gap-2">
                          Leer crónica
                          <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {n > perView ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setIndex((i) => (i - 1 + maxIndex + 1) % (maxIndex + 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white text-na-heket transition hover:bg-na-heket/5"
                aria-label="Crónicas anteriores"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: maxIndex + 1 }, (_, i) => (
                  <CarouselDotButton
                    key={i}
                    size="sm"
                    active={i === index}
                    onClick={() => setIndex(i)}
                    label={`Grupo de crónicas ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % (maxIndex + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white text-na-heket transition hover:bg-na-heket/5"
                aria-label="Siguientes crónicas"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { ContenidoSlide } from "@/lib/contenido-content";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";

type ContenidoHubProps = {
  slides: ContenidoSlide[];
  lede: string;
};

const thumbClass =
  "group block w-full overflow-hidden rounded-xl bg-na-heket/5 text-left transition hover:ring-2 hover:ring-na-heket/40 hover:ring-offset-2 hover:ring-offset-[#eef0f2] sm:rounded-2xl";

function ThumbCard({ slide }: { slide: ContenidoSlide }) {
  const inner = slide.icon ? (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#eef2f6] via-white to-[#e8edf2] p-4">
      <Image
        src={slide.icon}
        alt={slide.iconAlt ?? slide.label}
        width={1050}
        height={330}
        unoptimized
        className="h-auto w-[90%] max-w-[9.5rem] object-contain"
      />
      <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-na-ink/75 to-transparent px-3 pb-3 pt-10 text-sm font-bold text-white sm:px-4 sm:pb-4 sm:text-base">
        {slide.label}
      </span>
    </div>
  ) : (
    <div className="relative aspect-square w-full overflow-hidden">
      <Image
        src={slide.image}
        alt={slide.imageAlt}
        fill
        unoptimized
        className="object-cover transition duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, 280px"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-na-ink/70 via-na-ink/10 to-transparent transition group-hover:from-na-heketDark/75"
        aria-hidden
      />
      <span className="absolute bottom-0 left-0 right-0 px-3 pb-3 text-sm font-bold text-white sm:px-4 sm:pb-4 sm:text-base">
        {slide.label}
      </span>
    </div>
  );

  if (slide.external) {
    return (
      <LeaveSiteLink href={slide.href} className={thumbClass} aria-label={slide.cta}>
        {inner}
      </LeaveSiteLink>
    );
  }

  return (
    <Link href={slide.href} className={thumbClass} aria-label={slide.cta}>
      {inner}
    </Link>
  );
}

export function ContenidoHub({ slides, lede }: ContenidoHubProps) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    if (n <= 1 || reduceMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, reduceMotion]);

  const go = useCallback(
    (next: number) => {
      if (n === 0) return;
      setIndex((next + n) % n);
    },
    [n],
  );

  if (n === 0) return null;

  const slide = slides[index];

  const ctaClass =
    "inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-na-heketDark shadow-md transition hover:bg-white/90";

  return (
    <>
      <section
        id="contenido-hero"
        className="scroll-mt-24 relative overflow-hidden rounded-b-[1.75rem] bg-na-heketDark"
      >
        <div className="relative min-h-[34rem] sm:min-h-[40rem] lg:min-h-[44rem]">
          {slides.map((s, i) => (
            <div
              key={s.href}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
            >
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                unoptimized
                className="object-cover object-center brightness-[1.04] saturate-[1.06]"
                sizes="100vw"
              />
            </div>
          ))}

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-na-heketDark/95 via-na-heket/55 to-na-heket/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,201,13,0.12),transparent_45%)]"
            aria-hidden
          />

          <div className="pointer-events-none relative z-10 mx-auto flex h-full min-h-[inherit] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-helios drop-shadow-sm">
              Contenido digital
            </p>
            <h1 className="mt-2 max-w-2xl text-balance text-3xl font-black leading-tight text-white drop-shadow-md sm:text-4xl lg:text-[2.75rem]">
              Descubre nuestro contenido
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/90 drop-shadow sm:text-base">
              {lede}
            </p>

            <div className="relative mt-8 min-h-[15rem] max-w-xl sm:min-h-[16rem]">
              {slides.map((s, i) => (
                <div
                  key={s.href}
                  className="absolute inset-0 rounded-2xl border border-white/15 bg-na-heketDark/35 p-5 backdrop-blur-sm transition-opacity duration-500 ease-in-out sm:p-6"
                  style={{ opacity: i === index ? 1 : 0 }}
                  aria-hidden={i !== index}
                >
                  {s.icon ? (
                    <div className="mb-3 inline-flex rounded-xl bg-white/95 px-4 py-2.5 shadow-sm">
                      <Image
                        src={s.icon}
                        alt={s.iconAlt ?? s.label}
                        width={1050}
                        height={330}
                        unoptimized
                        className="h-9 w-auto max-w-[min(100%,14rem)] object-contain object-left sm:h-10"
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-na-helios">
                      {s.label}
                    </p>
                  )}
                  <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                    {s.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/90 sm:text-base">
                    {s.description}
                  </p>
                  <div
                    className={`pointer-events-auto relative z-20 mt-4 ${i === index ? "" : "invisible"}`}
                  >
                    {s.external ? (
                      <LeaveSiteLink href={s.href} className={ctaClass}>
                        {s.cta}
                        <ArrowRight className="h-4 w-4" />
                      </LeaveSiteLink>
                    ) : (
                      <Link href={s.href} className={ctaClass}>
                        {s.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pointer-events-auto relative z-20 mt-6 max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-na-helios/90">
                También en contenido
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {slides.map((s) => {
                  const pillClass =
                    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
                    (s.href === slide.href
                      ? "border-white/40 bg-white/20 text-white"
                      : "border-white/15 bg-na-heketDark/30 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white");

                  return (
                    <li key={s.href}>
                      {s.external ? (
                        <LeaveSiteLink href={s.href} className={pillClass}>
                          {s.label}
                        </LeaveSiteLink>
                      ) : (
                        <Link href={s.href} className={pillClass}>
                          {s.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {n > 1 ? (
              <div className="pointer-events-auto relative z-20 mt-8 hidden shrink-0 justify-end gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section
        aria-label="Acceso al contenido"
        className="border-b border-na-heket/10 bg-[#eef0f2] py-12 sm:py-14"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Acceso al contenido
          </p>
          <p className="mt-2 text-sm text-na-muted">
            Elige una sección para entrar directamente.
          </p>

          <ul className="mt-8 grid grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
            {slides.map((s) => (
              <li key={s.href}>
                <ThumbCard slide={s} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import type { HeroImage } from "@/lib/hero-images";
import { CIVIS_HERO_IMAGES } from "@/lib/hero-images";

type CivisHeroProps = {
  title: string;
  lede: string;
  eyebrow?: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  images?: HeroImage[];
  /** Botones de edición CMS sobre el carrusel de fotos. */
  carouselEditActions?: ReactNode;
};

export function CivisHero({
  title,
  lede,
  eyebrow = "Formación para empresas y equipos",
  subtitle,
  ctaHref = "/talleres",
  ctaLabel = "Ver talleres",
  images = CIVIS_HERO_IMAGES,
  carouselEditActions,
}: CivisHeroProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="lg:grid lg:min-h-[min(30rem,82vh)] lg:grid-cols-2 lg:items-center lg:gap-x-8 xl:gap-x-12">
          <div className="order-first pt-8 pb-8 sm:pt-10 lg:order-last lg:flex lg:justify-center lg:pb-10 lg:pt-12">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[20rem] overflow-hidden rounded-2xl border-2 border-[#3e48a1]/25 bg-white shadow-[0_12px_40px_rgba(37,46,101,0.12)] sm:max-w-[24rem] lg:max-w-[30rem] lg:rounded-[1.25rem]">
              {carouselEditActions}
              <HeroCarousel
                images={images}
                priorityFirst
                className="absolute inset-0"
                defaultObjectPosition="50% 30%"
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-t from-[#252e65]/15 via-transparent to-transparent"
                aria-hidden
              />
            </div>
          </div>

          <div className="relative flex flex-col justify-center bg-white pb-10 sm:pb-14 lg:py-10">
            <div className="relative w-full max-w-xl lg:max-w-none">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3e48a1] sm:text-sm">
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-balance text-4xl font-black leading-[1.08] tracking-tight text-[#252e65] sm:text-5xl lg:text-[3.25rem]">
              {title}
            </h1>
            {subtitle ? (
              <h2 className="mt-4 max-w-2xl text-balance text-xl font-semibold leading-snug text-[#252e65] sm:text-2xl">
                {subtitle}
              </h2>
            ) : null}
            {lede ? (
              subtitle ? (
                <p className="mt-5 max-w-2xl text-balance text-lg font-normal text-[#252e65]/85 sm:text-xl">
                  {lede}
                </p>
              ) : (
                <h2 className="mt-5 max-w-2xl text-balance text-lg font-normal text-[#252e65]/85 sm:text-xl">
                  {lede}
                </h2>
              )
            ) : null}
            <p className="mt-8">
              <Link
                href={ctaHref}
                className="inline-flex rounded-full bg-[#3e48a1] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#252e65]"
              >
                {ctaLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
}

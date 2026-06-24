"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { HeroOinadomLogo } from "@/components/HeroOinadomLogo";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { HOME_HERO_BACKGROUND } from "@/lib/hero-images";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { assetUrl } from "@/lib/asset-url";

const HERO_OVERLAY = "bg-na-heket/[0.78]";
const HERO_CTA =
  "inline-flex items-center justify-center rounded-2xl border-2 border-white bg-na-heket/50 px-10 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-na-heket/65 sm:rounded-3xl sm:px-12 sm:py-[1.125rem] sm:text-sm";

export function HomeHeroCms() {
  const cms = useCmsDocument();
  const edit = useHomeCmsEdit();
  const published = cms?.sections.homeHero;
  const draft = edit?.homeHero;

  const h1 =
    (edit?.ready ? draft?.h1 : isCmsEnabled() ? published?.h1 : undefined) ??
    "Nueva Acrópolis República Dominicana";

  const backgroundSrc =
    (edit?.ready
      ? draft?.background?.src
      : isCmsEnabled()
        ? published?.background?.src
        : undefined) ?? HOME_HERO_BACKGROUND.src;
  const backgroundAlt =
    (edit?.ready
      ? draft?.background?.alt
      : isCmsEnabled()
        ? published?.background?.alt
        : undefined) ?? HOME_HERO_BACKGROUND.alt;
  const resolvedBackgroundSrc = assetUrl(
    resolveCmsMediaUrl(backgroundSrc) ?? backgroundSrc,
  );

  return (
    <section
      id="home-hero"
      className="relative flex min-h-screen items-center justify-center overflow-x-hidden scroll-mt-24"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
        style={{ backgroundImage: `url(${resolvedBackgroundSrc})` }}
        aria-hidden
      />
      <Image
        src={resolvedBackgroundSrc}
        alt={backgroundAlt}
        fill
        priority
        unoptimized
        className="object-cover object-center md:hidden"
        sizes="100vw"
      />
      <div
        className={`pointer-events-none absolute inset-0 ${HERO_OVERLAY}`}
        aria-hidden
      />

      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setSelected("hero", "__hero__")}
          className="absolute right-4 top-24 z-20 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg"
        >
          <Pencil className="h-4 w-4" />
          Editar encabezado
        </button>
      ) : null}

      <div className="relative mx-auto flex w-full max-w-[700px] flex-col items-center overflow-visible px-5 pb-12 pt-[150px] text-center md:px-12 md:pb-[50px] md:pt-[100px]">
        <HeroOinadomLogo
          priority
          align="center"
          size="hero"
          maxWidthClass="max-w-[min(94vw,32rem)]"
        />
        <h1 className="sr-only">{h1}</h1>
        <Link
          href="/quienes-somos"
          className={`${HERO_CTA} pointer-events-auto mt-8 sm:mt-10`}
        >
          Qué es Nueva Acrópolis
        </Link>
      </div>
    </section>
  );
}

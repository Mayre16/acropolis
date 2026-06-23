import Link from "next/link";

import Image from "next/image";

import { HeroOinadomLogo } from "@/components/HeroOinadomLogo";

import { HOME_HERO_BACKGROUND } from "@/lib/hero-images";
import { assetUrl } from "@/lib/asset-url";

const HERO_OVERLAY = "bg-na-heket/[0.78]";

const HERO_CTA =
  "inline-flex items-center justify-center rounded-2xl border-2 border-white bg-na-heket/50 px-10 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-na-heket/65 sm:rounded-3xl sm:px-12 sm:py-[1.125rem] sm:text-sm";



export function Hero() {

  const heroBg = assetUrl(HOME_HERO_BACKGROUND.src);

  return (

    <section className="relative flex min-h-screen items-center justify-center overflow-x-hidden">

      <div

        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed"

        style={{ backgroundImage: `url(${heroBg})` }}

        aria-hidden

      />

      <Image

        src={heroBg}

        alt={HOME_HERO_BACKGROUND.alt}

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



      <div className="relative mx-auto flex w-full max-w-[700px] flex-col items-center overflow-visible px-5 pb-12 pt-[150px] text-center md:px-12 md:pb-[50px] md:pt-[100px]">

        <HeroOinadomLogo
          priority
          align="center"
          size="hero"
          maxWidthClass="max-w-[min(94vw,32rem)]"
        />
        <h1 className="sr-only">Nueva Acrópolis República Dominicana</h1>

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



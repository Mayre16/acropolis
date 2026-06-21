import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { assetUrl } from "@/lib/asset-url";

const FILOSOFIA_PARA_VIVIR_BG = assetUrl("/img/home/filosofia-para-vivir.webp");

/** Banda «Filosofía para Vivir» — foto de paisaje como acropolis.org/es. */
export function PhilosophyLivingBand() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[20rem] sm:min-h-[24rem] md:min-h-[28rem]">
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block md:bg-fixed"
          style={{ backgroundImage: `url(${FILOSOFIA_PARA_VIVIR_BG})` }}
          aria-hidden
        />
        <Image
          src={FILOSOFIA_PARA_VIVIR_BG}
          alt=""
          fill
          className="object-cover object-center md:hidden"
          unoptimized
          aria-hidden
          priority={false}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-na-heket/80"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-16 md:py-20">
          <p className="text-balance text-2xl font-black italic text-na-amon sm:text-3xl">
            ¡Filosofía para Vivir!
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-white/90 sm:text-sm">
            Una propuesta de filosofía diferente
          </p>
          <p className="mt-3 max-w-xl text-balance text-sm text-white/85 sm:text-base">
            La Filosofía para Vivir es práctica y sirve para mejorar la vida.
          </p>
          <Link
            href="/filosofia"
            className="mt-7 inline-flex items-center gap-2 border border-white/70 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 sm:text-sm"
          >
            Conozca nuestro programa de estudios
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

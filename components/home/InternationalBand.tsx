"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  brandLogoHeightClass,
  brandLogoSectionGapClass,
} from "@/lib/brand-clear-space";
import { useWhatsAppUrls } from "@/lib/cms/hooks";

/** Cierre de la home: marca de la Organización Internacional + invitación (logo abajo, como la guía). */
export function InternationalBand() {
  const whatsapp = useWhatsAppUrls();
  return (
    <section className="mx-auto mb-16 mt-4 max-w-6xl px-4 sm:px-6">
      <div className="rounded-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 text-center shadow-na-card sm:p-14">
        <div className="flex justify-center overflow-visible">
          <BrandLogo
            lockup="oinadom"
            variant="white"
            render="raster"
            align="center"
            className={brandLogoHeightClass.internationalBand}
            maxWidthClass="max-w-[min(92vw,22rem)]"
          />
        </div>
        <h2
          className={`mx-auto max-w-2xl text-balance text-2xl font-black text-white sm:text-3xl ${brandLogoSectionGapClass}`}
        >
          Presente en cerca de 60 países, al servicio de la cultura y el ser
          humano
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-white/80">
          Ven a conocernos en una de nuestras sedes o escríbenos. La filosofía
          empieza con una buena pregunta.
        </p>
        <div className="mt-8 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
          <a
            href={whatsapp.cursos}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-na-helios px-6 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105"
          >
            Escríbenos por WhatsApp
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/filosofia"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
          >
            Empieza por Filosofía
          </Link>
        </div>
      </div>
    </section>
  );
}

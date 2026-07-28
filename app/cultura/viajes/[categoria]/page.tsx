import type { Metadata } from "next";

import Image from "next/image";

import Link from "next/link";

import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { ViajesCategoriaHero } from "@/components/cms/ViajesCategoriaHero";
import { ViajesCategoriaIntro } from "@/components/cms/ViajesCategoriaIntro";

import { ViajesListing } from "@/components/cms/ViajesListing";

import { ViajesPageShell } from "@/components/cms/ViajesPageShell";

import {

  VIAJE_CATEGORIAS,

  getViajeCategoria,

  type ViajeCategoriaSlug,

} from "@/lib/viajes";



export const dynamicParams = false;



export function generateStaticParams() {

  return Object.keys(VIAJE_CATEGORIAS).map((categoria) => ({ categoria }));

}



export async function generateMetadata({

  params,

}: {

  params: Promise<{ categoria: string }>;

}): Promise<Metadata> {

  const { categoria } = await params;

  const cat = getViajeCategoria(categoria);

  if (!cat) return {};

  return {

    title: cat.title,

    description: cat.intro,

    alternates: { canonical: `/cultura/viajes/${cat.slug}` },

  };

}



export default async function ViajesCategoriaPage({

  params,

}: {

  params: Promise<{ categoria: string }>;

}) {

  const { categoria } = await params;

  const cat = getViajeCategoria(categoria);

  if (!cat) notFound();



  const otra =

    cat.slug === "locales"

      ? VIAJE_CATEGORIAS.internacionales

      : VIAJE_CATEGORIAS.locales;



  return (

    <ViajesPageShell>

      <ViajesCategoriaHero categoria={cat.slug} />



      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <ViajesCategoriaIntro categoria={cat.slug as ViajeCategoriaSlug} />

        <div className="mt-10">

          <ViajesListing categoria={cat.slug as ViajeCategoriaSlug} />

        </div>

      </section>



      <section className="border-t border-na-heket/10 bg-na-heket/[0.04] py-12 sm:py-14">

        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">

            También te puede interesar

          </p>

          <Link

            href={`/cultura/viajes/${otra.slug}/`}

            className="group mt-4 flex flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card sm:flex-row"

          >

            <div className="relative aspect-[16/10] w-full bg-na-heket/5 sm:w-2/5 sm:aspect-auto">

              <Image

                src={otra.heroImage.src}

                alt={otra.heroImage.alt}

                fill

                className="object-cover"

                sizes="(max-width: 640px) 100vw, 40vw"

                unoptimized

              />

            </div>

            <div className="flex flex-1 flex-col justify-center p-6">

              <h2 className="text-lg font-black text-na-heketDark">

                {otra.title}

              </h2>

              <p className="mt-2 text-sm leading-relaxed text-na-muted">

                {otra.lede}

              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-na-kefer transition group-hover:gap-2.5">

                Explorar destinos

                <ArrowUpRight className="h-4 w-4" />

              </span>

            </div>

          </Link>

        </div>

      </section>

    </ViajesPageShell>

  );

}



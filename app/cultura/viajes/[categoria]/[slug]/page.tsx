import type { Metadata } from "next";

import Image from "next/image";

import Link from "next/link";

import { notFound } from "next/navigation";

import { ArrowLeft, ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";

import {

  getViajeCategoria,

  getViajesByCategoria,

  viajeCategoriaHref,

  viajeDestinoHref,

  type ViajeCategoriaSlug,

} from "@/lib/viajes";

import { getMergedViaje, getViajeStaticParams } from "@/lib/cms/static-params";

import { ViajeInquiryButton } from "@/components/ViajeInquiryButton";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";



export const dynamicParams = false;



export async function generateStaticParams() {

  return getViajeStaticParams();

}



export async function generateMetadata({

  params,

}: {

  params: Promise<{ categoria: string; slug: string }>;

}): Promise<Metadata> {

  const { categoria, slug } = await params;

  const destino = await getMergedViaje(categoria, slug);

  if (!destino) return {};

  return {

    title: destino.title,

    description: destino.excerpt,

    alternates: {

      canonical: `/cultura/viajes/${destino.categoria}/${destino.slug}`,

    },

    openGraph: {

      type: "article",

      title: destino.title,

      description: destino.excerpt,

      images: [{ url: destino.image.src }],

    },

  };

}



export default async function ViajeDestinoPage({

  params,

}: {

  params: Promise<{ categoria: string; slug: string }>;

}) {

  const { categoria, slug } = await params;

  const cat = getViajeCategoria(categoria);

  const destino = await getMergedViaje(categoria, slug);

  if (!cat || !destino || destino.soloEnlace) notFound();



  const hermanos = getViajesByCategoria(destino.categoria as ViajeCategoriaSlug);

  const idx = hermanos.findIndex((v) => v.slug === destino.slug);

  const otro = hermanos[(idx + 1) % hermanos.length];

  const jsonLd = {

    "@context": "https://schema.org",

    "@type": "TouristTrip",

    name: destino.title,

    description: destino.excerpt,

    image: destino.image.src,

    touristType: "Cultural tourism",

    provider: {

      "@type": "Organization",

      name: "Nueva Acrópolis República Dominicana",

    },

  };



  return (

    <article className="pb-20">

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}

      />



      <header className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">

        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-na-muted">

          <Link href="/" className="hover:text-na-kefer">

            Inicio

          </Link>

          <span aria-hidden>/</span>

          <Link href="/cultura/" className="hover:text-na-kefer">

            Cultura

          </Link>

          <span aria-hidden>/</span>

          <Link

            href={viajeCategoriaHref(destino.categoria)}

            className="hover:text-na-kefer"

          >

            {cat.title}

          </Link>

          <span aria-hidden>/</span>

          <span className="text-na-heketDark">{destino.title}</span>

        </nav>



        <span className="mt-6 inline-flex w-fit rounded-full bg-na-heket px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">

          {cat.title}

        </span>

        <h1 className="mt-4 text-balance text-3xl font-black leading-tight text-na-heketDark sm:text-4xl md:text-5xl">

          {destino.title}

        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-na-muted">

          <span className="inline-flex items-center gap-1.5">

            <MapPin className="h-4 w-4 text-na-kefer" />

            {destino.location}

          </span>

          {destino.proximaFecha ? (

            <span className="inline-flex items-center gap-1.5 text-na-kefer">

              <CalendarDays className="h-4 w-4" />

              Próxima salida: {destino.proximaFecha}

            </span>

          ) : null}

          {destino.duration ? (

            <span className="inline-flex items-center gap-1.5">

              <Clock className="h-4 w-4 text-na-kefer" />

              {destino.duration}

            </span>

          ) : null}

        </div>

      </header>



      <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">

        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-na-heket/5 shadow-na-card">

          <Image

            src={destino.image.src}

            alt={destino.image.alt}

            fill

            className="object-cover"

            sizes="(max-width: 768px) 100vw, 896px"

            priority

            unoptimized

          />

        </div>

      </div>



      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        <p className="mt-10 text-lg font-medium leading-relaxed text-na-heketDark">

          {destino.excerpt}

        </p>



        <div className="mt-8 space-y-5 text-base leading-relaxed text-na-muted">

          {destino.body.map((p) => (

            <p key={p.slice(0, 40)}>{p}</p>

          ))}

        </div>



        {destino.highlights.length > 0 ? (

          <div className="mt-10 rounded-2xl border border-na-heket/10 bg-na-heket/[0.04] p-6">

            <h2 className="text-sm font-black uppercase tracking-wide text-na-heketDark">

              Qué incluye la visita

            </h2>

            <ul className="mt-4 space-y-2">

              {destino.highlights.map((h) => (

                <li

                  key={h}

                  className="flex gap-2 text-sm leading-relaxed text-na-muted"

                >

                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-na-kefer" />

                  {h}

                </li>

              ))}

            </ul>

          </div>

        ) : null}



        <div className="mt-10 flex flex-wrap gap-4">

          {destino.link ? (
            <LeaveSiteLink
              href={destino.link}
              className="inline-flex items-center gap-2 rounded-full border border-na-heket/20 px-5 py-2.5 text-sm font-bold text-na-heketDark transition hover:border-na-kefer hover:text-na-kefer"
            >
              Más información
              <ArrowRight className="h-4 w-4" />
            </LeaveSiteLink>
          ) : (
            <ViajeInquiryButton
              title={destino.title}
              location={destino.location}
              proximaFecha={destino.proximaFecha}
              label="Solicitar información"
              className="inline-flex items-center gap-2 rounded-full bg-na-kefer px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
            />
          )}

          <Link

            href={viajeCategoriaHref(destino.categoria)}

            className="inline-flex items-center gap-2 rounded-full border border-na-heket/20 px-5 py-2.5 text-sm font-bold text-na-heketDark transition hover:border-na-kefer hover:text-na-kefer"

          >

            <ArrowLeft className="h-4 w-4" />

            Volver a {cat.title.toLowerCase()}

          </Link>

        </div>

      </div>



      {otro.slug !== destino.slug ? (

        <aside className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">

          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">

            Otro destino

          </p>

          <Link

            href={viajeDestinoHref(otro.categoria, otro.slug)}

            className="group mt-4 flex overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card"

          >

            <div className="relative hidden w-36 shrink-0 bg-na-heket/5 sm:block">

              <Image

                src={otro.image.src}

                alt={otro.image.alt}

                fill

                className="object-cover"

                sizes="144px"

                unoptimized

              />

            </div>

            <div className="flex flex-1 flex-col justify-center p-5">

              <span className="text-xs font-semibold text-na-muted">

                {otro.location}

              </span>

              <span className="mt-1 font-black text-na-heketDark group-hover:text-na-kefer">

                {otro.title}

              </span>

            </div>

            <ArrowRight className="m-5 h-5 shrink-0 self-center text-na-kefer opacity-0 transition group-hover:opacity-100" />

          </Link>

        </aside>

      ) : null}

    </article>

  );

}



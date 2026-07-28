import Image from "next/image";

import { ArrowRight, ExternalLink } from "lucide-react";

import Link from "next/link";

import type { ReactNode } from "react";

import {

  SUBMARCA_LOGOS,

  platformEffectiveUrl,

  platformIsExternal,

  type PlatformId,

} from "@/lib/site-config";



const PLATFORMS = [

  {

    id: "civis" as const,

    title: "Civis Consulting",

    text: "Talleres para empresas, alquiler de salones y equipo de facilitadores Civis.",

    logo: SUBMARCA_LOGOS.civis,

    cta: "Ver Civis Consulting",

    ctaClass:

      "bg-na-civis text-white shadow-md shadow-na-civis/25 hover:bg-na-civisDark",

  },

  {

    id: "biblioteca" as const,

    title: "Biblioteca Sophia",

    text: "Catálogo en línea, préstamos y novedades de nuestra biblioteca. Consulta títulos de filosofía, cultura y desarrollo humano.",

    logo: SUBMARCA_LOGOS.biblioteca,

    cta: "Visitar biblioteca",

    ctaClass:

      "bg-na-helios text-na-ink shadow-lg shadow-na-helios/30 hover:brightness-105",

  },

  {

    id: "tienda" as const,

    title: "Librería Editorial Logos",

    text: "Libros, separadores, lapiceros y artículos de nuestra editorial. Publicaciones de Nueva Acrópolis y Logos.",

    logo: SUBMARCA_LOGOS.editorial,

    cta: "Ver avance",

    ctaClass: "text-na-kefer",

  },

] as const;



function PlatformCardLink({

  id,

  children,

  className,

}: {

  id: PlatformId;

  children: ReactNode;

  className?: string;

}) {

  const href = platformEffectiveUrl(id);

  const external = platformIsExternal(href);



  if (external) {

    return (

      <a

        href={href}

        target="_blank"

        rel="noopener noreferrer"

        className={className}

      >

        {children}

      </a>

    );

  }



  return (

    <Link href={href} className={className}>

      {children}

    </Link>

  );

}



function PlatformWhiteCard({

  id,

  logo,

  title,

  text,

  cta,

  ctaClass,

}: {

  id: PlatformId;

  logo: (typeof SUBMARCA_LOGOS)[keyof typeof SUBMARCA_LOGOS];

  title: string;

  text: string;

  cta: string;

  ctaClass: string;

}) {

  const external = platformIsExternal(platformEffectiveUrl(id));



  return (

    <PlatformCardLink

      id={id}

      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"

    >

      <div className="flex min-h-[6.5rem] items-center justify-center border-b border-na-heket/10 bg-white px-6 py-6">

        <Image

          src={logo.src}

          alt={logo.alt}

          width={logo.width}

          height={logo.height}

          unoptimized

          className="h-[4.5rem] w-auto max-w-[min(100%,22rem)] object-contain sm:h-20"

        />

      </div>

      <div className="flex flex-1 flex-col p-6">

        <div>

          <h3 className="text-lg font-black text-na-heketDark">{title}</h3>

          <p className="mt-2 text-sm leading-relaxed text-na-muted">{text}</p>

        </div>

        <span

          className={

            ctaClass.includes("bg-na-helios") || ctaClass.includes("bg-na-civis")

              ? "mt-4 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition group-hover:gap-3 " +

                ctaClass

              : "mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition group-hover:gap-2.5 " +

                ctaClass

          }

        >

          {cta}

          {external ? (

            <ExternalLink className="h-4 w-4" />

          ) : (

            <ArrowRight className="h-4 w-4" />

          )}

        </span>

      </div>

    </PlatformCardLink>

  );

}



export function PlatformsSection() {

  return (

    <section

      id="plataformas"

      className="scroll-mt-28 border-t border-na-heket/10 bg-na-heket/[0.04] py-16 sm:py-20"

    >

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">

          Plataformas

        </p>

        <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">

          Civis, Biblioteca y Editorial

        </h2>

        <p className="mt-3 max-w-2xl text-na-muted">

          Además de nuestras sedes, contamos con espacios digitales para

          consultar, formar equipos y adquirir publicaciones de la organización.

        </p>



        <ul className="mt-10 flex flex-col gap-6">

          {PLATFORMS.map((p) => (

            <li key={p.id}>

              <PlatformWhiteCard

                id={p.id}

                logo={p.logo}

                title={p.title}

                text={p.text}

                cta={p.cta}

                ctaClass={p.ctaClass}

              />

            </li>

          ))}

        </ul>

      </div>

    </section>

  );

}


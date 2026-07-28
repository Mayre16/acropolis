import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plane } from "lucide-react";
import { EventosHero } from "@/components/cms/EventosHero";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";
import { EventosListing } from "@/components/cms/EventosListing";
import { EventosPageShell } from "@/components/cms/EventosPageShell";
import { WorldNews, type WorldItem } from "@/components/WorldNews";
import { SOCIAL_LINKS } from "@/lib/site-config";
import { viajeCategoriaHref } from "@/lib/viajes";
import mundoFeed from "@/public/data/mundo-feed.json";

export const metadata: Metadata = {
  title: "Eventos y Noticias",
  description:
    "Eventos y noticias de Nueva Acrópolis República Dominicana y del mundo: celebraciones, viajes culturales y noticias de Nueva Acrópolis Internacional.",
  alternates: { canonical: "/eventos" },
};

const VIAJES = [
  {
    href: viajeCategoriaHref("locales"),
    src: "/img/cultura/viajes/tres-ojos.webp",
    alt: "Excursión al Parque Nacional Los Tres Ojos",
    title: "Viajes locales",
    text: "Los Tres Ojos, las Cuevas de Pomier y otros sitios del país para redescubrir nuestro patrimonio y la naturaleza.",
  },
  {
    href: viajeCategoriaHref("internacionales"),
    src: "/img/cultura/viajes/egipto.webp",
    alt: "Expedición cultural a Egipto",
    title: "Viajes internacionales",
    text: "Expediciones a Egipto, Machu Picchu y otras cunas de la civilización para vivir de cerca el arte y la historia.",
  },
];

// Respaldo estático (generado por scripts/fetch_mundo_feed.mjs en cada build).
const MUNDO_FALLBACK: WorldItem[] =
  mundoFeed.items.length > 0
    ? (mundoFeed.items as WorldItem[])
    : [
        {
          title: "Día Mundial de la Filosofía en decenas de países",
          date: "Noviembre",
          excerpt:
            "Cada año, las sedes de Nueva Acrópolis en el mundo celebran el Día Mundial de la Filosofía con charlas, foros y actividades abiertas al público.",
          image: "/img/hero/filosofia/01.webp",
        },
      ];

export default function EventosPage() {
  return (
    <EventosPageShell>
    <>
      <EventosHero />

      {/* Nuestros eventos */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          En República Dominicana
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          Nuestros eventos
        </h2>
        <p className="mt-4 max-w-2xl text-na-muted">
          Pulsa cualquier actividad para leer la crónica completa con su
          fotografía.
        </p>
        <EventosListing />
      </section>

      {/* Viajes culturales */}
      <section className="border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-2 text-na-kefer">
            <Plane className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.32em]">
              Viajes culturales
            </span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            Viajar para aprender
          </h2>
          <p className="mt-4 max-w-2xl text-na-muted">
            Salidas y expediciones culturales, dentro y fuera del país, para
            redescubrir el patrimonio, la naturaleza y las grandes civilizaciones.
          </p>
          <ul className="mt-10 grid gap-7 md:grid-cols-2">
            {VIAJES.map((v) => (
              <li key={v.title}>
                <Link
                  href={v.href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card sm:flex-row"
                >
                  <div className="relative aspect-[16/10] w-full bg-na-heket/5 sm:w-1/2 sm:aspect-auto">
                    <Image
                      src={v.src}
                      alt={v.alt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <h3 className="text-lg font-black text-na-heketDark">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-na-muted">
                      {v.text}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-na-kefer transition group-hover:gap-2.5">
                      Ver destinos
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Eventos y noticias del mundo */}
      <section id="mundo" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          Nueva Acrópolis en el mundo
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          Eventos y noticias del mundo
        </h2>
        <p className="mt-4 max-w-2xl text-na-muted">
          Nueva Acrópolis está presente en más de 60 países. Aquí publicamos un
          resumen de noticias de la Organización Internacional, integrado en
          nuestro sitio para que puedas leerlas sin salir de acropolis.org.do.
        </p>
        <WorldNews fallback={MUNDO_FALLBACK} />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 text-center shadow-na-card sm:p-10">
          <h2 className="text-balance text-2xl font-black text-white sm:text-3xl">
            Sigue todas nuestras actividades
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Publicamos cada evento y encuentro en nuestras redes. ¡Síguenos para
            no perderte nada!
          </p>
          <LeaveSiteLink
            href={SOCIAL_LINKS.instagram}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105"
          >
            Síguenos en Instagram
            <ArrowUpRight className="h-4 w-4" />
          </LeaveSiteLink>
        </div>
      </section>
    </>
    </EventosPageShell>
  );
}

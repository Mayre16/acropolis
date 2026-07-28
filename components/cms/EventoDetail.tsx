"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";
import { EVENTOS } from "@/lib/eventos";
import { useEventoGallery, useMergedEventos } from "@/lib/cms/hooks";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import { SOCIAL_LINKS } from "@/lib/site-config";
import { ContentGallery } from "@/components/cms/ContentGallery";

export function EventoDetail({ slug }: { slug: string }) {
  const cms = useCmsDocument();
  const merged = useMergedEventos();
  const list = isCmsEnabled() && cms ? merged : EVENTOS;
  const ev = list.find((x) => x.slug === slug);
  const gallery = useEventoGallery(slug);
  const cmsReady = !isCmsEnabled() || cms !== null;

  if (cmsReady && !ev) notFound();

  if (!ev) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-na-muted">
        Cargando evento…
      </div>
    );
  }

  const [lead, ...rest] = ev.body;
  const idx = list.findIndex((x) => x.slug === ev.slug);
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: ev.title,
    description: ev.excerpt,
    image: ev.image.src,
    publisher: {
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
          <Link href="/eventos" className="hover:text-na-kefer">
            Eventos
          </Link>
          <span aria-hidden>/</span>
          <span className="text-na-heketDark">{ev.category}</span>
        </nav>

        <span className="mt-6 inline-flex w-fit rounded-full bg-na-heket px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {ev.category}
        </span>
        <h1 className="mt-4 text-balance text-3xl font-black leading-tight text-na-heketDark sm:text-4xl md:text-5xl">
          {ev.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-na-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-na-kefer" />
            {ev.date}
          </span>
        </div>
      </header>

      <figure className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] bg-na-heket/5 shadow-na-card">
          <Image
            src={ev.image.src}
            alt={ev.image.alt}
            fill
            priority
            unoptimized
            sizes="(max-width: 896px) 100vw, 56rem"
            className="object-cover"
          />
        </div>
      </figure>

      <div className="mx-auto mt-10 max-w-2xl px-4 sm:px-6">
        {lead ? (
          <p className="text-lg font-medium leading-relaxed text-na-heketDark">
            {lead}
          </p>
        ) : null}
        <div className={lead ? "mt-6 space-y-5" : "space-y-5"}>
          {rest.map((p, i) => (
            <p key={i} className="leading-relaxed text-na-ink/80">
              {p}
            </p>
          ))}
        </div>
        <ContentGallery images={gallery} />

        <div className="mt-12">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 text-sm font-bold text-na-kefer transition hover:gap-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Eventos
          </Link>
        </div>
      </div>

      {next.slug !== ev.slug && list.length > 1 ? (
        <nav
          aria-label="Navegación entre eventos"
          className="mx-auto mt-16 max-w-4xl px-4 sm:px-6"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Seguir explorando
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Link
              href={`/eventos/${prev.slug}`}
              className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface p-4 shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"
            >
              <ArrowLeft className="h-5 w-5 shrink-0 text-na-kefer transition group-hover:-translate-x-0.5" />
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-na-heket/5">
                <Image
                  src={prev.image.src}
                  alt={prev.image.alt}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wide text-na-muted">
                  Anterior
                </span>
                <h3 className="line-clamp-2 text-sm font-black leading-snug text-na-heketDark">
                  {prev.title}
                </h3>
              </div>
            </Link>

            <Link
              href={`/eventos/${next.slug}`}
              className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface p-4 text-right shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"
            >
              <div className="order-1 min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-na-kefer">
                  Siguiente
                </span>
                <h3 className="line-clamp-2 text-sm font-black leading-snug text-na-heketDark">
                  {next.title}
                </h3>
              </div>
              <div className="relative order-2 h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-na-heket/5">
                <Image
                  src={next.image.src}
                  alt={next.image.alt}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <ArrowRight className="order-3 h-5 w-5 shrink-0 text-na-kefer transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>
      ) : null}

      <section className="mx-auto mt-16 max-w-4xl px-4 sm:px-6">
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
    </article>
  );
}

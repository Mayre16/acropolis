"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  PenLine,
  ArrowUpRight,
} from "lucide-react";
import { ARTICULOS } from "@/lib/articulos";
import {
  useArticuloGallery,
  useMergedArticulos,
} from "@/lib/cms/hooks";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import { ArticleBody } from "@/components/cms/ArticleBody";
import { ContentGallery } from "@/components/cms/ContentGallery";

export function ArticuloDetail({ slug }: { slug: string }) {
  const cms = useCmsDocument();
  const merged = useMergedArticulos();
  const list = isCmsEnabled() && cms ? merged : ARTICULOS;
  const a = list.find((x) => x.slug === slug);
  const imageSrc = resolveCmsMediaUrl(a?.image.src) ?? a?.image.src;
  const gallery = useArticuloGallery(slug);
  const cmsReady = !isCmsEnabled() || cms !== null;

  if (cmsReady && !a) notFound();

  if (!a) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-na-muted">
        Cargando entrada…
      </div>
    );
  }

  const idx = list.findIndex((x) => x.slug === a.slug);
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    image: a.image.src,
    author: { "@type": "Organization", name: a.author },
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
          <Link href="/articulos" className="hover:text-na-kefer">
            Blog
          </Link>
          <span aria-hidden>/</span>
          <span className="text-na-heketDark">{a.category}</span>
        </nav>

        <span className="mt-6 inline-flex w-fit rounded-full bg-na-amon/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-amon">
          {a.category}
        </span>
        <h1 className="mt-4 text-balance text-3xl font-black leading-tight text-na-heketDark sm:text-4xl md:text-5xl">
          {a.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-na-muted">
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="h-4 w-4 text-na-kefer" />
            {a.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-na-kefer" />
            {a.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-na-kefer" />
            {a.readingTime} de lectura
          </span>
        </div>
      </header>

      <figure className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] bg-na-heket/5 shadow-na-card">
          <Image
            src={imageSrc ?? a.image.src}
            alt={a.image.alt}
            fill
            priority
            unoptimized
            sizes="(max-width: 896px) 100vw, 56rem"
            className="object-cover"
          />
        </div>
        {a.image.credit ? (
          <figcaption className="mt-2 text-right text-xs text-na-muted">
            Imagen: {a.image.credit}
          </figcaption>
        ) : null}
      </figure>

      <div className="mx-auto mt-10 max-w-2xl px-4 sm:px-6">
        <ArticleBody paragraphs={a.body} />
        <ContentGallery images={gallery} />

        <div className="mt-12">
          <Link
            href="/articulos"
            className="inline-flex items-center gap-2 text-sm font-bold text-na-kefer transition hover:gap-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al blog
          </Link>
        </div>
      </div>

      {next.slug !== a.slug && list.length > 1 ? (
        <nav
          aria-label="Navegación entre entradas del blog"
          className="mx-auto mt-16 max-w-4xl px-4 sm:px-6"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Seguir leyendo
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Link
              href={`/${prev.slug}`}
              className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface p-4 shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"
            >
              <ArrowLeft className="h-5 w-5 shrink-0 text-na-kefer transition group-hover:-translate-x-0.5" />
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-na-heket/5">
                <Image
                  src={resolveCmsMediaUrl(prev.image.src) ?? prev.image.src}
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
              href={`/${next.slug}`}
              className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface p-4 text-right shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"
            >
              <div className="min-w-0 flex-1 order-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-na-kefer">
                  Siguiente entrada
                </span>
                <h3 className="line-clamp-2 text-sm font-black leading-snug text-na-heketDark">
                  {next.title}
                </h3>
              </div>
              <div className="relative order-2 h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-na-heket/5">
                <Image
                  src={resolveCmsMediaUrl(next.image.src) ?? next.image.src}
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
            ¿Quieres profundizar?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Estas ideas cobran vida en nuestra Escuela de Filosofía. Conoce el
            Diplomado de Filosofía para la Vida.
          </p>
          <Link
            href="/filosofia"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105"
          >
            Ir a la Escuela de Filosofía
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}

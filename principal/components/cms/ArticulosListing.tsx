"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import { CalendarDays, Clock, Pencil, Plus, Trash2 } from "lucide-react";

import { ContentCardImage } from "@/components/ContentCardMedia";

import { useMergedArticulos } from "@/lib/cms/hooks";

import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

import { ARTICULOS } from "@/lib/articulos";
import { isSeedMedio } from "@/lib/medios";

import { isCmsEnabled } from "@/lib/cms/provider";

import { useArticulosCmsEdit } from "@/components/cms/ArticulosCmsEditContext";
import { useMediosCmsEdit } from "@/components/cms/MediosCmsEditContext";



export function ArticulosListing() {

  const edit = useArticulosCmsEdit();
  const mediosEdit = useMediosCmsEdit();

  const merged = useMergedArticulos();

  const list = edit?.ready

    ? edit.items.map((a) => ({

        ...a,

        image: {

          ...a.image,

          src: resolveCmsMediaUrl(a.image.src) ?? a.image.src,

        },

      }))

    : isCmsEnabled()
      ? merged.map((a) => ({
          ...a,
          image: {
            ...a.image,
            src: resolveCmsMediaUrl(a.image.src) ?? a.image.src,
          },
        }))
      : ARTICULOS;



  const featured = list.find((a) => a.featured) ?? list[0];

  if (!featured) return null;

  const rest = list.filter((a) => a.slug !== featured.slug);



  function openEdit(slug: string) {

    edit?.setSelectedSlug(slug);

  }



  const CardWrap = edit?.ready

    ? ({

        slug,

        children,

        className,

      }: {

        slug: string;

        children: ReactNode;

        className: string;

      }) => (

        <button

          type="button"

          onClick={() => openEdit(slug)}

          className={`${className} relative text-left`}

        >

          <span className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow">

            <Pencil className="h-4 w-4" aria-hidden />

          </span>

          {children}

        </button>

      )

    : ({

        slug,

        children,

        className,

      }: {

        slug: string;

        children: ReactNode;

        className: string;

      }) => (

        <Link href={`/${slug}`} className={className}>

          {children}

        </Link>

      );



  return (

    <>

      {edit?.ready ? (
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => edit.addItem()}
            className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
          >
            <Plus className="h-4 w-4" />
            Artículo en el sitio
          </button>
          {mediosEdit?.ready ? (
            <button
              type="button"
              onClick={() => mediosEdit.addItem()}
              className="inline-flex items-center gap-2 rounded-full border-2 border-sky-400 bg-white px-4 py-2 text-xs font-bold uppercase text-sky-900 hover:bg-sky-50"
            >
              <Plus className="h-4 w-4" />
              Enlace externo (voz fuera de la sede)
            </button>
          ) : null}
        </div>
      ) : null}

      {mediosEdit?.ready && mediosEdit.items.length > 0 ? (
        <div className="mb-10 rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4 sm:p-5">
          <h3 className="text-sm font-black uppercase tracking-wide text-sky-950">
            Voz fuera de la sede
          </h3>
          <p className="mt-1 text-xs text-sky-900/80">
            Enlaces a medios externos. También aparecen abajo en la sección
            «Nuestra voz fuera de la sede».
          </p>
          <ul className="mt-4 space-y-2">
            {mediosEdit.items.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/80 bg-white px-3 py-2.5 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-na-heketDark">
                    {m.title || "Sin título"}
                  </p>
                  <p className="truncate text-xs text-na-muted">
                    {m.outlet || "Medio sin nombre"}
                    {m.url ? ` · ${m.url.replace(/^https?:\/\//, "")}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => mediosEdit.setSelectedId(m.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const seed = isSeedMedio(m.id);
                      const msg = seed
                        ? "¿Ocultar esta aparición del sitio?"
                        : "¿Eliminar esta aparición?";
                      if (window.confirm(msg)) {
                        mediosEdit.hideItem(m.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isSeedMedio(m.id) ? "Ocultar" : "Eliminar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}



      <CardWrap

        slug={featured.slug}

        className="group grid gap-6 overflow-hidden rounded-[1.5rem] border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:shadow-na-card lg:grid-cols-2"

      >

        <ContentCardImage
          src={featured.image.src || undefined}
          alt={featured.image.alt}
          className="lg:aspect-auto lg:min-h-[280px]"
          imageClassName="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        <div className="flex flex-col justify-center p-6 sm:p-9">

          <span className="inline-flex w-fit rounded-full bg-na-amon/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-amon">

            Destacado · {featured.category}

          </span>

          <h2 className="mt-4 text-balance text-2xl font-black leading-tight text-na-heketDark sm:text-3xl">

            {featured.title}

          </h2>

          <p className="mt-3 text-na-muted">{featured.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-na-muted">

            <span className="inline-flex items-center gap-1.5">

              <CalendarDays className="h-4 w-4 text-na-kefer" />

              {featured.date}

            </span>

            <span className="inline-flex items-center gap-1.5">

              <Clock className="h-4 w-4 text-na-kefer" />

              {featured.readingTime} de lectura

            </span>

          </div>

        </div>

      </CardWrap>



      <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

        {rest.map((a) => (

          <li key={a.slug}>

            <CardWrap

              slug={a.slug}

              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"

            >

              <ContentCardImage
                src={a.image.src || undefined}
                alt={a.image.alt}
                imageClassName="object-cover transition duration-500 group-hover:scale-[1.03]"
              >
                <span className="absolute left-3 top-3 rounded-full bg-na-heket px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                  {a.category}
                </span>
              </ContentCardImage>

              <div className="flex flex-1 flex-col p-5">

                <h3 className="text-lg font-black leading-snug text-na-heketDark">

                  {a.title}

                </h3>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">

                  {a.excerpt}

                </p>

              </div>

            </CardWrap>

          </li>

        ))}

      </ul>

    </>

  );

}



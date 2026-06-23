"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import { CalendarDays, ArrowUpRight, Pencil, Plus } from "lucide-react";

import { ContentCardImage } from "@/components/ContentCardMedia";

import { useMergedEventos } from "@/lib/cms/hooks";

import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

import { EVENTOS } from "@/lib/eventos";

import { isCmsEnabled } from "@/lib/cms/provider";

import { useEventosCmsEdit } from "@/components/cms/EventosCmsEditContext";



export function EventosListing() {

  const edit = useEventosCmsEdit();

  const merged = useMergedEventos();

  const list = edit?.ready

    ? edit.items.map((e) => ({

        ...e,

        image: {

          ...e.image,

          src: resolveCmsMediaUrl(e.image.src) ?? e.image.src,

        },

      }))

    : isCmsEnabled()

      ? merged

      : EVENTOS;



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

        <Link href={`/eventos/${slug}`} className={className}>

          {children}

        </Link>

      );



  return (

    <>

      {edit?.ready ? (

        <button

          type="button"

          onClick={() => edit.addItem()}

          className="mb-6 inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"

        >

          <Plus className="h-4 w-4" />

          Añadir evento

        </button>

      ) : null}



      <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

        {list.map((ev) => (

          <li key={ev.slug}>

            <CardWrap

              slug={ev.slug}

              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-na-heket/10 bg-na-surface shadow-na-soft transition hover:-translate-y-1 hover:shadow-na-card"

            >

              <ContentCardImage
                src={ev.image.src || undefined}
                alt={ev.image.alt}
                imageClassName="object-cover transition duration-500 group-hover:scale-105"
              >
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-heketDark backdrop-blur">
                  {ev.category}
                  {edit?.ready && "published" in ev && ev.published === false ? (
                    <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-950">
                      Borrador
                    </span>
                  ) : null}
                </span>
              </ContentCardImage>

              <div className="flex flex-1 flex-col p-6">

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-na-muted">

                  <CalendarDays className="h-3.5 w-3.5 text-na-kefer" />

                  {ev.date}

                </span>

                <h3 className="mt-2 text-lg font-black leading-snug text-na-heketDark">

                  {ev.title}

                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-na-muted">

                  {ev.excerpt}

                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-na-kefer transition group-hover:gap-2.5">

                  {edit?.ready ? "Editar crónica" : "Leer crónica"}

                  <ArrowUpRight className="h-4 w-4" />

                </span>

              </div>

            </CardWrap>

          </li>

        ))}

      </ul>

    </>

  );

}



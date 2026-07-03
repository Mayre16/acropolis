"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import { CalendarDays, ArrowUpRight, Pencil, Plus, Trash2 } from "lucide-react";

import { ContentCardImage } from "@/components/ContentCardMedia";

import { useMergedEventos } from "@/lib/cms/hooks";

import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

import { cmsToEvento } from "@/lib/cms/merge-content";

import { EVENTOS, isSeedEvento } from "@/lib/eventos";

import { isCmsEnabled } from "@/lib/cms/provider";

import { useEventosCmsEdit } from "@/components/cms/EventosCmsEditContext";

const EXCERPT_PLACEHOLDER =
  "Sin extracto — escríbelo en el panel (campo «Extracto (tarjeta)»).";

export function EventosListing() {
  const edit = useEventosCmsEdit();

  const merged = useMergedEventos();

  const list = edit?.ready
    ? edit.items.map((e) => {
        const display = cmsToEvento(e);
        return {
          ...display,
          published: e.published,
          excerpt: display.excerpt.trim() || EXCERPT_PLACEHOLDER,
          image: {
            ...display.image,
            src: resolveCmsMediaUrl(display.image.src) ?? display.image.src,
          },
        };
      })
    : isCmsEnabled()
      ? merged
      : EVENTOS;

  const cmsOnly = edit?.ready
    ? edit.items.filter((e) => !isSeedEvento(e.slug))
    : [];

  function openEdit(slug: string) {
    edit?.setSelectedSlug(slug);
  }

  function confirmHide(slug: string) {
    const seed = isSeedEvento(slug);
    const msg = seed
      ? "¿Eliminar esta crónica del listado? Se ocultará de /eventos (puedes restaurarla después)."
      : "¿Eliminar esta crónica?";
    if (window.confirm(msg)) {
      edit?.hideItem(slug);
    }
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
        <div className={`${className} relative`}>
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => openEdit(slug)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow"
              aria-label="Editar crónica"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                confirmHide(slug);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-white text-red-700 shadow hover:bg-red-50"
              aria-label="Eliminar crónica"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => openEdit(slug)}
            className="flex h-full w-full flex-col text-left"
          >
            {children}
          </button>
        </div>
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
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => edit.addItem()}
            className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
          >
            <Plus className="h-4 w-4" />
            Añadir crónica
          </button>
        </div>
      ) : null}

      {cmsOnly.length > 0 ? (
        <div className="mb-10 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 sm:p-5">
          <h3 className="text-sm font-black uppercase tracking-wide text-emerald-950">
            Crónicas creadas en el editor
          </h3>
          <p className="mt-1 text-xs text-emerald-900/80">
            Borradores y crónicas nuevas. Complétalas y publícalas cuando estén
            listas.
          </p>
          <ul className="mt-4 space-y-2">
            {cmsOnly.map((e) => {
              const display = cmsToEvento(e);
              return (
                <li
                  key={e.slug}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/80 bg-white px-3 py-2.5 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-na-heketDark">
                      {e.title || "Sin título"}
                      {e.published === false ? (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                          Borrador
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-na-muted">
                      {display.category}
                      {e.date ? ` · ${e.date}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(e.slug)}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmHide(e.slug)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
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
                  {ev.date || "Sin fecha"}
                </span>

                <h3 className="mt-2 text-lg font-black leading-snug text-na-heketDark">
                  {ev.title}
                </h3>

                <p
                  className={`mt-2 line-clamp-3 text-sm leading-relaxed ${
                    ev.excerpt === EXCERPT_PLACEHOLDER
                      ? "italic text-na-muted/70"
                      : "text-na-muted"
                  }`}
                >
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

      {edit?.ready && edit.hidden.length > 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
            Crónicas ocultas
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            No aparecen en /eventos. Puedes mostrarlas de nuevo cuando quieras.
          </p>
          <ul className="mt-4 space-y-2">
            {edit.hidden.map((slug) => {
              const seed = EVENTOS.find((e) => e.slug === slug);
              const title = seed?.title ?? slug.replace(/-/g, " ");
              return (
                <li
                  key={slug}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2.5 shadow-sm"
                >
                  <span className="truncate text-sm font-semibold text-na-heketDark">
                    {title}
                    {seed ? (
                      <span className="ml-2 text-[10px] font-normal uppercase text-slate-500">
                        catálogo base
                      </span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => edit.restoreItem(slug)}
                    className="shrink-0 rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                  >
                    Mostrar de nuevo
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </>
  );
}

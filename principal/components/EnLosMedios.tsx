"use client";



import {
  ArrowUpRight,

  Mic,

  Newspaper,

  Pencil,

  Plus,

  Presentation,

  Radio,

  Trash2,

  Video,

} from "lucide-react";

import { MEDIOS, type MedioItem, isSeedMedio } from "@/lib/medios";

import { useMergedMedios } from "@/lib/cms/hooks";

import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

import { isCmsEnabled } from "@/lib/cms/provider";

import { LeaveSiteLink } from "@/components/LeaveSiteLink";

import { ContentCardImage } from "@/components/ContentCardMedia";

import { useMediosCmsEdit } from "@/components/cms/MediosCmsEditContext";



const KIND_ICON = {

  Entrevista: Mic,

  Artículo: Newspaper,

  Charla: Presentation,

  Programa: Radio,

  Video: Video,

} as const;



function MediaCard({

  m,

  onEdit,

  onDelete,

}: {

  m: MedioItem;

  onEdit?: () => void;

  onDelete?: () => void;

}) {

  const Icon = KIND_ICON[m.kind];

  const hasLink = Boolean(m.url);

  const imageSrc = resolveCmsMediaUrl(m.image?.src) ?? m.image?.src;



  const inner = (

    <>

      {onEdit ? (

        <span className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow">

          <Pencil className="h-4 w-4" aria-hidden />

        </span>

      ) : null}

      {onDelete ? (

        <button

          type="button"

          onClick={(e) => {

            e.stopPropagation();

            onDelete();

          }}

          className="absolute right-3 top-14 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-white text-red-700 shadow hover:bg-red-50"

          title={isSeedMedio(m.id) ? "Ocultar del sitio" : "Eliminar"}

        >

          <Trash2 className="h-4 w-4" aria-hidden />

        </button>

      ) : null}

      <ContentCardImage
        src={imageSrc || undefined}
        alt={m.image?.alt ?? m.title}
        className="mb-4 rounded-xl"
        sizes="(max-width: 640px) 100vw, 33vw"
      />

      <div className="flex items-center justify-between gap-3">

        <span className="inline-flex items-center gap-1.5 rounded-full bg-na-kefer/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-kefer">

          <Icon className="h-3.5 w-3.5" />

          {m.kind}

        </span>

        {hasLink && !onEdit ? (

          <ArrowUpRight className="h-4 w-4 shrink-0 text-na-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-na-kefer" />

        ) : null}

      </div>

      <h3 className="mt-4 text-lg font-black leading-snug text-na-heketDark">

        {m.title}

      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">

        {m.excerpt}

      </p>

      <div className="mt-4 border-t border-na-heket/10 pt-3 text-xs font-semibold text-na-muted">

        <span className="text-na-heketDark">{m.people}</span>

        <span className="mx-1.5 text-na-muted/50">·</span>

        <span>{m.outlet}</span>

        {m.date ? (

          <>

            <span className="mx-1.5 text-na-muted/50">·</span>

            <span>{m.date}</span>

          </>

        ) : null}

      </div>

    </>

  );



  const base =

    "group relative flex h-full flex-col rounded-2xl border border-na-heket/10 bg-na-surface p-6 shadow-na-soft";



  if (onEdit) {
    // div + role=button: el botón Eliminar no puede ir dentro de otro <button>
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEdit();
          }
        }}
        className={`${base} cursor-pointer text-left transition hover:-translate-y-1 hover:shadow-na-card hover:ring-2 hover:ring-amber-400/60`}
      >
        {inner}
      </div>
    );
  }



  if (hasLink) {

    return (

      <LeaveSiteLink

        href={m.url!}

        className={`${base} transition hover:-translate-y-1 hover:shadow-na-card`}

      >

        {inner}

      </LeaveSiteLink>

    );

  }



  return <div className={base}>{inner}</div>;

}



export function EnLosMedios() {

  const edit = useMediosCmsEdit();

  const merged = useMergedMedios();

  const list = edit?.ready

    ? edit.items.map((m) => ({

        id: m.id,

        title: m.title,

        outlet: m.outlet,

        kind: m.kind,

        people: m.people,

        date: m.date,

        excerpt: m.excerpt,

        url: m.url,

        image: m.image

          ? {

              ...m.image,

              src: resolveCmsMediaUrl(m.image.src) ?? m.image.src,

            }

          : undefined,

      }))

    : isCmsEnabled()

      ? merged

      : MEDIOS;



  return (

    <section

      id="voz-fuera-sede"

      className="scroll-mt-24 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"

    >

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">

          En los medios

        </p>

        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">

          Nuestra voz fuera de la sede

        </h2>

        <p className="mt-4 max-w-2xl text-na-muted">

          Entrevistas, artículos y charlas de nuestros directores y miembros en

          medios y espacios de diálogo. Cada tarjeta enlaza al medio original.

        </p>



        {edit?.ready ? (

          <button

            type="button"

            onClick={() => edit.addItem()}

            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-sky-400 bg-white px-4 py-2 text-xs font-bold uppercase text-sky-900 shadow-sm hover:bg-sky-50"

          >

            <Plus className="h-4 w-4" />

            Añadir aparición en medio externo

          </button>

        ) : null}



        <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

          {list.map((m) => (

            <li key={m.id}>

              <MediaCard

                m={m}

                onEdit={

                  edit?.ready

                    ? () => edit.setSelectedId(m.id)

                    : undefined

                }

                onDelete={

                  edit?.ready

                    ? () => {

                        const seed = isSeedMedio(m.id);

                        const msg = seed

                          ? "¿Ocultar esta aparición del sitio?"

                          : "¿Eliminar esta aparición?";

                        if (window.confirm(msg)) {

                          edit.hideItem(m.id);

                        }

                      }

                    : undefined

                }

              />

            </li>

          ))}

        </ul>

      </div>

    </section>

  );

}



"use client";



import { CivisMediaImage } from "@/components/cms/CivisMediaImage";

import Link from "next/link";

import { useEffect, useState } from "react";

import { CalendarDays, Clock, MapPin, X } from "lucide-react";

import { CIVIS_FORM_HREF } from "@/lib/civis-content";

import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";

import { CivisEditPencil } from "@/components/cms/CmsEditFields";

import { useCivisCmsEdit } from "@/components/cms/CivisCmsEditContext";

import {

  useCivisTalleresPageCopy,

  useMergedProximasActividades,

} from "@/lib/cms/hooks";

import type { ProximaActividad } from "@/lib/talleres-actividades";



export function ActividadScheduleMeta({ act }: { act: ProximaActividad }) {
  return (
    <>
      {act.date ? (
        <p className="mt-1 text-sm font-semibold text-na-civisDark">{act.date}</p>
      ) : null}
      {act.time ? (
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-na-muted">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {act.time}
        </p>
      ) : null}
      {act.sede ? (
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-na-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {act.sede}
        </p>
      ) : null}
      {act.format ? (
        <p className="mt-1 text-sm font-medium text-na-muted">{act.format}</p>
      ) : null}
    </>
  );
}



export function ActividadModal({

  act,

  onClose,

}: {

  act: ProximaActividad;

  onClose: () => void;

}) {

  useEffect(() => {

    const onKey = (e: KeyboardEvent) => {

      if (e.key === "Escape") onClose();

    };

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKey);

    return () => {

      document.body.style.overflow = "";

      window.removeEventListener("keydown", onKey);

    };

  }, [onClose]);



  return (

    <div

      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"

      role="presentation"

      onClick={onClose}

    >

      <div className="absolute inset-0 bg-na-ink/55 backdrop-blur-sm" aria-hidden />

      <div

        role="dialog"

        aria-modal="true"

        aria-labelledby={`actividad-modal-${act.id}`}

        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-na-card"

        onClick={(e) => e.stopPropagation()}

      >

        <div className="relative aspect-[16/10] w-full bg-na-civis/5">

          <CivisMediaImage

            src={act.image.src}

            alt={act.image.alt}

            fill

            className="object-cover"

            style={{ objectPosition: act.image.objectPosition ?? "50% 30%" }}

            sizes="512px"

            unoptimized

          />

          <button

            type="button"

            onClick={onClose}

            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-na-ink shadow-na-soft transition hover:bg-white"

            aria-label="Cerrar"

          >

            <X className="h-5 w-5" aria-hidden />

          </button>

        </div>



        <div className="p-6 sm:p-7">

          <span className="inline-flex items-center gap-1.5 rounded-full bg-na-civis/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-civisDark">

            <CalendarDays className="h-3 w-3" aria-hidden />

            {act.open ? "Abierto" : "Próximamente"}

          </span>

          <OfertaFormativaItem

            titleId={`actividad-modal-${act.id}`}

            title={act.title}

            intro={act.excerpt}

            meta={
              <ActividadScheduleMeta act={act} />
            }

            titleClassName="text-xl sm:text-2xl"

          />

          <p className="mt-6">

            <Link

              href={CIVIS_FORM_HREF}

              className="inline-flex w-full items-center justify-center rounded-full bg-na-civis px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-civis/25 transition hover:bg-na-civisDark sm:w-auto"

            >

              Ir a inscribirte

            </Link>

          </p>

        </div>

      </div>

    </div>

  );

}



export function ProximasActividades() {

  const edit = useCivisCmsEdit();

  const copy = useCivisTalleresPageCopy();

  const actividades = useMergedProximasActividades();

  const [selected, setSelected] = useState<ProximaActividad | null>(null);

  const section = copy.agenda ?? {};



  return (

    <>

      <div className="relative mt-16 border-t border-na-civis/10 pt-14">

        {edit?.ready ? (

          <CivisEditPencil

            label="Editar sección agenda"

            onClick={() => edit.setSelectedId("__talleres-agenda-section__")}

            className="right-0 top-14"

          />

        ) : null}

        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">

          {section.eyebrow}

        </p>

        <h2 className="mt-3 text-2xl font-black text-na-ink sm:text-3xl">

          {section.title}

        </h2>

        <h3 className="mt-3 max-w-2xl text-sm font-normal text-na-muted sm:text-base">

          {section.lede}

        </h3>



        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {actividades.map((act) => (

            <li key={act.id} className="relative">

              {edit?.ready ? (

                <CivisEditPencil

                  label={`Editar ${act.title}`}

                  onClick={() => edit.setSelectedId(`actividad:${act.id}`)}

                />

              ) : null}

              <button

                type="button"

                onClick={() => setSelected(act)}

                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-na-civis/12 bg-white text-left shadow-na-soft transition hover:-translate-y-0.5 hover:border-na-civis/25 hover:shadow-na-card"

              >

                <div className="relative aspect-[4/3] w-full bg-na-civis/5">

                  <CivisMediaImage

                    src={act.image.src}

                    alt={act.image.alt}

                    fill

                    className="object-cover transition duration-300 group-hover:scale-[1.02]"

                    style={{

                      objectPosition: act.image.objectPosition ?? "50% 30%",

                    }}

                    sizes="(max-width: 1024px) 100vw, 33vw"

                    unoptimized

                  />

                </div>

                <div className="flex flex-1 flex-col p-6">

                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-na-civis/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-civisDark">

                    <CalendarDays className="h-3 w-3" aria-hidden />

                    {act.open ? "Abierto" : "Próximamente"}

                  </span>

                  <OfertaFormativaItem

                    variant="summary"

                    title={act.title}

                    intro={act.excerpt}

                    meta={
                      <ActividadScheduleMeta act={act} />
                    }

                    titleClassName="mt-4 text-lg"

                    introClassName="mt-3 line-clamp-3 flex-1"

                  />

                </div>

              </button>

            </li>

          ))}

        </ul>

      </div>



      {selected ? (

        <ActividadModal act={selected} onClose={() => setSelected(null)} />

      ) : null}

    </>

  );

}



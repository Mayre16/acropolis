"use client";



import { CivisMediaImage } from "@/components/cms/CivisMediaImage";



import { Clock } from "lucide-react";



import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";

import { ProximasActividades } from "@/components/ProximasActividades";

import { CivisEditPencil } from "@/components/cms/CmsEditFields";

import { useCivisCmsEdit } from "@/components/cms/CivisCmsEditContext";

import { useCivisTalleresPageCopy, useMergedOferta } from "@/lib/cms/hooks";



export function TalleresOferta() {

  const edit = useCivisCmsEdit();

  const copy = useCivisTalleresPageCopy();

  const talleres = useMergedOferta();

  const section = copy.oferta ?? {};



  return (

    <section className="relative border-b border-na-civis/10 bg-na-surface py-14 sm:py-16">

      {edit?.ready ? (

        <CivisEditPencil

          label="Editar sección oferta"

          onClick={() => edit.setSelectedId("__talleres-oferta-section__")}

          className="right-4 top-4"

        />

      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">

          {section.eyebrow}

        </p>



        <h2 className="mt-3 text-balance text-3xl font-black text-na-ink sm:text-4xl">

          {section.title}

        </h2>



        <h3 className="mt-4 max-w-2xl text-sm font-normal leading-relaxed text-na-muted sm:text-base">

          {section.lede}

        </h3>



        <ul className="mt-10 space-y-8 sm:space-y-10">

          {talleres.map((taller) => (

            <li

              key={taller.id}

              className="relative overflow-hidden rounded-2xl border border-na-civis/12 bg-white shadow-na-soft"

            >

              {edit?.ready ? (

                <CivisEditPencil

                  label={`Editar ${taller.title}`}

                  onClick={() => edit.setSelectedId(`oferta:${taller.id}`)}

                />

              ) : null}

              <article className="grid lg:grid-cols-2">

                <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[340px]">

                  <CivisMediaImage

                    src={taller.image.src}

                    alt={taller.image.alt}

                    fill

                    className="object-cover"

                    style={{

                      objectPosition: taller.image.objectPosition ?? "50% 30%",

                    }}

                    sizes="(min-width: 1024px) 50vw, 100vw"

                    unoptimized

                  />

                </div>

                <div className="flex flex-col p-6 sm:p-8">

                  <OfertaFormativaItem

                    title={taller.title}

                    intro={taller.intro}

                    topics={taller.topics}

                    meta={

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-wide text-na-civis">

                        <span className="inline-flex items-center gap-1.5">

                          <Clock className="h-3.5 w-3.5" aria-hidden />

                          {taller.duration}

                        </span>

                        <span>{taller.format}</span>

                        <span>Hasta {taller.maxParticipants} personas</span>

                      </div>

                    }

                  />

                </div>

              </article>

            </li>

          ))}

        </ul>



        <ProximasActividades />

      </div>

    </section>

  );

}



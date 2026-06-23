"use client";

import { CivisMediaImage } from "@/components/cms/CivisMediaImage";
import { Plus } from "lucide-react";
import { CivisEditPencil } from "@/components/cms/CmsEditFields";
import { useCivisCmsEdit } from "@/components/cms/CivisCmsEditContext";
import {
  useCivisHomePageCopy,
  useMergedTalleresRealizados,
} from "@/lib/cms/hooks";

/** Máximo de fotos visibles en la home (misma lógica que acropolis.org.do). */
export const CIVIS_HOME_TALLERES_FOTOS_LIMIT = 6;

/** Rejilla de 6 fotos de talleres recientes — estilo home Nueva Acrópolis. */
export function CivisActividadesRecientesFotos() {
  const edit = useCivisCmsEdit();
  const copy = useCivisHomePageCopy();
  const section = copy.actividades ?? {};

  const mergedItems = useMergedTalleresRealizados();
  const items = mergedItems
    .slice(0, CIVIS_HOME_TALLERES_FOTOS_LIMIT)
    .map((t, idx) => ({
      ...t,
      cmsId:
        edit?.ready && edit.talleresRealizados[idx]
          ? edit.talleresRealizados[idx]!.id
          : undefined,
    }));

  if (items.length === 0) {
    if (!edit?.ready) return null;
    return (
      <section
        id="actividades-recientes"
        className="scroll-mt-24 border-t border-na-civis/10 bg-na-civis/[0.05] py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-sm text-na-muted">Aún no hay fotos de talleres.</p>
          <button
            type="button"
            onClick={() => edit.addTallerRealizado()}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-na-civis px-5 py-2.5 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            Añadir primera foto
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="actividades-recientes"
      className="relative scroll-mt-24 border-t border-na-civis/10 bg-na-civis/[0.05] py-14 sm:py-16"
    >
      {edit?.ready ? (
        <CivisEditPencil
          label="Editar sección actividades"
          onClick={() => edit.setSelectedId("__home-actividades-section__")}
          className="right-4 top-4"
        />
      ) : null}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-na-ink sm:text-3xl">
              {section.title}
            </h2>
            {section.lede ? (
              <p className="mx-auto mt-3 max-w-2xl text-sm text-na-muted sm:mx-0 sm:text-base">
                {section.lede}
              </p>
            ) : null}
            {edit?.ready ? (
              <p className="mx-auto mt-2 max-w-2xl text-xs font-semibold text-amber-800 sm:mx-0">
                Clic en el lápiz de cada foto para cambiar imagen o datos.
              </p>
            ) : null}
          </div>
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.addTallerRealizado()}
              className="inline-flex items-center gap-2 rounded-full bg-na-civis px-4 py-2 text-xs font-bold uppercase text-white shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir foto
            </button>
          ) : null}
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {items.map((item, idx) => {
            const caption = [item.title, item.client].filter(Boolean).join(" · ");
            return (
              <li
                key={item.cmsId ?? `${item.title}-${item.client}-${idx}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-na-civis/5 sm:rounded-xl"
              >
                {edit?.ready && item.cmsId ? (
                  <CivisEditPencil
                    label="Editar taller realizado"
                    onClick={() => edit.setSelectedId(`realizado:${item.cmsId}`)}
                    className="right-2 top-2 z-10"
                  />
                ) : null}
                <CivisMediaImage
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  style={{
                    objectPosition: item.image.objectPosition ?? "50% 30%",
                  }}
                  sizes="(max-width: 640px) 50vw, 33vw"
                  unoptimized
                />
                {caption ? (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-na-ink/80 to-transparent px-2 py-2 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 sm:px-3 sm:py-2.5 sm:text-xs">
                    {caption}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

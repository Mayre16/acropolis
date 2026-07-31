"use client";

import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditHooks";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useCmsActivityPhotos } from "@/lib/cms/hooks";
import { HOME_ACTIVITY_PHOTOS_LIMIT } from "@/lib/home-content";

export function HomeActivityPhotosSection() {
  const edit = useHomeCmsEdit();
  const photos = useCmsActivityPhotos();

  const list = edit?.ready
    ? edit.photos
    : photos.slice(0, HOME_ACTIVITY_PHOTOS_LIMIT);

  return (
    <section
      id="home-fotos"
      className="scroll-mt-24 border-t border-na-heket/10 bg-na-sand/60 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-na-heketDark sm:text-3xl">
              Fotos de nuestras actividades
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-na-muted sm:mx-0 sm:text-base">
              Actividades abiertas al público — filosofía, cultura y voluntariado en
              acción en República Dominicana.
              {edit?.ready ? (
                <span className="mt-1 block text-xs font-semibold text-amber-800">
                  Clic en el lápiz de cada foto para cambiar imagen, texto o quitarla.
                </span>
              ) : null}
            </p>
          </div>
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.addPhoto()}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir foto
            </button>
          ) : null}
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {list.map((photo, index) => {
            const src = resolveCmsMediaUrl(photo.src) ?? photo.src;
            return (
              <li
                key={`${photo.src}-${index}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-na-heket/5 sm:rounded-xl"
              >
                {edit?.ready ? (
                  <button
                    type="button"
                    onClick={() => edit.setSelected("photo", String(index))}
                    className="absolute right-2 top-2 z-10 rounded-full bg-na-helios p-1.5 text-na-ink shadow"
                    aria-label="Editar foto"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                ) : null}
                {src ? (
                  <Image
                    src={src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    unoptimized
                  />
                ) : edit?.ready ? (
                  <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                    Sin imagen — clic en lápiz
                  </div>
                ) : null}
                {photo.caption ? (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-na-heketDark/80 to-transparent px-2 py-2 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 sm:px-3 sm:py-2.5 sm:text-xs">
                    {photo.caption}
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

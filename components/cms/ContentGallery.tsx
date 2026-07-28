"use client";

import Image from "next/image";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type { CmsMedia } from "@/lib/cms/types";

/** Galería de fotos adicionales (estilo artículo/evento estándar). */
export function ContentGallery({ images }: { images: CmsMedia[] }) {
  if (!images.length) return null;

  return (
    <div
      className={
        images.length === 1
          ? "mt-8 space-y-2"
          : "mt-8 grid gap-6 sm:grid-cols-2"
      }
    >
      {images.map((img, i) => {
        const src = resolveCmsMediaUrl(img.src) ?? img.src;
        return (
        <figure key={`${img.src}-${i}`} className="overflow-hidden rounded-2xl">
          <div
            className={`relative w-full bg-na-heket/5 ${
              images.length === 1 ? "aspect-[16/9]" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={src}
              alt={img.alt}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 40rem"
              className="object-cover"
            />
          </div>
          {img.credit ? (
            <figcaption className="mt-1.5 text-right text-xs text-na-muted">
              Imagen: {img.credit}
            </figcaption>
          ) : null}
        </figure>
        );
      })}
    </div>
  );
}

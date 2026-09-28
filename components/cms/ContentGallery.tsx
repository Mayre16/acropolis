"use client";

import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type { CmsMedia } from "@/lib/cms/types";

/** Galería de fotos adicionales (artículos y crónicas). */
export function ContentGallery({ images }: { images: CmsMedia[] }) {
  if (!images.length) return null;

  return (
    <div
      className={
        images.length === 1
          ? "mt-8"
          : "mt-8 grid items-start gap-6 sm:grid-cols-2"
      }
    >
      {images.map((img, i) => {
        const src = resolveCmsMediaUrl(img.src) ?? img.src;
        return (
          <figure
            key={`${img.src}-${i}`}
            className="overflow-hidden rounded-2xl bg-na-heket/[0.04]"
          >
            {/* object-contain + alto natural: vertical y horizontal se ven enteras. */}
            <img
              src={src}
              alt={img.alt}
              className="mx-auto block h-auto max-h-[800px] w-auto max-w-full"
            />
            {img.credit ? (
              <figcaption className="px-2 py-1.5 text-right text-xs text-na-muted">
                Imagen: {img.credit}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}

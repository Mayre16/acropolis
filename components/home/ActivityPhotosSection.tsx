import Image from "next/image";
import { ACTIVITY_PHOTOS } from "@/lib/home-content";

export function ActivityPhotosSection() {
  return (
    <section className="border-t border-na-heket/10 bg-na-sand/60 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-black text-na-heketDark sm:text-3xl">
          Fotos de nuestras actividades
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-na-muted sm:text-base">
          Actividades abiertas al público — filosofía, cultura y voluntariado en
          acción en República Dominicana.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {ACTIVITY_PHOTOS.map((photo) => (
            <li
              key={photo.src}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-na-heket/5 sm:rounded-xl"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
                unoptimized
              />
              {photo.caption ? (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-na-heketDark/80 to-transparent px-2 py-2 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 sm:px-3 sm:py-2.5 sm:text-xs">
                  {photo.caption}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

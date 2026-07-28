import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { NA_INTRO_PARAGRAPHS } from "@/lib/institucional-content";

/** Teaser «Qué es Nueva Acrópolis» en la home (como acropolis.org/es). */
export function WhatIsNA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-na-heket/5 shadow-na-card">
          <Image
            src="/img/home/grecia.webp"
            alt="Visitante contemplando el Partenón en la Acrópolis de Atenas"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized
          />
        </div>

        <div>
          {NA_INTRO_PARAGRAPHS.map((p) => (
            <p key={p.slice(0, 24)} className="mt-5 text-na-muted first:mt-0">
              {p.includes("Escuela de Filosofía") ? (
                <>
                  {p.split("Escuela de Filosofía")[0]}
                  <strong className="text-na-heketDark">Escuela de Filosofía</strong>
                  {p.split("Escuela de Filosofía")[1]}
                </>
              ) : (
                p
              )}
            </p>
          ))}
          <p className="mt-4 font-bold text-na-heketDark">
            ¡Conoce un poco más de nuestro trabajo!
          </p>
          <Link
            href="/quienes-somos"
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-na-heket px-6 py-3 text-sm font-bold text-na-heket transition hover:bg-na-heket hover:text-white"
          >
            Nuestra historia
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

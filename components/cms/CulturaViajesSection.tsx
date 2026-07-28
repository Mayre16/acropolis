"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import { useCulturaCmsEdit } from "@/components/cms/CulturaCmsEditContext";
import {
  useCulturaViajesDisplay,
} from "@/lib/cms/cultura-display";
import { viajeCardSelectedId } from "@/lib/cms/viajes-display";
import { accentCardShell } from "@/lib/brand-accents";

export function CulturaViajesSection() {
  const edit = useCulturaCmsEdit();
  const section = useCulturaViajesDisplay();

  return (
    <section
      id="cultura-viajes"
      className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="relative">
        {edit?.ready ? (
          <button
            type="button"
            onClick={() => edit.setSelectedId("__viajes-section__")}
            className="absolute right-0 top-0 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar textos
          </button>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          {section.eyebrow}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {section.title}
        </h2>
        <p className="mt-4 max-w-2xl text-na-muted">{section.intro}</p>
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {section.cards.map(
          ({ categoria, href, src, alt, title, text }, i) => (
            <li key={categoria} className="relative">
              {edit?.ready ? (
                <button
                  type="button"
                  onClick={() =>
                    edit.setSelectedId(viajeCardSelectedId(categoria))
                  }
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                  aria-label={`Editar ${title}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}
              <Link
                href={href}
                className={`group block overflow-hidden ${accentCardShell(i)}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    unoptimized
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <OfertaFormativaItem
                    title={title}
                    intro={text}
                    titleClassName="text-lg"
                    introClassName="mt-2"
                  />
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-na-kefer transition group-hover:gap-2.5">
                    Ver destinos
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

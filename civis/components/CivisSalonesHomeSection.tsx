"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Pencil } from "lucide-react";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  useCivisSalonesPage,
  useMergedSalones,
} from "@/lib/cms/salones-hooks";
import { useSalonesCmsEdit } from "@/components/cms/SalonesCmsEditContext";

/** Vista previa de salones en alquiler — al final del home de Civis. */
export function CivisSalonesHomeSection() {
  const edit = useSalonesCmsEdit();
  const page = useCivisSalonesPage();
  const preview = useMergedSalones().slice(0, 3);

  if (preview.length === 0) return null;

  return (
    <section
      id="espacios"
      className="scroll-mt-28 border-t border-na-civis/10 bg-gradient-to-br from-na-civis/[0.12] via-white to-na-civis/[0.06] py-14 sm:py-16"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {edit?.ready ? (
          <button
            type="button"
            onClick={() => edit.setSelectedId("__section__")}
            className="absolute right-4 top-0 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950 sm:right-6"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar textos
          </button>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">
          {page.eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-black text-na-ink sm:text-4xl">
          {page.title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-na-muted sm:text-base">
          {page.lede}
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {preview.map((salon) => (
            <li
              key={salon.id}
              className="group relative overflow-hidden rounded-2xl border border-na-civis/12 bg-white shadow-na-soft"
            >
              {edit?.ready ? (
                <button
                  type="button"
                  onClick={() => edit.setSelectedId(salon.id)}
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                  aria-label={`Editar ${salon.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <div className="relative aspect-[16/10] bg-na-civis/5">
                <Image
                  src={resolveCmsMediaUrl(salon.image.src) ?? salon.image.src}
                  alt={salon.image.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-na-civisDark">
                  Sede {salon.sede}
                </p>
                <p className="mt-1 font-black text-na-ink">{salon.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-na-muted">
                  {salon.summary}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/salones"
            className="inline-flex items-center gap-2 rounded-full bg-na-civis px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-civis/25 transition hover:bg-na-civisDark"
          >
            <Building2 className="h-4 w-4" aria-hidden />
            Ver todos los salones
          </Link>
          <Link
            href="/inscribete"
            className="inline-flex items-center gap-2 text-sm font-semibold text-na-civisDark transition hover:gap-3"
          >
            Solicitar propuesta con salón incluido
            <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </div>
    </section>
  );
}

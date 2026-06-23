"use client";

import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import { EsferaLogo } from "@/components/EsferaLogo";
import {
  ESFERA_HOME_PROMO_SELECTED_ID,
  useEsferaHomeCmsEdit,
  useEsferaHomeDisplay,
} from "@/lib/cms/esfera-home-display";

export function EsferaHomeSection() {
  const edit = useEsferaHomeCmsEdit();
  const promo = useEsferaHomeDisplay();

  return (
    <section className="relative border-t border-na-heket/10 bg-gradient-to-br from-na-heket/[0.04] via-na-surface to-na-amon/[0.06] py-8 sm:py-9">
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setSelectedId(ESFERA_HOME_PROMO_SELECTED_ID)}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
      ) : null}

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid items-center gap-5 sm:grid-cols-[min(44%,19rem)_1fr] sm:gap-8">
          <EsferaLogo
            variant="punto-focal"
            className="mx-auto h-auto max-h-[7.125rem] w-auto max-w-[min(100%,19rem)] object-contain object-center sm:mx-0 sm:object-left"
          />

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-na-kefer">
              {promo.eyebrow}
            </p>
            <h2 className="mt-1 text-balance text-lg font-black text-na-heketDark sm:text-xl">
              {promo.title}
            </h2>
            <p className="mt-1.5 text-sm leading-snug text-na-muted">
              {promo.intro} {promo.detail}
            </p>

            <Link
              href="/esfera/"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1f9078] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#1f9078]/25 transition hover:bg-na-kefer"
            >
              {promo.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

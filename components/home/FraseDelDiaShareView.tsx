"use client";

import Image from "next/image";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useCmsFrasesDelDia } from "@/lib/cms/hooks";
import type { CmsFraseDelDia } from "@/lib/cms/types";
import { shareFraseDelDiaLink } from "@/lib/frases-del-dia-share";

export function FraseDelDiaShareView({
  initial,
}: {
  initial: CmsFraseDelDia | null;
}) {
  const live = useCmsFrasesDelDia();
  // Preferir live solo si trae foto; si no, mantener el SSR del build.
  const liveMatch = initial?.id
    ? live.find((f) => f.id === initial.id && f.src?.trim())
    : undefined;
  const frase = liveMatch ?? initial;
  const src = frase?.src
    ? (resolveCmsMediaUrl(frase.src) ?? frase.src)
    : "";

  if (!frase || !src) {
    return (
      <section className="mx-auto max-w-lg px-5 py-16 text-center sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-na-kefer">
          Frase del día
        </p>
        <h1 className="mt-2 text-xl font-black text-na-heketDark">
          Esta frase ya no está disponible
        </h1>
        <p className="mt-3 text-sm text-na-muted">
          Mira las frases actuales en la página de inicio.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-na-heket px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-na-heketDark"
        >
          Ir al inicio
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-na-kefer">
        Frase del día
      </p>
      <h1 className="mt-2 text-balance text-center text-xl font-black text-na-heketDark sm:text-2xl">
        Nueva Acrópolis RD
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-na-muted">
        Vi esta frase en Nueva Acrópolis RD y pensé en ti!
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl bg-na-heket/[0.04] p-3 shadow-na-soft sm:p-4">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white">
          <Image
            src={src}
            alt={frase.alt || "Frase del día"}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 90vw, 480px"
            unoptimized
            priority
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => void shareFraseDelDiaLink(frase.id)}
          className="inline-flex items-center gap-2 rounded-full border border-na-heket/20 bg-white px-4 py-2.5 text-sm font-semibold text-na-heketDark transition hover:bg-na-heket/5"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Compartir con alguien
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-na-heket px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-na-heketDark"
        >
          Ver más en el inicio
        </Link>
      </div>
    </section>
  );
}

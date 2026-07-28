"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { CmsSectionEditBar, CmsEditPencil } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import {
  ESFERA_ALIANZAS_SECTION_ID,
  esferaAlianzaSelectedId,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type { CmsEsferaAlianza } from "@/lib/cms/types";
import { accentCardShell, accentEyebrowClass, accentTokens } from "@/lib/brand-accents";

/** En grid estático caben 5 por fila en xl; a partir de 6 rota en carrusel. */
const ALIANZAS_GRID_MAX = 5;

function useAlianzasPerView(count: number) {
  const [perView, setPerView] = useState(2);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const maxVisible = Math.min(count, ALIANZAS_GRID_MAX);
      setPerView(
        w >= 1280
          ? maxVisible
          : w >= 1024
            ? Math.min(4, maxVisible)
            : w >= 640
              ? Math.min(3, maxVisible)
              : Math.min(2, maxVisible),
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [count]);

  return perView;
}

function AlianzaCard({
  alianza,
  index,
  editing,
  onEdit,
}: {
  alianza: CmsEsferaAlianza;
  index: number;
  editing?: boolean;
  onEdit?: () => void;
}) {
  const a = accentTokens(index);
  const logoSrc = resolveCmsMediaUrl(alianza.logo) ?? alianza.logo;

  return (
    <div
      className={`relative flex h-full flex-col items-center justify-between gap-4 p-5 text-center ${accentCardShell(index, "min-h-[168px]")}`}
    >
      {editing && onEdit ? (
        <CmsEditPencil
          label={`Editar ${alianza.name}`}
          onClick={onEdit}
          className="right-2 top-2"
        />
      ) : null}
      <div className="flex min-h-[72px] w-full flex-1 items-center justify-center rounded-xl bg-white/80 px-3 py-4">
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt={alianza.logoAlt}
            width={180}
            height={72}
            unoptimized
            className="max-h-16 w-auto max-w-full object-contain"
          />
        ) : editing ? (
          <span className="text-xs text-amber-800">Sin logo</span>
        ) : null}
      </div>
      <p className={`text-xs font-bold leading-snug ${a.icon}`}>{alianza.name}</p>
    </div>
  );
}

function EsferaAlianzasCarousel({
  alianzas,
  editing,
  onEditAlianza,
}: {
  alianzas: CmsEsferaAlianza[];
  editing?: boolean;
  onEditAlianza?: (id: string) => void;
}) {
  const n = alianzas.length;
  const perView = useAlianzasPerView(n);
  const maxStart = Math.max(0, n - perView);
  const [start, setStart] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    setStart((s) => Math.min(s, maxStart));
  }, [maxStart]);

  const goNext = useCallback(() => {
    setStart((s) => (s >= maxStart ? 0 : s + 1));
  }, [maxStart]);

  const goPrev = useCallback(() => {
    setStart((s) => (s <= 0 ? maxStart : s - 1));
  }, [maxStart]);

  useEffect(() => {
    if (n <= perView || reduceMotion) return;
    const t = setInterval(goNext, 6500);
    return () => clearInterval(t);
  }, [n, perView, reduceMotion, goNext]);

  const slidePercent = 100 / perView;
  const pageCount = maxStart + 1;

  return (
    <div className="relative mt-10">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${start * slidePercent}%)` }}
        >
          {alianzas.map((alianza, i) => (
            <div
              key={alianza.id}
              className="shrink-0 px-2 first:pl-0 last:pr-0"
              style={{ width: `${slidePercent}%` }}
            >
              <AlianzaCard
                alianza={alianza}
                index={i}
                editing={editing}
                onEdit={() => onEditAlianza?.(alianza.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 ? (
        <>
          <div className="mt-5 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStart(i)}
                className={`h-2 rounded-full transition-all ${
                  i === start
                    ? "w-7 bg-na-heket"
                    : "w-2 bg-na-heket/25 hover:bg-na-heket/45"
                }`}
                aria-label={`Ver grupo ${i + 1} de alianzas`}
                aria-current={i === start ? "true" : undefined}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 -left-3 -right-3 flex items-center justify-between sm:-left-4 sm:-right-4">
            <button
              type="button"
              onClick={goPrev}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white/95 text-na-heket shadow-sm transition hover:bg-white"
              aria-label="Alianzas anteriores"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white/95 text-na-heket shadow-sm transition hover:bg-white"
              aria-label="Siguientes alianzas"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function EsferaAlianzasSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const alianzas = page.alianzas ?? [];
  const useCarousel = alianzas.length > ALIANZAS_GRID_MAX;

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección"
            onClick={() => edit.setSelectedId(ESFERA_ALIANZAS_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={accentEyebrowClass(3)}>{page.alianzasEyebrow}</p>
          <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            {page.alianzasTitle}
          </h2>
        </div>
        {edit?.ready ? (
          <button
            type="button"
            onClick={() => edit.addAlianza()}
            className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
          >
            <Plus className="h-4 w-4" />
            Añadir alianza
          </button>
        ) : null}
      </div>

      {useCarousel ? (
        <EsferaAlianzasCarousel
          alianzas={alianzas}
          editing={edit?.ready}
          onEditAlianza={(id) => edit?.setSelectedId(esferaAlianzaSelectedId(id))}
        />
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {alianzas.map((alianza, i) => (
            <li key={alianza.id}>
              <AlianzaCard
                alianza={alianza}
                index={i}
                editing={edit?.ready}
                onEdit={() => edit?.setSelectedId(esferaAlianzaSelectedId(alianza.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
} from "lucide-react";
import { useVoluntariadoCmsEdit } from "@/components/cms/VoluntariadoCmsEditContext";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  useVoluntariadoRecientesDisplay,
  VOLUNTARIADO_RECIENTES_SECTION_ID,
  voluntariadoRecienteId,
} from "@/lib/cms/voluntariado-display";
import type { CmsVoluntariadoReciente } from "@/lib/cms/types";
import { accentCardShell, accentEyebrowClass } from "@/lib/brand-accents";

function useCarouselPerView(itemCount: number) {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const maxVisible = Math.min(itemCount, 3);
      setPerView(
        w >= 1024
          ? maxVisible
          : w >= 640
            ? Math.min(2, maxVisible)
            : 1,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [itemCount]);

  return perView;
}

function RecienteCard({
  item,
  index,
  editing,
  onEdit,
}: {
  item: CmsVoluntariadoReciente;
  index: number;
  editing?: boolean;
  onEdit?: () => void;
}) {
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden ${accentCardShell(index)}`}
    >
      {editing ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow"
          aria-label={`Editar ${item.title}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : null}
      <div className="relative aspect-[4/3] w-full bg-na-heket/5">
        {item.src ? (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : editing ? (
          <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
            Sin foto — clic en ✎
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {item.date ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-na-kefer">
            {item.date}
          </p>
        ) : null}
        <h3 className="mt-0.5 text-sm font-black text-na-heketDark sm:text-base">
          {item.title}
        </h3>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-na-muted">
          {item.text}
        </p>
        {item.href ? (
          <Link
            href={item.href}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-na-kefer transition hover:gap-1.5"
          >
            Ver más
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function VoluntariadoRecientesCarousel({
  items,
  editing,
  onEditItem,
}: {
  items: CmsVoluntariadoReciente[];
  editing?: boolean;
  onEditItem?: (id: string) => void;
}) {
  const n = items.length;
  const perView = useCarouselPerView(n);
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
    const t = setInterval(goNext, 7000);
    return () => clearInterval(t);
  }, [n, perView, reduceMotion, goNext]);

  if (n === 0) return null;

  const slidePercent = 100 / perView;
  const pageCount = maxStart + 1;

  return (
    <div className="relative mt-8">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${start * slidePercent}%)` }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="shrink-0 px-2 first:pl-0 last:pr-0"
              style={{ width: `${slidePercent}%` }}
            >
              <RecienteCard
                item={item}
                index={i}
                editing={editing}
                onEdit={() => onEditItem?.(item.id)}
              />
            </div>
          ))}
        </div>
      </div>

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
            aria-label={`Ver grupo ${i + 1} de actividades`}
            aria-current={i === start ? "true" : undefined}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 -left-3 -right-3 flex items-center justify-between sm:-left-4 sm:-right-4">
        <button
          type="button"
          onClick={goPrev}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white/95 text-na-heket shadow-sm transition hover:bg-white"
          aria-label="Actividades anteriores"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white/95 text-na-heket shadow-sm transition hover:bg-white"
          aria-label="Siguientes actividades"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function VoluntariadoActividadesRecientes() {
  const edit = useVoluntariadoCmsEdit();
  const section = useVoluntariadoRecientesDisplay();
  const rawItems = edit?.ready
    ? (edit.page.recientesItems ?? section.items)
    : section.items;
  const items = rawItems.map((item) => ({
    ...item,
    src: resolveCmsMediaUrl(item.src) ?? item.src,
  }));
  const useCarousel = items.length > 0;

  return (
    <section
      id="actividades-recientes"
      className="relative scroll-mt-24 border-t border-na-heket/10 bg-na-sand/30 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {edit?.ready ? (
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => edit.setSelectedId(VOLUNTARIADO_RECIENTES_SECTION_ID)}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar textos
            </button>
            <button
              type="button"
              onClick={() => edit.addReciente()}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir actividad
            </button>
          </div>
        ) : null}

        <p className={accentEyebrowClass(3)}>{section.eyebrow}</p>
        <h2 className="mt-3 text-balance text-2xl font-black text-na-heketDark sm:text-3xl">
          {section.title}
        </h2>
        <p className="mt-4 max-w-2xl text-na-muted">{section.intro}</p>

        {useCarousel ? (
          <VoluntariadoRecientesCarousel
            items={items}
            editing={edit?.ready}
            onEditItem={(id) => edit?.setSelectedId(voluntariadoRecienteId(id))}
          />
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {items.map((item, i) => (
              <li key={item.id}>
                <RecienteCard
                  item={item}
                  index={i}
                  editing={edit?.ready}
                  onEdit={() =>
                    edit?.setSelectedId(voluntariadoRecienteId(item.id))
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

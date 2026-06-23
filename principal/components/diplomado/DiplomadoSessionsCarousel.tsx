"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Pencil,
} from "lucide-react";
import type { AgendaEntry } from "@/lib/agenda";

type Props = {
  items: AgendaEntry[];
  intervalMs?: number;
  onEditItem?: (id: string) => void;
};

function usePerView() {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perView;
}

function SessionCard({
  item,
  onEdit,
}: {
  item: AgendaEntry;
  onEdit?: () => void;
}) {
  const card = (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--dip-teal)]/10 bg-white shadow-[0_6px_20px_rgba(17,22,49,0.07)]">
      <div className="relative aspect-[4/3] w-full shrink-0 bg-[var(--dip-panel)]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.imageAlt ?? item.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : null}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="rounded-md bg-[var(--dip-teal)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            Diplomado
          </span>
          {item.tag ? (
            <span className="rounded-md bg-[var(--dip-gold)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1a1a18]">
              {item.tag}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-extrabold leading-snug text-[var(--dip-ink)]">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--dip-muted)]">
            {item.description}
          </p>
        ) : null}

        <dl className="mt-3 space-y-1.5 text-xs text-[var(--dip-muted)]">
          <div className="flex items-center gap-1.5">
            <CalendarDays
              className="h-3.5 w-3.5 shrink-0 text-[var(--dip-teal)]"
              aria-hidden
            />
            <dd className="font-semibold text-[var(--dip-ink)]">{item.date}</dd>
          </div>
          {item.time ? (
            <div className="flex items-center gap-1.5">
              <Clock
                className="h-3.5 w-3.5 shrink-0 text-[var(--dip-teal)]"
                aria-hidden
              />
              <dd>{item.time}</dd>
            </div>
          ) : null}
          {item.sede ? (
            <div className="flex items-center gap-1.5">
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-[var(--dip-teal)]"
                aria-hidden
              />
              <dd>{item.sede}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          {item.detailHref ? (
            <Link
              href={item.detailHref}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--dip-teal)]/25 px-3 py-1.5 text-[11px] font-bold text-[var(--dip-teal)] transition hover:bg-[var(--dip-teal)]/8"
            >
              Ver programa
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );

  if (onEdit) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="group relative block h-full w-full text-left transition hover:ring-2 hover:ring-amber-400/70 hover:ring-offset-1"
      >
        <span className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow">
          <Pencil className="h-4 w-4" aria-hidden />
        </span>
        {card}
      </button>
    );
  }

  return card;
}

export function DiplomadoSessionsCarousel({
  items,
  intervalMs = 6000,
  onEditItem,
}: Props) {
  const perView = usePerView();
  const n = items.length;
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
    const t = setInterval(goNext, intervalMs);
    return () => clearInterval(t);
  }, [n, perView, reduceMotion, intervalMs, goNext]);

  if (n === 0) return null;

  const slidePercent = 100 / perView;
  const pageCount = maxStart + 1;
  const showNav = n > perView;

  return (
    <div className="relative mt-6">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${start * slidePercent}%)`,
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="shrink-0 px-2 first:pl-0 last:pr-0"
              style={{ width: `${slidePercent}%` }}
            >
              <SessionCard
                item={item}
                onEdit={
                  onEditItem && item.id
                    ? () => onEditItem(item.id!)
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>

      {showNav ? (
        <>
          <div className="mt-5 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStart(i)}
                className={`h-2 rounded-full transition-all ${
                  i === start
                    ? "w-7 bg-[var(--dip-teal)]"
                    : "w-2 bg-[var(--dip-teal)]/25 hover:bg-[var(--dip-teal)]/45"
                }`}
                aria-label={`Ver grupo de sesiones ${i + 1}`}
                aria-current={i === start ? "true" : undefined}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 -left-3 -right-3 flex items-center justify-between sm:-left-4 sm:-right-4">
            <button
              type="button"
              onClick={goPrev}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dip-teal)]/20 bg-white/95 text-[var(--dip-teal)] shadow-sm transition hover:bg-white"
              aria-label="Sesiones anteriores"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dip-teal)]/20 bg-white/95 text-[var(--dip-teal)] shadow-sm transition hover:bg-white"
              aria-label="Siguientes sesiones"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { CourseInscribeButton } from "@/components/CourseInscribeButton";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import { cn } from "@/lib/utils/cn";
import { useCursosOfertaDisplay } from "@/lib/cms/cursos-display";
import {
  HOME_TALLERES_CAROUSEL,
  HOME_TALLERES_FEATURED_IDS,
} from "@/lib/home-cursos-carousels";
import {
  isCursoPermanente,
  splitCursosOferta,
} from "@/lib/cursos-permanentes";
import type { CmsCursosCard } from "@/lib/cms/types";

const CARD_LG_HEIGHT = "lg:h-[380px] lg:min-h-[380px]";

function courseBadge(card: CmsCursosCard) {
  return isCursoPermanente(card.id) ? "Activo" : "Taller personalizado";
}

function CourseCarouselMeta({ card }: { card: CmsCursosCard }) {
  const horario = card.fechaApertura?.trim() || "";
  const rows = [
    { icon: Clock, label: "Horario", value: horario },
    { icon: MapPin, label: "Sede", value: card.sede },
    { icon: User, label: "Facilitador", value: card.facilitador },
  ] as const;

  return (
    <dl className="mt-3 grid min-h-[4.75rem] shrink-0 grid-cols-1 gap-y-2 text-sm text-na-muted sm:grid-cols-2">
      {rows.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className={cn(
            "inline-flex min-h-[1.375rem] items-center gap-1.5",
            label === "Facilitador" && "sm:col-span-2",
            !value && "invisible",
          )}
          aria-hidden={!value}
        >
          <Icon className="h-4 w-4 shrink-0 text-na-kefer" aria-hidden />
          <dt className="sr-only">{label}</dt>
          <dd>{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Cursos activos + talleres por convocatoria en un solo carrusel del home. */
export function HomeTalleresYCursosSection() {
  const display = useCursosOfertaDisplay();
  const items = useMemo(() => {
    const { permanentes } = splitCursosOferta(display.cursosTalleres);
    const byId = new Map(display.cursosTalleres.map((c) => [c.id, c]));
    const talleres = HOME_TALLERES_FEATURED_IDS.map((id) => byId.get(id)).filter(
      (card): card is CmsCursosCard =>
        !!card && !isCursoPermanente(card.id),
    );
    return [...permanentes, ...talleres];
  }, [display.cursosTalleres]);

  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = items.length;
  const current = items[index];

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [n]);

  useEffect(() => {
    if (n <= 1 || reduceMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 8000);
    return () => clearInterval(t);
  }, [n, reduceMotion]);

  if (!current || n === 0) return null;

  return (
    <section
      id="home-talleres-y-cursos"
      className="scroll-mt-24 border-t border-na-heket/10 bg-na-heket/[0.04] py-10 sm:py-11"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-na-kefer">
              {HOME_TALLERES_CAROUSEL.eyebrow}
            </p>
            <h2 className="mt-2 text-balance text-xl font-black text-na-heketDark sm:text-2xl">
              {HOME_TALLERES_CAROUSEL.title}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-na-muted">
              {HOME_TALLERES_CAROUSEL.intro}
            </p>
          </div>
          <Link
            href={HOME_TALLERES_CAROUSEL.linkHref}
            className="inline-flex items-center gap-2 text-sm font-bold text-na-heket transition hover:text-na-kefer"
          >
            {HOME_TALLERES_CAROUSEL.linkLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2 lg:gap-3">
            {n > 1 ? (
              <button
                type="button"
                onClick={() => setIndex((i) => (i - 1 + n) % n)}
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-na-soft transition hover:bg-white lg:inline-flex"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
          <article
            className={cn(
              "min-w-0 flex-1 overflow-hidden rounded-xl border border-na-heket/12 bg-white shadow-na-card",
              CARD_LG_HEIGHT,
            )}
          >
            <div className={cn("grid lg:grid-cols-[1.05fr_1fr]", CARD_LG_HEIGHT)}>
              <div
                className={cn(
                  "relative aspect-[16/10] bg-na-heket/5 lg:order-2 lg:aspect-auto lg:min-h-0",
                  CARD_LG_HEIGHT,
                )}
              >
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{ opacity: i === index ? 1 : 0 }}
                    aria-hidden={i !== index}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      unoptimized
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-na-heketDark/35 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-white/10"
                      aria-hidden
                    />
                  </div>
                ))}
                <div className="absolute left-4 top-4 flex min-h-[1.75rem] flex-wrap gap-2">
                  <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-na-heketDark shadow-sm">
                    {courseBadge(current)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm",
                      current.tag
                        ? "bg-na-helios text-na-ink"
                        : "invisible bg-na-helios text-na-ink",
                    )}
                    aria-hidden={!current.tag}
                  >
                    {current.tag || "Etiqueta"}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "flex flex-col overflow-hidden p-5 sm:p-6 lg:order-1",
                  CARD_LG_HEIGHT,
                )}
              >
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden transition-opacity duration-500">
                  <OfertaFormativaItem
                    variant="summary"
                    title={current.title}
                    intro={current.text?.trim() || "\u00A0"}
                    meta={<CourseCarouselMeta card={current} />}
                    titleClassName="line-clamp-2 min-h-[3.25rem] shrink-0 text-lg sm:min-h-[3.5rem] sm:text-xl"
                    introClassName="mt-2 line-clamp-3 min-h-0 flex-none text-na-muted [&:empty]:invisible"
                  />
                </div>

                <div className="mt-auto flex shrink-0 flex-wrap items-center gap-3 border-t border-na-heket/8 pt-5">
                  <CourseInscribeButton
                    title={current.title}
                    kind={
                      isCursoPermanente(current.id)
                        ? (current.inscribeKind ?? "curso")
                        : (current.inscribeKind ?? "taller")
                    }
                    sede={current.sede}
                    facilitador={current.facilitador}
                    label={current.inscribeLabel ?? "Solicitar info"}
                    className="!mt-0 !bg-na-heket !px-5 !py-2.5 !text-sm !text-white shadow-md shadow-na-heket/20 hover:!brightness-110"
                  />
                  <Link
                    href="/cursos"
                    className="inline-flex items-center gap-2 rounded-full border border-na-heket/25 px-5 py-2.5 text-sm font-semibold text-na-heket transition hover:bg-na-heket/5"
                  >
                    Ver en cursos
                  </Link>
                </div>
              </div>
            </div>
          </article>
            {n > 1 ? (
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % n)}
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-na-soft transition hover:bg-white lg:inline-flex"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
          </div>

          {n > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index
                      ? "w-8 bg-na-heket"
                      : "w-2.5 bg-na-heket/25 hover:bg-na-heket/45"
                  }`}
                  aria-label={`Ver: ${item.title}`}
                  aria-current={i === index ? "true" : undefined}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

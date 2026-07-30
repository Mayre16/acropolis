"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useCmsFrasesDelDia } from "@/lib/cms/hooks";
import { cn } from "@/lib/utils/cn";

/**
 * Carrusel de frases del día (fotos subidas desde el editor).
 * Se oculta en público si aún no hay imágenes.
 */
export function HomeFrasesDelDiaSection() {
  const edit = useHomeCmsEdit();
  const published = useCmsFrasesDelDia();
  const list = edit?.ready
    ? edit.frases
    : published.filter((f) => f.src?.trim());

  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const withSrc = list.filter((f) => f.src?.trim() || edit?.ready);
  const n = withSrc.length;
  const visible = Math.min(3, Math.max(1, n));
  const maxIndex = Math.max(0, n - visible);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (n <= visible || reduceMotion) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % (maxIndex + 1)),
      5000,
    );
    return () => clearInterval(t);
  }, [n, visible, maxIndex, reduceMotion]);

  if (!edit?.ready && n === 0) return null;

  return (
    <section
      id="frases-del-dia"
      className="scroll-mt-24 border-t border-na-heket/10 bg-white py-12 sm:py-14"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-na-kefer">
              Inspiración
            </p>
            <h2 className="mt-2 text-balance text-xl font-black text-na-heketDark sm:text-2xl">
              Frases del día
            </h2>
            {edit?.ready ? (
              <p className="mt-1.5 max-w-xl text-xs font-semibold text-amber-800">
                Sube las fotos desde el lápiz o «Añadir frase». Publica para verlas
                en el sitio.
              </p>
            ) : null}
          </div>
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.addFrase()}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Añadir frase
            </button>
          ) : null}
        </div>

        {n === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-10 text-center text-sm text-amber-900">
            Aún no hay frases. Pulsa «Añadir frase» y sube la imagen.
          </div>
        ) : (
          <div className="relative mt-6">
            <div className="overflow-hidden rounded-xl">
              <ul
                className="flex gap-3 transition-transform duration-700 ease-in-out sm:gap-4"
                style={{
                  transform:
                    n > visible
                      ? `translateX(calc(-${index} * ((100% - ${(visible - 1) * 0.75}rem) / ${visible} + 0.75rem)))`
                      : undefined,
                }}
              >
                {withSrc.map((frase) => {
                  const src = resolveCmsMediaUrl(frase.src) ?? frase.src;
                  return (
                    <li
                      key={frase.id}
                      className={cn(
                        "shrink-0",
                        visible === 1 && "w-full",
                        visible === 2 && "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1rem)/2)]",
                        visible >= 3 &&
                          "w-[calc((100%-1.5rem)/3)] sm:w-[calc((100%-2rem)/3)]",
                      )}
                    >
                      <div className="group relative overflow-hidden rounded-lg bg-na-heket/5 shadow-na-soft">
                        {edit?.ready ? (
                          <button
                            type="button"
                            onClick={() => edit.setSelected("frase", frase.id)}
                            className="absolute right-2 top-2 z-10 rounded-full bg-na-helios p-1.5 text-na-ink shadow"
                            aria-label="Editar frase"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        ) : null}
                        <div className="relative aspect-square w-full">
                          {src ? (
                            <Image
                              src={src}
                              alt={frase.alt || "Frase del día"}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 40vw, 220px"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-amber-50 px-3 text-center text-xs font-semibold text-amber-800">
                              Sin imagen — clic en lápiz
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {n > visible ? (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setIndex((i) => (i - 1 + maxIndex + 1) % (maxIndex + 1))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white text-na-heket transition hover:bg-na-heket/5"
                  aria-label="Frases anteriores"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: maxIndex + 1 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={cn(
                        "h-2 rounded-full transition",
                        i === index
                          ? "w-6 bg-na-heket"
                          : "w-2 bg-na-heket/25 hover:bg-na-heket/40",
                      )}
                      aria-label={`Ir al grupo ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % (maxIndex + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/20 bg-white text-na-heket transition hover:bg-na-heket/5"
                  aria-label="Frases siguientes"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

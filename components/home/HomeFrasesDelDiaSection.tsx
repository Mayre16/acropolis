"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useCmsFrasesDelDia } from "@/lib/cms/hooks";
import type { CmsFraseDelDia } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";

function absoluteMediaUrl(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (typeof window === "undefined") return src;
  return new URL(src, window.location.origin).href;
}

async function downloadFraseImage(src: string, filename: string) {
  const url = absoluteMediaUrl(src);
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open in new tab if CORS blocks blob download
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

async function shareFrase(src: string, alt: string) {
  const url = absoluteMediaUrl(src);
  const title = "Frase del día — Nueva Acrópolis RD";
  const text =
    alt?.trim() ||
    "Frase del día de Nueva Acrópolis República Dominicana";

  if (navigator.share) {
    try {
      const res = await fetch(url, { mode: "cors" });
      if (res.ok && typeof navigator.canShare === "function") {
        const blob = await res.blob();
        const ext = blob.type.includes("png")
          ? "png"
          : blob.type.includes("jpeg") || blob.type.includes("jpg")
            ? "jpg"
            : "webp";
        const file = new File([blob], `frase-del-dia.${ext}`, {
          type: blob.type || "image/webp",
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title, text });
          return;
        }
      }
    } catch {
      /* fall through to URL share */
    }
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    window.alert("Enlace de la imagen copiado.");
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function FraseLightbox({
  frase,
  src,
  onClose,
}: {
  frase: CmsFraseDelDia;
  src: string;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-na-heketDark/80 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[min(92vh,52rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-na-heket/10 px-4 py-3">
          <h3
            id={titleId}
            className="text-sm font-bold uppercase tracking-[0.18em] text-na-kefer"
          >
            Frase del día
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-na-heket transition hover:bg-na-heket/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto bg-[#f4f5f6] px-4 py-4 sm:px-6 sm:py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={frase.alt || "Frase del día"}
            className="mx-auto max-h-[min(70vh,40rem)] w-auto max-w-full rounded-lg object-contain shadow-md"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-na-heket/10 px-4 py-3 sm:gap-3">
          <button
            type="button"
            onClick={() => void shareFrase(src, frase.alt)}
            className="inline-flex items-center gap-2 rounded-full border border-na-heket/20 bg-white px-4 py-2 text-sm font-semibold text-na-heketDark transition hover:bg-na-heket/5"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Compartir
          </button>
          <button
            type="button"
            onClick={() =>
              void downloadFraseImage(
                src,
                `frase-del-dia-${frase.id.slice(0, 12)}.webp`,
              )
            }
            className="inline-flex items-center gap-2 rounded-full bg-na-heket px-4 py-2 text-sm font-semibold text-white transition hover:bg-na-heketDark"
          >
            <Download className="h-4 w-4" aria-hidden />
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const withSrc = list.filter((f) => f.src?.trim() || edit?.ready);
  const n = withSrc.length;
  const visible = Math.min(3, Math.max(1, n));
  const maxIndex = Math.max(0, n - visible);
  const lightboxFrase = lightboxId
    ? withSrc.find((f) => f.id === lightboxId)
    : null;
  const lightboxSrc = lightboxFrase
    ? (resolveCmsMediaUrl(lightboxFrase.src) ?? lightboxFrase.src)
    : "";

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
    if (n <= visible || reduceMotion || lightboxId) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % (maxIndex + 1)),
      5000,
    );
    return () => clearInterval(t);
  }, [n, visible, maxIndex, reduceMotion, lightboxId]);

  if (!edit?.ready && n === 0) return null;

  return (
    <section
      id="frases-del-dia"
      className="scroll-mt-24 border-t border-na-heket/10 bg-white py-14 sm:py-16"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
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
            ) : (
              <p className="mt-1.5 max-w-xl text-sm text-na-muted">
                Toca una frase para verla grande, compartirla o descargarla.
              </p>
            )}
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
          <div className="mt-8 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-10 text-center text-sm text-amber-900">
            Aún no hay frases. Pulsa «Añadir frase» y sube la imagen.
          </div>
        ) : (
          <div className="relative mt-8">
            <div className="overflow-hidden px-1 sm:px-2">
              <ul
                className="flex gap-4 transition-transform duration-700 ease-in-out sm:gap-5"
                style={{
                  transform:
                    n > visible
                      ? `translateX(calc(-${index} * ((100% - ${(visible - 1) * 1.25}rem) / ${visible} + 1.25rem)))`
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
                        visible === 2 &&
                          "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.25rem)/2)]",
                        visible >= 3 &&
                          "w-[calc((100%-2rem)/3)] sm:w-[calc((100%-2.5rem)/3)]",
                      )}
                    >
                      <div className="group relative overflow-hidden rounded-xl bg-na-heket/[0.04] p-2 shadow-na-soft sm:p-2.5">
                        {edit?.ready ? (
                          <button
                            type="button"
                            onClick={() => edit.setSelected("frase", frase.id)}
                            className="absolute right-3 top-3 z-10 rounded-full bg-na-helios p-1.5 text-na-ink shadow"
                            aria-label="Editar frase"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            if (!src) {
                              if (edit?.ready) {
                                edit.setSelected("frase", frase.id);
                              }
                              return;
                            }
                            setLightboxId(frase.id);
                          }}
                          className="relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-na-kefer"
                          aria-label={`Ver frase más grande: ${frase.alt || "Frase del día"}`}
                        >
                          {src ? (
                            <Image
                              src={src}
                              alt={frase.alt || "Frase del día"}
                              fill
                              className="object-contain transition duration-300 group-hover:scale-[1.02]"
                              sizes="(max-width: 640px) 80vw, 280px"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-amber-50 px-3 text-center text-xs font-semibold text-amber-800">
                              Sin imagen — clic en lápiz
                            </div>
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {n > visible ? (
              <div className="mt-5 flex items-center justify-center gap-3">
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

      {lightboxFrase && lightboxSrc ? (
        <FraseLightbox
          frase={lightboxFrase}
          src={lightboxSrc}
          onClose={() => setLightboxId(null)}
        />
      ) : null}
    </section>
  );
}

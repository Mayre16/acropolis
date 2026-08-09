"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImagePlus,
  Pencil,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditHooks";
import { resolveCmsMediaUrl, uploadCmsImage } from "@/lib/cms/api-client";
import { CMS_IMAGE_ACCEPT } from "@/lib/cms/upload-file-validate";
import { shareFraseDelDiaLink } from "@/lib/frases-del-dia-share";
import { useCmsFrasesDelDia } from "@/lib/cms/hooks";
import type { CmsFraseDelDia } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";
import { CarouselDotButton } from "@/components/CarouselDotButton";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo (próx.)",
] as const;

function FraseDaySlot({
  dayIndex,
  dayName,
  frase,
  token,
  onUploaded,
  onEdit,
}: {
  dayIndex: number;
  dayName: string;
  frase: CmsFraseDelDia | null;
  token: string | null;
  onUploaded: (url: string) => void;
  onEdit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const src = frase?.src ? (resolveCmsMediaUrl(frase.src) ?? frase.src) : "";

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("acropolis", token, file, "fraseDelDia");
      onUploaded(url);
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <p className="mb-1.5 text-center text-xs font-bold text-na-heket">
        {dayName}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={CMS_IMAGE_ACCEPT}
        className="sr-only"
        disabled={uploading || !token}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f);
          e.target.value = "";
        }}
      />
      {src ? (
        <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-na-heket/5 shadow-sm">
          <Image
            src={src}
            alt={frase?.alt || `Frase ${dayName}`}
            fill
            className="object-contain"
            sizes="120px"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-full bg-white p-1.5 text-na-ink shadow hover:bg-na-helios"
              title="Cambiar foto"
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full bg-white p-1.5 text-na-ink shadow hover:bg-na-helios"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <span className="text-xs font-semibold text-amber-700">Subiendo…</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !token}
          className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 text-amber-700 transition hover:border-amber-400 hover:bg-amber-100 disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-xs font-semibold">Subiendo…</span>
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Subir</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

function FrasesEditorGrid() {
  const edit = useHomeCmsEdit();
  if (!edit?.ready) return null;

  const frases = edit.frases;
  const paddedFrases: (CmsFraseDelDia | null)[] = DIAS_SEMANA.map(
    (_, i) => frases[i] ?? null
  );

  function handleUploaded(index: number, url: string) {
    edit?.setFraseAtIndex(index, url);
  }

  function handleEdit(index: number) {
    const frase = frases[index];
    if (frase) {
      edit?.setSelected("frase", frase.id);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      <p className="mb-3 text-center text-xs font-semibold text-amber-800">
        Una frase por día — Domingo a Domingo (8 días)
      </p>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {DIAS_SEMANA.map((dayName, i) => (
          <FraseDaySlot
            key={i}
            dayIndex={i}
            dayName={dayName}
            frase={paddedFrases[i]}
            token={edit.token}
            onUploaded={(url) => handleUploaded(i, url)}
            onEdit={() => handleEdit(i)}
          />
        ))}
      </div>
    </div>
  );
}

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
            onClick={() => void shareFraseDelDiaLink(frase.id)}
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
  const [uploadingMany, setUploadingMany] = useState(false);
  const multiFileRef = useRef<HTMLInputElement>(null);
  const withSrc = list.filter((f) => f.src?.trim() || edit?.ready);

  async function onPickFraseFiles(files: FileList | null) {
    if (!files?.length || !edit?.ready) return;
    setUploadingMany(true);
    try {
      await edit.addFrasesFromFiles(files);
    } finally {
      setUploadingMany(false);
    }
  }
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
                Sube una foto por día. Publica para verlas en el sitio.
              </p>
            ) : (
              <p className="mt-1.5 max-w-xl text-sm text-na-muted">
                Toca una frase para verla grande, compartirla o descargarla.
              </p>
            )}
          </div>
        </div>

        {edit?.ready ? (
          <FrasesEditorGrid />
        ) : n === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-10 text-center text-sm text-amber-900">
            Aún no hay frases.
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
                    <CarouselDotButton
                      key={i}
                      size="sm"
                      active={i === index}
                      onClick={() => setIndex(i)}
                      label={`Ir al grupo ${i + 1}`}
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

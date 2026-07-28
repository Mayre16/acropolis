"use client";

import { Pencil, Play } from "lucide-react";
import { useDiplomadoPageDisplay } from "@/lib/cms/diplomado-display";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";

function youtubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  if (match) return `https://www.youtube.com/embed/${match[1]}`;

  return trimmed.includes("youtube.com/embed/") ? trimmed : null;
}

export function DiplomadoTestimonialVideo() {
  const edit = useFilosofiaCmsEdit();
  const page = useDiplomadoPageDisplay();
  const embedUrl = youtubeEmbedUrl(page.testimonialVideoUrl ?? "");

  return (
    <section className="relative -mx-0 bg-white px-4 py-6 lg:px-8 lg:py-8">
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setActiveSection("intro")}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow lg:right-8"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar testimonio
        </button>
      ) : null}

      <div className="mx-auto max-w-3xl overflow-hidden rounded-[1.35rem] border border-[var(--dip-teal)]/12 bg-[var(--dip-panel)] shadow-[0_8px_28px_rgba(17,22,49,0.08)]">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--dip-teal)]">
            {page.testimonialEyebrow}
          </p>
          <p className="mt-2 text-lg font-semibold leading-snug text-[var(--dip-ink)] sm:text-xl">
            {page.testimonialQuote}
          </p>
        </div>

        <div className="relative aspect-video w-full bg-[#0f1a24]">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Testimonio del Diplomado Filosofía para la Vida"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/80">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Play className="h-6 w-6 text-[var(--dip-gold)]" aria-hidden />
              </span>
              <p className="max-w-sm text-sm leading-relaxed">
                Aquí irá un video de quienes han hecho el diplomado. Puedes añadir la URL de
                YouTube desde el editor.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

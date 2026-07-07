"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { CIRCULO_AMIGOS_NA_QUIENES } from "@/lib/circulo-amigos-content";
import { PRINCIPAL_SITE_URL } from "@/lib/site-config";

const NA_LOGO = {
  src: "/brand/logo-nueva-acropolis-stacked.webp",
  alt: "Nueva Acrópolis",
  width: 320,
  height: 80,
} as const;

function renderParagraph(text: string) {
  if (!text.includes("Escuela de Filosofía")) {
    return text;
  }
  const [before, ...rest] = text.split("Escuela de Filosofía");
  const after = rest.join("Escuela de Filosofía");
  return (
    <>
      {before}
      <strong className="text-[#111631]">Escuela de Filosofía</strong>
      {after}
    </>
  );
}

/** Quiénes somos — Qué es Nueva Acrópolis (mismo layout que Civis / Editorial). */
export function CirculoQuienesSomos() {
  const content = CIRCULO_AMIGOS_NA_QUIENES;
  const ctaHref = `${PRINCIPAL_SITE_URL}/que-es`;

  return (
    <section
      className="ca-sec-mist border-b border-[#53a3da]/10 py-14 sm:py-16"
      aria-labelledby="circulo-quienes-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 id="circulo-quienes-title" className="sr-only">
          Quiénes somos — Qué es Nueva Acrópolis
        </h1>

        <div className="rounded-[1.75rem] border border-[#53a3da]/12 bg-white p-6 shadow-[0_10px_30px_rgba(58,154,212,0.1)] sm:p-8 lg:p-10">
          <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-[#f0f8fd] shadow-[0_8px_24px_rgba(58,154,212,0.12)]">
              <Image
                src={content.heroImage.src}
                alt={content.heroImage.alt}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="min-w-0">
              <Image
                src={NA_LOGO.src}
                alt={NA_LOGO.alt}
                width={NA_LOGO.width}
                height={NA_LOGO.height}
                unoptimized
                className="h-auto w-[min(92vw,10.5rem)]"
              />
              <h2 className="mt-4 text-balance text-2xl font-black text-[#111631] sm:mt-5 sm:text-3xl">
                {content.title}
              </h2>
              {content.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 40)}
                  className="mt-4 text-sm leading-relaxed text-[#404245] sm:text-base"
                >
                  {renderParagraph(p)}
                </p>
              ))}

              <p className="mt-8 text-sm font-semibold text-[#111631] sm:text-base">
                {content.ctaIntro}
              </p>
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#53a3da] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#53a3da]/25 transition hover:bg-[#3a9ad4]"
              >
                {content.ctaLabel}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

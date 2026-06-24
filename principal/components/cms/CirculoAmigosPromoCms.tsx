"use client";

import Image from "next/image";
import { ArrowRight, MessageCircle, Pencil, Users } from "lucide-react";
import {
  CIRCULO_AMIGOS_HIGHLIGHTS,
  CIRCULO_AMIGOS_WHATSAPP_MESSAGE,
} from "@/lib/circulo-amigos-content";
import { buildCirculoAmigosMailto } from "@/lib/contact-routing";
import { useWhatsAppUrls } from "@/lib/cms/hooks";
import { INFO_EMAIL } from "@/lib/site-config";
import {
  CIRCULO_AMIGOS_SELECTED_ID,
  useCirculoAmigosCmsEdit,
  useCirculoAmigosDisplay,
} from "@/lib/cms/circulo-amigos-display";

type Props = {
  /** `home` = sección del inicio; `compact` = banda en cursos/cultura. */
  variant?: "home" | "compact";
};

export function CirculoAmigosPromoCms({ variant = "home" }: Props) {
  const edit = useCirculoAmigosCmsEdit();
  const promo = useCirculoAmigosDisplay();
  const whatsapp = useWhatsAppUrls();
  const whatsappHref = `${whatsapp.diplomado}?text=${encodeURIComponent(CIRCULO_AMIGOS_WHATSAPP_MESSAGE)}`;
  const mailtoHref = buildCirculoAmigosMailto().href;

  const editButton = edit?.ready ? (
    <button
      type="button"
      onClick={() => edit.setSelectedId(CIRCULO_AMIGOS_SELECTED_ID)}
      className="absolute right-4 top-0 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow"
    >
      <Pencil className="h-3.5 w-3.5" />
      Editar
    </button>
  ) : null;

  if (variant === "compact") {
    return (
      <section
        id="circulo-amigos-promo"
        className="scroll-mt-24 border-t border-na-heket/10 bg-gradient-to-br from-na-sand/80 via-na-surface to-na-kefer/[0.08] py-12 sm:py-14"
      >
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_min(42%,22rem)]">
          {editButton}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
              {promo.eyebrow}
            </p>
            <h2 className="mt-2 text-balance text-2xl font-black text-na-heketDark sm:text-3xl">
              {promo.title}
            </h2>
            <p className="mt-3 text-sm font-normal leading-relaxed text-na-muted sm:text-base">
              {promo.lede}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-kefer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Quiero saber más
              </a>
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-2 rounded-full border border-na-heket/25 px-5 py-2.5 text-sm font-semibold text-na-heket transition hover:bg-na-heket/5"
              >
                {INFO_EMAIL}
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-na-card">
            <Image
              src={promo.imageSrc}
              alt={promo.imageAlt}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 22rem"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="circulo-amigos-promo"
      className="scroll-mt-24 border-t border-na-heket/10 bg-na-surface py-10 sm:py-11"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {editButton}
        <div className="grid items-center gap-6 lg:grid-cols-[min(38%,17rem)_1fr] lg:gap-8">
          <div className="relative mx-auto aspect-[16/10] w-full max-w-sm overflow-hidden rounded-xl bg-na-heket/5 shadow-na-card lg:mx-0 lg:max-w-none">
            <Image
              src={promo.imageSrc}
              alt={promo.imageAlt}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 20rem, 17rem"
            />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-na-heket shadow-sm">
              <Users className="h-3 w-3" aria-hidden />
              {promo.eyebrow}
            </span>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-na-kefer">
              Círculo de Amigos
            </p>
            <h2 className="mt-2 text-balance text-2xl font-black text-na-heketDark sm:text-[1.65rem]">
              {promo.title}
            </h2>
            <p className="mt-2 text-sm font-normal leading-snug text-na-muted">
              {promo.lede}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {CIRCULO_AMIGOS_HIGHLIGHTS.map((item) => (
                <li
                  key={item.title}
                  className="rounded-lg border border-na-heket/10 bg-na-heket/[0.04] px-3 py-2 text-xs text-na-muted"
                >
                  <span className="font-bold text-na-heketDark">{item.title}</span>
                  {" — "}
                  {item.text}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-kefer"
              >
                Unirme al Círculo de Amigos
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-2 rounded-full border-2 border-na-heket/20 px-5 py-2.5 text-sm font-semibold text-na-heket transition hover:border-na-heket/40"
              >
                Escribir por correo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

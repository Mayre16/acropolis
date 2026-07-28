"use client";

import { ArrowRight, Clock, Pencil, User } from "lucide-react";
import { useCursosCmsEdit } from "@/components/cms/CursosCmsEditContext";
import {
  CURSOS_INSCRIBE_SECTION_ID,
  DEFAULT_CURSOS_INSCRIBE,
} from "@/lib/cms/cursos-display";
import { useWhatsAppUrls } from "@/lib/cms/hooks";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import { buildWhatsAppHref } from "@/lib/cms/site-footer-edit";
import {
  accentEyebrowClass,
  accentInfoCardClass,
  accentTokens,
} from "@/lib/brand-accents";

const DATOS = [
  {
    icon: Clock,
    label: "Modalidad",
    value: "Talleres presenciales, por temporadas",
  },
  {
    icon: User,
    label: "Dirigido a",
    value: "Abierto al público; sin requisitos previos",
  },
] as const;

function mergeInscribeCopy(page?: {
  inscribeTitle?: string;
  inscribeText?: string;
  inscribeCtaLabel?: string;
  inscribeWhatsappNumber?: string;
  inscribeWhatsappMessage?: string;
}) {
  return {
    title: page?.inscribeTitle?.trim() || DEFAULT_CURSOS_INSCRIBE.title,
    text: page?.inscribeText?.trim() || DEFAULT_CURSOS_INSCRIBE.text,
    ctaLabel: page?.inscribeCtaLabel?.trim() || DEFAULT_CURSOS_INSCRIBE.ctaLabel,
    whatsappNumber:
      page?.inscribeWhatsappNumber?.trim() ||
      DEFAULT_CURSOS_INSCRIBE.whatsappNumber,
    whatsappMessage:
      page?.inscribeWhatsappMessage?.trim() ||
      DEFAULT_CURSOS_INSCRIBE.whatsappMessage,
  };
}

export function CursosInscribeSection() {
  const edit = useCursosCmsEdit();
  const cms = useCmsDocument();
  const whatsapp = useWhatsAppUrls();
  const page =
    edit?.ready ? edit.page : isCmsEnabled() ? cms?.sections.cursosPage : null;
  const copy = mergeInscribeCopy(page ?? undefined);
  const href = buildWhatsAppHref(
    copy.whatsappNumber,
    copy.whatsappMessage,
    whatsapp.cursos,
  );

  return (
    <section className="border-t border-na-heket/10 bg-gradient-to-b from-na-heket/[0.05] via-na-surface to-na-amon/[0.04] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className={accentEyebrowClass(1)}>Información práctica</p>
        <h2 className="mt-2 text-2xl font-black text-na-heketDark sm:text-3xl">
          Antes de inscribirte
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {DATOS.map(({ icon: Icon, label, value }, i) => {
            const a = accentTokens(i);
            return (
              <div key={label} className={accentInfoCardClass(i)}>
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${a.iconBox}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <p
                  className={`mt-4 text-xs font-black uppercase tracking-[0.18em] ${a.eyebrow}`}
                >
                  {label}
                </p>
                <p className="mt-2 whitespace-pre-line text-base font-bold leading-snug text-na-heketDark">
                  {value}
                </p>
              </div>
            );
          })}
        </div>
        <div className="relative mt-8 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 text-center shadow-na-card sm:p-12">
          {edit?.ready ? (
            <button
              type="button"
              onClick={() => edit.setSelectedId(CURSOS_INSCRIBE_SECTION_ID)}
              className="absolute right-4 top-4 rounded-full bg-na-helios p-2 text-na-ink shadow"
              aria-label="Editar bloque de inscripción"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <h2 className="text-balance text-2xl font-black text-white sm:text-3xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{copy.text}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105"
          >
            {copy.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

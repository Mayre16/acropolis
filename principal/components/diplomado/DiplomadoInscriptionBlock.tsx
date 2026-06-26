"use client";

import { ArrowRight, Pencil } from "lucide-react";
import { useDiplomadoInscriptionDisplay } from "@/lib/cms/diplomado-display";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import { useWhatsAppUrls } from "@/lib/cms/hooks";
import { buildWhatsAppHref } from "@/lib/cms/site-footer-edit";

export function DiplomadoInscriptionBlock() {
  const edit = useFilosofiaCmsEdit();
  const ins = useDiplomadoInscriptionDisplay();
  const whatsapp = useWhatsAppUrls();
  const inscribeHref = buildWhatsAppHref(
    ins.inscribeWhatsappNumber,
    ins.inscribeWhatsApp,
    whatsapp.diplomado,
  );

  return (
    <section
      id="inscripcion"
      className="relative scroll-mt-20 bg-white px-4 py-10 text-[var(--dip-ink)] lg:px-8 lg:py-14"
    >
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setActiveSection("inscripcion")}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase text-white shadow lg:right-8"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar inscripción
        </button>
      ) : null}

      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--dip-teal)]">
        {ins.eyebrow}
      </p>
      <h2 className="mt-2 text-[2.1rem] font-extrabold leading-[1.08] tracking-tight">
        {ins.title}
      </h2>
      <p className="mt-4 inline-flex rounded-full border border-[var(--dip-teal)]/25 bg-[var(--dip-teal)]/8 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--dip-teal)]">
        {ins.capacityNote}
      </p>
      <p className="mt-4 max-w-2xl text-[17px] font-normal leading-relaxed text-[#262d38]">
        {ins.intro}
      </p>

      <a
        href={inscribeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto mt-8 flex w-full max-w-[300px] items-center justify-center gap-2 rounded-full bg-[var(--dip-gold)] px-6 py-3.5 text-sm font-bold text-[#1a1a18] transition hover:brightness-105"
      >
        Quiero inscribirme
        <ArrowRight className="h-4 w-4" />
      </a>
    </section>
  );
}

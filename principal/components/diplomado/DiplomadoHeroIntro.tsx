"use client";

import { ArrowRight, Pencil } from "lucide-react";
import { useDiplomadoInscriptionDisplay, useDiplomadoPageDisplay } from "@/lib/cms/diplomado-display";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import { useWhatsAppUrls } from "@/lib/cms/hooks";

export function DiplomadoHeroIntro() {
  const edit = useFilosofiaCmsEdit();
  const page = useDiplomadoPageDisplay();
  const inscription = useDiplomadoInscriptionDisplay();
  const whatsapp = useWhatsAppUrls();
  const inscribeHref = `${whatsapp.diplomado}?text=${encodeURIComponent(
    inscription.inscribeWhatsApp ?? "",
  )}`;

  return (
    <div id="diplomado-hero-copy" className="relative">
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setActiveSection("intro")}
          className="absolute -right-1 -top-8 z-20 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase text-white shadow"
        >
          <Pencil className="h-3 w-3" />
          Editar
        </button>
      ) : null}
      <h2 className="mx-auto mt-4 max-w-[300px] text-[15px] font-normal leading-relaxed text-white/82 lg:mx-0 lg:max-w-md lg:text-base">
        {page.heroLede}
      </h2>
      <a
        href={inscribeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto mt-6 flex w-full max-w-[300px] items-center justify-center gap-2 rounded-full bg-[var(--dip-gold)] px-6 py-3.5 text-[15px] font-bold text-[#1a1a18] shadow-lg shadow-black/25 transition hover:brightness-105 lg:mx-0 lg:max-w-[280px]"
      >
        Quiero inscribirme
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

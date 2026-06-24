"use client";

import { ArrowRight } from "lucide-react";
import { useWhatsAppUrls } from "@/lib/cms/hooks";

const MESSAGE =
  "Hola, me interesan los cursos y talleres de Nueva Acrópolis. ¿Me dan información de las próximas convocatorias?";

export function CursosInscribeCta() {
  const whatsapp = useWhatsAppUrls();
  const href = `${whatsapp.cursos}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105"
    >
      Quiero más información
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

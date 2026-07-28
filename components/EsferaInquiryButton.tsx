"use client";

import { ArrowRight } from "lucide-react";
import { InquiryMailForm } from "@/components/InquiryMailForm";
import { buildEsferaInfoMailto } from "@/lib/contact-routing";

type EsferaInquiryButtonProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  taller?: string;
  date?: string;
  time?: string;
  sede?: string;
};

const DEFAULT_TRIGGER_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer";

/** Consulta por correo al equipo de Punto Focal Esfera. */
export function EsferaInquiryButton({
  triggerLabel = "Solicitar info",
  triggerClassName = DEFAULT_TRIGGER_CLASS,
  taller,
  date,
  time,
  sede,
}: EsferaInquiryButtonProps) {
  const contextLines = [
    ...(taller ? [`Taller: «${taller}»`] : []),
    ...(date ? [`Fecha: ${date}`] : []),
    ...(time ? [`Hora: ${time}`] : []),
    ...(sede ? [`Sede: ${sede}`] : []),
  ];

  return (
    <InquiryMailForm
      formKey="esfera_info"
      triggerLabel={triggerLabel}
      triggerIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
      triggerIconAfter
      triggerClassName={triggerClassName}
      modalTitle="Solicitar información"
      modalIntro="Completa tus datos, escribe tu pregunta y enviaremos tu consulta por correo al equipo de Punto Focal Esfera."
      contextLines={
        contextLines.length
          ? contextLines
          : ["Consulta general sobre Punto Focal Esfera."]
      }
      buildMailto={(base) =>
        buildEsferaInfoMailto({ ...base, taller, date, time, sede })
      }
    />
  );
}

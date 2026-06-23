"use client";

import { ArrowRight } from "lucide-react";
import { InquiryMailForm } from "@/components/InquiryMailForm";
import { buildViajeInfoMailto } from "@/lib/contact-routing";

type ViajeInquiryButtonProps = {
  title: string;
  location?: string;
  proximaFecha?: string;
  label?: string;
  className?: string;
};

/** Consulta de viajes culturales → info.oinadom@acropolis.org */
export function ViajeInquiryButton({
  title,
  location,
  proximaFecha,
  label = "Solicitar info",
  className = "inline-flex w-fit items-center gap-1.5 rounded-full bg-na-kefer px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105",
}: ViajeInquiryButtonProps) {
  const contextLines = [
    `«${title}»`,
    ...(location ? [`Destino: ${location}`] : []),
    ...(proximaFecha ? [`Próxima salida: ${proximaFecha}`] : []),
  ];

  return (
    <InquiryMailForm
      formKey="viaje_info"
      triggerLabel={label}
      triggerIcon={<ArrowRight className="h-3.5 w-3.5" aria-hidden />}
      triggerIconAfter
      triggerClassName={className}
      modalTitle="Solicitar información"
      modalIntro="Completa tus datos y enviaremos tu consulta sobre este viaje cultural a info.oinadom@acropolis.org."
      contextLines={contextLines}
      buildMailto={(base) =>
        buildViajeInfoMailto({
          ...base,
          viaje: title,
          location,
          proximaFecha,
        })
      }
    />
  );
}

"use client";

import { InquiryMailForm } from "@/components/InquiryMailForm";
import { buildSalonInquiryMailto } from "@/lib/contact-routing";

type SalonInquiryButtonProps = {
  className?: string;
  salon?: string;
  sede?: string;
  triggerLabel?: string;
};

/** Consulta de alquiler de salones → cursos.oinadom@acropolis.org */
export function SalonInquiryButton({
  className,
  salon,
  sede,
  triggerLabel = "Consultar disponibilidad y tarifas",
}: SalonInquiryButtonProps) {
  const contextLines = [
    ...(salon ? [`Salón: ${salon}`] : []),
    ...(sede ? [`Sede: ${sede}`] : []),
  ];

  return (
    <InquiryMailForm
      formKey="salon_inquiry"
      triggerLabel={triggerLabel}
      triggerClassName={className}
      modalTitle="Consultar salones"
      modalIntro="Tu mensaje llegará al equipo de cursos con la consulta sobre disponibilidad y tarifas de alquiler."
      contextLines={contextLines.length > 0 ? contextLines : undefined}
      buildMailto={(base) =>
        buildSalonInquiryMailto({
          ...base,
          salon,
          sede,
        })
      }
    />
  );
}

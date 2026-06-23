"use client";

import { InquiryMailForm } from "@/components/InquiryMailForm";
import {
  buildEsferaCollaborateMailto,
  type EsferaCollaborateKind,
} from "@/lib/contact-routing";

type EsferaCollaborateInquiryProps = {
  kind: EsferaCollaborateKind;
  triggerLabel: string;
  triggerClassName?: string;
};

export function EsferaCollaborateInquiry({
  kind,
  triggerLabel,
  triggerClassName,
}: EsferaCollaborateInquiryProps) {
  const modalTitle = kind === "donar" ? "Quiero donar" : "Proponer alianza";
  const contextLines =
    kind === "donar"
      ? ["Donación para proyectos de Punto Focal Esfera."]
      : ["Alianza institucional con Punto Focal Esfera."];

  return (
    <InquiryMailForm
      formKey={kind === "donar" ? "esfera_donar" : "esfera_alianzas"}
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
      modalTitle={modalTitle}
      modalIntro="Completa tus datos y enviaremos tu solicitud al equipo de Punto Focal Esfera."
      contextLines={contextLines}
      buildMailto={(base) => buildEsferaCollaborateMailto(kind, base)}
    />
  );
}

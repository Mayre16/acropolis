"use client";

import { ArrowRight } from "lucide-react";
import { InquiryMailForm } from "@/components/InquiryMailForm";
import { buildCirculoAmigosInscriptionMailto } from "@/lib/contact-routing";
import { CIRCULO_AMIGOS_INSCRIPTION_DEFAULT_MESSAGE } from "@/lib/circulo-amigos-content";

type CirculoAmigosInquiryButtonProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  variant?: "default" | "landing";
};

const DEFAULT_TRIGGER_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/25 transition hover:bg-na-kefer";

const LANDING_TRIGGER_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ca-brand)] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[var(--ca-brand)]/30 transition hover:bg-[var(--ca-brand-dark)]";

/** Inscripción al Círculo de Amigos — formulario con envío por correo. */
export function CirculoAmigosInquiryButton({
  triggerLabel = "Inscríbete",
  triggerClassName,
  variant = "default",
}: CirculoAmigosInquiryButtonProps) {
  const buttonClass =
    triggerClassName ??
    (variant === "landing" ? LANDING_TRIGGER_CLASS : DEFAULT_TRIGGER_CLASS);
  return (
    <InquiryMailForm
      formKey="circulo_amigos_inscription"
      triggerLabel={triggerLabel}
      triggerIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
      triggerIconAfter
      triggerClassName={buttonClass}
      modalTitle="Inscripción — Círculo de Amigos"
      modalIntro="Completa tus datos. Es posible que te contactemos para una entrevista breve y conocer tus intereses y motivaciones."
      contextLines={[
        "Paso 1 del proceso de unión al Círculo de Amigos OINADOM.",
      ]}
      defaultMensaje={CIRCULO_AMIGOS_INSCRIPTION_DEFAULT_MESSAGE}
      buildMailto={buildCirculoAmigosInscriptionMailto}
    />
  );
}

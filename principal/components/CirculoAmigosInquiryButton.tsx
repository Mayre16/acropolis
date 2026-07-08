"use client";

import { ArrowRight } from "lucide-react";
import {
  CirculoAmigosInscriptionForm,
  DEFAULT_TRIGGER_CLASS,
  LANDING_TRIGGER_CLASS,
} from "@/components/CirculoAmigosInscriptionForm";
import {
  dispatchCirculoInscripcionOpen,
  useCirculoInscripcionHost,
} from "@/components/circulo-amigos/CirculoInscripcionProvider";

type CirculoAmigosInquiryButtonProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  variant?: "default" | "landing";
};

/** Inscripción al Círculo de Amigos — abre el modal compartido en rutas /circulo-de-amigos. */
export function CirculoAmigosInquiryButton({
  triggerLabel = "Inscríbete",
  triggerClassName,
  variant = "default",
}: CirculoAmigosInquiryButtonProps) {
  const hasHost = useCirculoInscripcionHost();
  const isLanding = variant === "landing";
  const buttonClass =
    triggerClassName ?? (isLanding ? LANDING_TRIGGER_CLASS : DEFAULT_TRIGGER_CLASS);

  if (!hasHost) {
    return (
      <CirculoAmigosInscriptionForm
        triggerLabel={triggerLabel}
        triggerClassName={triggerClassName}
        variant={variant}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => dispatchCirculoInscripcionOpen()}
      className={buttonClass}
    >
      {triggerLabel}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );
}

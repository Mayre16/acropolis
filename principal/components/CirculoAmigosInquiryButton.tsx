"use client";

import { CirculoAmigosInscriptionForm } from "@/components/CirculoAmigosInscriptionForm";

type CirculoAmigosInquiryButtonProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  variant?: "default" | "landing";
};

/** Inscripción al Círculo de Amigos — formulario completo con envío por correo. */
export function CirculoAmigosInquiryButton({
  triggerLabel = "Inscríbete",
  triggerClassName,
  variant = "default",
}: CirculoAmigosInquiryButtonProps) {
  return (
    <CirculoAmigosInscriptionForm
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
      variant={variant}
    />
  );
}

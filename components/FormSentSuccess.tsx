"use client";

import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

export function FormSentSuccess({
  title = "Correo enviado",
  message,
  onReset,
  resetLabel = "Enviar otra solicitud",
}: {
  title?: string;
  message: ReactNode;
  onReset: () => void;
  resetLabel?: string;
}) {
  return (
    <div className="text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-na-heket" />
      <h3 className="mt-4 text-xl font-black text-na-heketDark">{title}</h3>
      <p className="mt-2 text-sm text-na-muted">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-sm font-semibold text-na-heket underline-offset-2 hover:underline"
      >
        {resetLabel}
      </button>
    </div>
  );
}

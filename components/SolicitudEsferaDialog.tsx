"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { SolicitudEsferaForm } from "@/components/SolicitudEsferaForm";

type SolicitudEsferaModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SolicitudEsferaModal({ open, onClose }: SolicitudEsferaModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-na-ink/70 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="esfera-solicitud-title"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-3xl sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-na-surface text-na-heketDark shadow-md transition hover:bg-na-heket/10 sm:right-4 sm:top-4"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="rounded-[1.5rem] border border-na-heket/12 bg-na-surface p-5 shadow-na-card sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-na-kefer">
            Punto Focal Esfera
          </p>
          <h2
            id="esfera-solicitud-title"
            className="mt-2 pr-10 text-xl font-black text-na-heketDark sm:text-2xl"
          >
            Solicitud de taller Esfera
          </h2>
          <p className="mt-2 text-sm text-na-muted">
            Indique la organización, los talleres de interés, el tipo de jornada y el
            tamaño del grupo (hasta 25 personas).
          </p>
          <div className="mt-6">
            <SolicitudEsferaForm embedded onCancel={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

type SolicitudEsferaDialogProps = {
  triggerLabel: string;
  triggerClassName?: string;
};

export function SolicitudEsferaDialog({
  triggerLabel,
  triggerClassName = "inline-flex justify-center rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-kefer",
}: SolicitudEsferaDialogProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
      <SolicitudEsferaModal open={open} onClose={close} />
    </>
  );
}

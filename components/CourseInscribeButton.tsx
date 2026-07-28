"use client";

import { ArrowRight } from "lucide-react";
import { accentTokens } from "@/lib/brand-accents";
import { buildWhatsAppHref } from "@/lib/cms/site-footer-edit";
import { buildInscribeMessage, type InscribeActivity } from "@/lib/whatsapp-messages";
import { useWhatsAppUrls } from "@/lib/cms/hooks";

type Props = InscribeActivity & {
  accentIndex?: number;
  label?: string;
  className?: string;
  /** Vacío = número de cursos del pie de página (CMS global). */
  whatsappNumber?: string;
  /** Vacío = mensaje generado según título, tipo y sede. */
  whatsappMessage?: string;
};

/** Abre WhatsApp con el curso/taller preseleccionado. */
export function CourseInscribeButton({
  title,
  kind = "curso",
  sede,
  facilitador,
  accentIndex = 0,
  label = "Solicitar info",
  className = "",
  whatsappNumber,
  whatsappMessage,
}: Props) {
  const a = accentTokens(accentIndex);
  const whatsapp = useWhatsAppUrls();
  const href = buildWhatsAppHref(
    whatsappNumber,
    whatsappMessage?.trim() ||
      buildInscribeMessage({ title, kind, sede, facilitador }),
    whatsapp.cursos,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm transition hover:brightness-105 ${a.badge} ${className}`}
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

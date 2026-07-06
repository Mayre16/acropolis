"use client";

import { CalendarDays } from "lucide-react";
import { EsferaInquiryButton } from "@/components/EsferaInquiryButton";
import { AGENDA_EMPTY_STATE } from "@/lib/agenda";
import { cn } from "@/lib/utils/cn";

type AgendaProximamenteEmptyProps = {
  title?: string;
  text?: string;
  className?: string;
  /** `esfera` = correo Punto Focal; `whatsapp` = enlace WA; `none` = solo texto. */
  contact?: "esfera" | "whatsapp" | "none";
  whatsappHref?: string | null;
  whatsappLabel?: string;
  esferaTriggerLabel?: string;
};

export function AgendaProximamenteEmpty({
  title = AGENDA_EMPTY_STATE.title,
  text = AGENDA_EMPTY_STATE.text,
  className,
  contact = "whatsapp",
  whatsappHref,
  whatsappLabel = AGENDA_EMPTY_STATE.whatsappLabel,
  esferaTriggerLabel = AGENDA_EMPTY_STATE.esferaLabel,
}: AgendaProximamenteEmptyProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-dashed border-na-heket/20 bg-gradient-to-br from-na-heket/[0.04] via-na-surface to-na-kefer/[0.06] px-6 py-10 text-center shadow-na-soft sm:px-10 sm:py-12",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-na-heket/10 text-na-heket">
        <CalendarDays className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-5 text-2xl font-black text-na-heketDark">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-na-muted">
        {text}
      </p>
      {contact === "esfera" ? (
        <div className="mt-7 flex justify-center">
          <EsferaInquiryButton triggerLabel={esferaTriggerLabel} />
        </div>
      ) : contact === "whatsapp" && whatsappHref ? (
        <div className="mt-7 flex justify-center">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-kefer"
          >
            {whatsappLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}

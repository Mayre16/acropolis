"use client";

import { EditField } from "@/components/cms/CmsEditFields";
import { AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";
import type { CmsEsferaPage } from "@/lib/cms/types";

export function EsferaLogoEditFields({
  page,
  token,
  onChange,
}: {
  page: Pick<
    CmsEsferaPage,
    "esferaLogoSrc" | "esferaLogoWhiteSrc" | "esferaLogoAlt"
  >;
  token: string | null;
  onChange: (patch: Partial<CmsEsferaPage>) => void;
}) {
  return (
    <div className="space-y-4 border-b border-slate-100 pb-4">
      <p className="text-sm font-semibold text-slate-800">Logo Esfera</p>
      <p className="text-xs leading-relaxed text-slate-600">
        Aparece en el encabezado de esta página, en el bloque Esfera del inicio y
        en el cuadro lateral de Estándares.
      </p>
      <AgendaEntryImageField
        label="Logo (color)"
        site="acropolis"
        image={page.esferaLogoSrc ?? ""}
        imageAlt={page.esferaLogoAlt ?? ""}
        token={token}
        onChange={(patch) =>
          onChange({
            ...(patch.image !== undefined ? { esferaLogoSrc: patch.image } : {}),
            ...(patch.imageAlt !== undefined
              ? { esferaLogoAlt: patch.imageAlt }
              : {}),
          })
        }
      />
      <AgendaEntryImageField
        label="Logo (blanco — encabezado y fondos oscuros)"
        site="acropolis"
        image={page.esferaLogoWhiteSrc ?? ""}
        imageAlt={page.esferaLogoAlt ?? ""}
        token={token}
        onChange={(patch) =>
          onChange({
            ...(patch.image !== undefined
              ? { esferaLogoWhiteSrc: patch.image }
              : {}),
          })
        }
      />
      <EditField
        label="Texto alternativo del logo"
        value={page.esferaLogoAlt ?? ""}
        onChange={(v) => onChange({ esferaLogoAlt: v })}
      />
    </div>
  );
}

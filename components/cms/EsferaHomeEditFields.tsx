"use client";

import { EditField } from "@/components/cms/CmsEditFields";
import { EsferaLogoEditFields } from "@/components/cms/EsferaLogoEditFields";
import type { CmsEsferaHomePromo, CmsEsferaPage } from "@/lib/cms/types";

export type EsferaHomeLogoFields = Pick<
  CmsEsferaPage,
  "esferaLogoSrc" | "esferaLogoWhiteSrc" | "esferaLogoAlt"
>;

export function EsferaHomeEditFields({
  value,
  logo,
  token,
  onChange,
  onLogoChange,
}: {
  value: CmsEsferaHomePromo;
  logo: EsferaHomeLogoFields;
  token: string | null;
  onChange: (patch: Partial<CmsEsferaHomePromo>) => void;
  onLogoChange: (patch: Partial<EsferaHomeLogoFields>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
        Este bloque aparece en el <strong>inicio</strong>. El logo de la
        izquierda es el mismo que en la página Esfera y en Estándares.
      </p>
      <EsferaLogoEditFields
        page={logo}
        token={token}
        onChange={onLogoChange}
      />
      <EditField
        label="Etiqueta superior"
        value={value.homeEyebrow ?? ""}
        onChange={(v) => onChange({ homeEyebrow: v })}
      />
      <EditField
        label="Título"
        value={value.homeTitle ?? ""}
        onChange={(v) => onChange({ homeTitle: v })}
      />
      <EditField
        label="Párrafo principal"
        value={value.homeIntro ?? ""}
        onChange={(v) => onChange({ homeIntro: v })}
        multiline
      />
      <EditField
        label="Párrafo complementario"
        value={value.homeDetail ?? ""}
        onChange={(v) => onChange({ homeDetail: v })}
        multiline
      />
      <EditField
        label="Texto del botón"
        value={value.homeCtaLabel ?? ""}
        onChange={(v) => onChange({ homeCtaLabel: v })}
      />
    </div>
  );
}

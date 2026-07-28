"use client";

import { EditField } from "@/components/cms/CmsEditFields";
import { AgendaEntryImageField } from "@/components/cms/AgendaEntryEditFields";
import type { CmsCirculoAmigosPromo } from "@/lib/cms/types";

export function CirculoAmigosEditFields({
  value,
  token,
  onChange,
}: {
  value: CmsCirculoAmigosPromo;
  token: string | null;
  onChange: (patch: Partial<CmsCirculoAmigosPromo>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
        Este bloque se comparte en <strong>Cursos</strong>, <strong>Cultura</strong> e{" "}
        <strong>Inicio</strong> (mismo texto e imagen).
      </p>
      <EditField
        label="Etiqueta superior"
        value={value.eyebrow ?? ""}
        onChange={(v) => onChange({ eyebrow: v })}
      />
      <EditField
        label="Título"
        value={value.title ?? ""}
        onChange={(v) => onChange({ title: v })}
      />
      <EditField
        label="Texto"
        value={value.lede ?? ""}
        onChange={(v) => onChange({ lede: v })}
        multiline
      />
      <AgendaEntryImageField
        label="Foto"
        site="acropolis"
        image={value.imageSrc ?? ""}
        imageAlt={value.imageAlt ?? ""}
        token={token}
        onChange={(patch) =>
          onChange({
            ...(patch.image !== undefined ? { imageSrc: patch.image } : {}),
            ...(patch.imageAlt !== undefined ? { imageAlt: patch.imageAlt } : {}),
          })
        }
      />
    </div>
  );
}

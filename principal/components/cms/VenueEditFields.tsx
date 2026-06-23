"use client";

import type { CmsVenue } from "@/lib/cms/types";
import { EditField } from "@/components/cms/CmsEditFields";

export function VenueEditFields({
  venue,
  onChange,
  onHide,
}: {
  venue: CmsVenue;
  onChange: (patch: Partial<CmsVenue>) => void;
  onHide?: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
        Los cambios se reflejan en <strong>Dónde estamos</strong>,{" "}
        <strong>Esfera</strong> y <strong>Voluntariado</strong>.
      </p>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-700">Tipo</span>
        <select
          value={venue.kind}
          onChange={(e) =>
            onChange({ kind: e.target.value as CmsVenue["kind"] })
          }
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
        >
          <option value="sede">Sede</option>
          <option value="centro-cultural">Punto cultural</option>
        </select>
      </label>
      <EditField
        label="Nombre"
        value={venue.name}
        onChange={(v) => onChange({ name: v })}
      />
      <p className="-mt-2 text-xs text-slate-500">
        Sin «Sede» ni «Punto cultural» — la etiqueta de tipo lo indica arriba.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <EditField
          label="Ciudad"
          value={venue.city}
          onChange={(v) => onChange({ city: v })}
        />
        <EditField
          label="Zona / barrio"
          value={venue.zone}
          onChange={(v) => onChange({ zone: v })}
        />
      </div>
      <EditField
        label="Dirección"
        value={venue.address}
        onChange={(v) => onChange({ address: v })}
      />
      <EditField
        label="Referencia (cómo llegar)"
        value={venue.reference ?? ""}
        onChange={(v) => onChange({ reference: v })}
        multiline
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <EditField
          label="Teléfono"
          value={venue.phone ?? ""}
          onChange={(v) => onChange({ phone: v })}
        />
        <EditField
          label="Correo"
          value={venue.email ?? ""}
          onChange={(v) => onChange({ email: v })}
        />
      </div>
      <EditField
        label="Búsqueda en Google Maps"
        value={venue.mapsQuery}
        onChange={(v) => onChange({ mapsQuery: v })}
      />
      <EditField
        label="Nota breve"
        value={venue.note ?? ""}
        onChange={(v) => onChange({ note: v })}
        multiline
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <EditField
          label="Mapa X (opcional)"
          value={venue.mapX != null ? String(venue.mapX) : ""}
          onChange={(v) =>
            onChange({ mapX: v.trim() ? Number(v) : undefined })
          }
        />
        <EditField
          label="Mapa Y (opcional)"
          value={venue.mapY != null ? String(venue.mapY) : ""}
          onChange={(v) =>
            onChange({ mapY: v.trim() ? Number(v) : undefined })
          }
        />
      </div>
      {venue.mapsQuery ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapsQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-semibold text-na-kefer hover:underline"
        >
          Probar en Google Maps ↗
        </a>
      ) : null}
      {onHide ? (
        <button
          type="button"
          onClick={onHide}
          className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
        >
          Ocultar del sitio
        </button>
      ) : null}
    </div>
  );
}

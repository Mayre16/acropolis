"use client";

import type { CmsVenue } from "@/lib/cms/types";
import { venueDisplayName } from "@/lib/locations";
import { EditField } from "@/components/cms/CmsEditFields";
import { VenueMapPicker } from "@/components/cms/VenueMapPicker";
import {
  latLonToDrMapSvg,
  looksLikeGpsNotSvg,
  parseLatLonFromMapsInput,
} from "@/lib/map-coords";

export function VenueEditFields({
  venue,
  onChange,
  onHide,
  cityHasSede = false,
}: {
  venue: CmsVenue;
  onChange: (patch: Partial<CmsVenue>) => void;
  onHide?: () => void;
  /** Ciudad con al menos una sede (afecta si el punto cultural entra al mapa). */
  cityHasSede?: boolean;
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
      <div className="rounded-lg border border-slate-200 p-3 space-y-3">
        <p className="text-xs font-semibold text-slate-700">Ubicación en el mapa del sitio</p>
        {venue.kind === "sede" && cityHasSede ? (
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
            Hay más de una sede en esta ciudad. Cada una necesita su propio pin
            (clic en el mapa o coordenadas X/Y) para aparecer en el mapa del
            sitio.
          </p>
        ) : venue.kind === "centro-cultural" && cityHasSede ? (
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
            Esta ciudad ya tiene sede en el mapa. El punto cultural{" "}
            <strong>no se mostrará</strong> hasta que coloque el pin abajo (clic
            en el mapa o coordenadas X/Y).
          </p>
        ) : venue.kind === "centro-cultural" ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
            Sin pin manual, se usará la ubicación por defecto de la ciudad si
            existe.
          </p>
        ) : null}
        {looksLikeGpsNotSvg(venue.mapX, venue.mapY) ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
            X/Y parecen coordenadas de Google (lat/lon), no del dibujo del mapa.
            Use el botón «Desde Google Maps» o haga clic en el mapa.
          </p>
        ) : null}
        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={venue.mapHideLabel === true}
            onChange={(e) => onChange({ mapHideLabel: e.target.checked })}
            className="mt-0.5 rounded border-slate-300"
          />
          <span>
            Solo mostrar el punto en el mapa (sin el nombre de la ciudad)
          </span>
        </label>
        <VenueMapPicker
          mapX={venue.mapX}
          mapY={venue.mapY}
          label={venueDisplayName(venue.name, venue.kind)}
          hideLabel={venue.mapHideLabel}
          onPick={(x, y) => onChange({ mapX: x, mapY: y })}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <EditField
            label="Mapa X (SVG 0–1000)"
            value={venue.mapX != null ? String(venue.mapX) : ""}
            onChange={(v) =>
              onChange({ mapX: v.trim() ? Number(v) : undefined })
            }
          />
          <EditField
            label="Mapa Y (SVG 0–686)"
            value={venue.mapY != null ? String(venue.mapY) : ""}
            onChange={(v) =>
              onChange({ mapY: v.trim() ? Number(v) : undefined })
            }
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const gps = parseLatLonFromMapsInput(venue.mapsQuery);
            if (!gps) {
              window.alert(
                "No se encontraron coordenadas en el campo de Google Maps. Pegue un enlace con @lat,lon o lat,lon.",
              );
              return;
            }
            const { x, y } = latLonToDrMapSvg(gps.lat, gps.lon);
            onChange({ mapX: x, mapY: y });
          }}
          className="w-full rounded-lg border border-na-heket/20 py-2 text-sm font-semibold text-na-heketDark"
        >
          Calcular pin desde Google Maps
        </button>
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

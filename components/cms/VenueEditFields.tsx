"use client";

import type { CmsVenue } from "@/lib/cms/types";
import { mapsUrl, venueDisplayName } from "@/lib/locations";
import { EditField } from "@/components/cms/CmsEditFields";
import { VenueMapPicker } from "@/components/cms/VenueMapPicker";
import {
  isGoogleMapsUrl,
  latLonToDrMapSvg,
  looksLikeGpsNotSvg,
  parseLatLonFromMapsInput,
} from "@/lib/map-coords";

function applyMapsField(
  value: string,
  onChange: (patch: Partial<CmsVenue>) => void,
) {
  const patch: Partial<CmsVenue> = { mapsQuery: value };
  const gps = parseLatLonFromMapsInput(value);
  if (gps) {
    const { x, y } = latLonToDrMapSvg(gps.lat, gps.lon);
    patch.mapX = x;
    patch.mapY = y;
  }
  onChange(patch);
}

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
        label="Enlace o búsqueda de Google Maps"
        value={venue.mapsQuery}
        onChange={(v) => applyMapsField(v, onChange)}
        multiline
      />
      <p className="-mt-2 text-xs text-slate-500">
        Pegue el enlace de Google Maps y use «Probar» / guarde / publique. Eso
        basta para el botón del sitio. El pin del dibujo RD es aparte: clic en
        el mapa abajo, o un enlace largo con{" "}
        <code className="rounded bg-slate-100 px-1">@18.…,-69.…</code> (no el
        corto maps.app.goo.gl).
      </p>
      {isGoogleMapsUrl(venue.mapsQuery) ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-950">
          Enlace de Google Maps detectado — «Probar» y el sitio abrirán esta
          URL. No hace falta «Calcular pin» para eso.
        </p>
      ) : null}
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
            value={
              venue.mapX != null && Number.isFinite(venue.mapX)
                ? String(venue.mapX)
                : ""
            }
            onChange={(v) => {
              const n = Number(v.trim());
              onChange({
                mapX: v.trim() && Number.isFinite(n) ? n : undefined,
              });
            }}
          />
          <EditField
            label="Mapa Y (SVG 0–686)"
            value={
              venue.mapY != null && Number.isFinite(venue.mapY)
                ? String(venue.mapY)
                : ""
            }
            onChange={(v) => {
              const n = Number(v.trim());
              onChange({
                mapY: v.trim() && Number.isFinite(n) ? n : undefined,
              });
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const gps = parseLatLonFromMapsInput(venue.mapsQuery);
            if (!gps) {
              window.alert(
                "Ese enlace no trae coordenadas (@lat,lon).\n\n" +
                  "Para el botón de Google Maps: basta pegar el enlace, «Probar», Guardar y Publicar.\n\n" +
                  "Para el pin del mapa RD: haga clic en el dibujo, o abra el sitio en Google Maps y copie la URL larga de la barra (con @18.…,-69.…), no el link corto.",
              );
              return;
            }
            const { x, y } = latLonToDrMapSvg(gps.lat, gps.lon);
            onChange({ mapX: x, mapY: y });
          }}
          className="w-full rounded-lg border border-na-heket/20 py-2 text-sm font-semibold text-na-heketDark"
        >
          Calcular pin del mapa RD (opcional)
        </button>
      </div>
      {venue.mapsQuery ? (
        <a
          href={mapsUrl(venue.mapsQuery)}
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

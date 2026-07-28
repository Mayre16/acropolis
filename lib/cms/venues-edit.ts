import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  VENUE_LOCATIONS,
  venueDisplayName,
  type VenueLocation,
} from "@/lib/locations";
import { normalizeVenueMapCoords } from "@/lib/map-coords";
import { buildWhatsAppHref } from "@/lib/cms/site-footer-edit";
import type { CmsDocument, CmsVenue, CmsVenuesContact } from "@/lib/cms/types";

export const VENUES_CONTACT_PANEL_ID = "__venues_contact__";

export const DEFAULT_VENUES_CONTACT: CmsVenuesContact = {
  title: "¿Necesitas más información?",
  body: "Escríbenos por WhatsApp o correo y te indicamos la sede o el punto cultural más cercano según la actividad que te interese.",
  phone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
  ctaLabel: "Escribir por WhatsApp",
  whatsappNumber: "",
  whatsappMessage: "",
};

export function venuesContactWhatsAppHref(
  contact: CmsVenuesContact,
  fallbackUrl: string,
): string {
  const fromPhone = contact.phone?.replace(/\D/g, "") ?? "";
  const number = contact.whatsappNumber?.trim() || fromPhone;
  return buildWhatsAppHref(number, contact.whatsappMessage, fallbackUrl);
}

export function venueToCms(v: VenueLocation): CmsVenue {
  return {
    id: v.id,
    name: v.name,
    kind: v.kind,
    city: v.city,
    zone: v.zone,
    address: v.address,
    reference: v.reference,
    phone: v.phone,
    email: v.email,
    mapsQuery: v.mapsQuery,
    note: v.note,
    mapX: v.mapX,
    mapY: v.mapY,
    mapHideLabel: v.mapHideLabel,
  };
}

export function cmsToVenue(v: CmsVenue): VenueLocation {
  return {
    id: v.id,
    name: v.name,
    kind: v.kind,
    city: v.city,
    zone: v.zone,
    address: v.address,
    reference: v.reference,
    phone: v.phone,
    email: v.email,
    mapsQuery: v.mapsQuery,
    note: v.note,
    mapX: v.mapX,
    mapY: v.mapY,
    mapHideLabel: v.mapHideLabel,
  };
}

export function getVenuesForEdit(
  doc: CmsDocument,
  fallback: VenueLocation[] = VENUE_LOCATIONS,
): { items: CmsVenue[]; hidden: string[] } {
  const hidden = [...(doc.sections.venuesHidden ?? [])];
  const hiddenSet = new Set(hidden);
  const cmsById = new Map(
    (doc.sections.venues ?? []).map((v) => [v.id, v]),
  );
  const items: CmsVenue[] = [];
  const seen = new Set<string>();

  for (const v of fallback) {
    if (hiddenSet.has(v.id)) continue;
    items.push(cmsById.get(v.id) ?? venueToCms(v));
    seen.add(v.id);
  }
  for (const v of doc.sections.venues ?? []) {
    if (!seen.has(v.id) && !hiddenSet.has(v.id)) {
      items.push(v);
    }
  }
  return { items, hidden };
}

export function mergeVenuesContact(
  cms?: CmsDocument | null,
): CmsVenuesContact {
  return { ...DEFAULT_VENUES_CONTACT, ...cms?.sections.venuesContact };
}

export function buildDocWithVenues(
  base: CmsDocument,
  items: CmsVenue[],
  hidden: string[],
  contact?: CmsVenuesContact,
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      venues: items,
      venuesHidden: hidden,
      ...(contact ? { venuesContact: contact } : {}),
    },
  };
}

export function newVenueId() {
  return `venue-${Date.now().toString(36)}`;
}

export function formatSedesSummary(venues: VenueLocation[]): string {
  const sedes = venues.filter((v) => v.kind === "sede");
  const byCity = new Map<string, string[]>();
  for (const v of sedes) {
    const short = v.name.replace(/^Sede\s+/i, "");
    const list = byCity.get(v.city) ?? [];
    list.push(short);
    byCity.set(v.city, list);
  }
  return [...byCity.entries()]
    .map(([city, names]) => `${city}: ${names.join(", ")}`)
    .join("\n");
}

export function formatCentrosSummary(venues: VenueLocation[]): string {
  const centros = venues.filter((v) => v.kind === "centro-cultural");
  const byCity = new Map<string, string[]>();
  for (const v of centros) {
    const list = byCity.get(v.city) ?? [];
    list.push(v.name.replace(/^Punto\s+Cultural\s+/i, "").trim() || v.name);
    byCity.set(v.city, list);
  }
  return [...byCity.entries()]
    .map(([city, names]) => `${city}: ${names.join(", ")}`)
    .join("\n");
}

const DEFAULT_MAP: Record<
  string,
  { mapX: number; mapY: number; kind: "sede" | "centro-cultural" }
> = {
  "Santo Domingo:sede": { mapX: 559, mapY: 411, kind: "sede" },
  "Santo Domingo:centro-cultural": {
    mapX: 565,
    mapY: 398,
    kind: "centro-cultural",
  },
  "Santiago:sede": {
    mapX: 370,
    mapY: 158,
    kind: "sede",
  },
  "Puerto Plata:sede": {
    mapX: 336,
    mapY: 43,
    kind: "sede",
  },
};

export type VenueMapPin = {
  id: string;
  city: string;
  label: string;
  x: number;
  y: number;
  variant: "sede" | "centro";
  hideLabel?: boolean;
};

function sedePinLabel(v: VenueLocation): string {
  return v.city.trim();
}

function mapPinFromVenue(
  v: VenueLocation,
  x: number,
  y: number,
  variant: "sede" | "centro",
  label?: string,
): VenueMapPin {
  const city = v.city.trim();
  return {
    id: v.id,
    city,
    label: label ?? city,
    x,
    y,
    variant,
    hideLabel: v.mapHideLabel === true,
  };
}

export function getMapPinsFromVenues(venues: VenueLocation[]): VenueMapPin[] {
  const citiesWithSede = new Set(
    venues
      .filter((v) => v.kind === "sede")
      .map((v) => v.city.trim())
      .filter(Boolean),
  );

  const explicitSedePins: VenueMapPin[] = [];
  /** Pin por defecto de ciudad si ninguna sede tiene coordenadas propias. */
  const implicitSedeByCity = new Map<string, VenueMapPin>();
  const citiesWithExplicitSedePin = new Set<string>();
  const centroPins: VenueMapPin[] = [];
  /** Un pin automático de punto cultural por ciudad sin sede. */
  const autoCentroByCity = new Set<string>();

  for (const v of venues) {
    const city = v.city.trim();
    if (!city) continue;

    const normalized = normalizeVenueMapCoords(v.mapX, v.mapY);
    let x = normalized.mapX;
    let y = normalized.mapY;
    const hasExplicitCoords = x != null && y != null;

    if (v.kind === "sede") {
      if (hasExplicitCoords) {
        citiesWithExplicitSedePin.add(city);
        explicitSedePins.push(
          mapPinFromVenue(v, x!, y!, "sede", sedePinLabel(v)),
        );
        continue;
      }

      if (citiesWithExplicitSedePin.has(city) || implicitSedeByCity.has(city)) {
        continue;
      }

      const defaults =
        DEFAULT_MAP[`${city}:sede`] ?? DEFAULT_MAP[`${city}:centro-cultural`];
      x = defaults?.mapX;
      y = defaults?.mapY;
      if (x == null || y == null) continue;

      implicitSedeByCity.set(
        city,
        mapPinFromVenue(v, x, y, "sede", city),
      );
      continue;
    }

    // Punto cultural
    if (citiesWithSede.has(city)) {
      if (!hasExplicitCoords) continue;
    } else if (!hasExplicitCoords) {
      const defaults =
        DEFAULT_MAP[`${city}:centro-cultural`] ??
        DEFAULT_MAP[`${city}:sede`];
      x = defaults?.mapX;
      y = defaults?.mapY;
      if (x == null || y == null) continue;
      if (autoCentroByCity.has(city)) continue;
      autoCentroByCity.add(city);
    }

    if (x == null || y == null) continue;

    centroPins.push(
      mapPinFromVenue(
        v,
        x,
        y,
        "centro",
        venueDisplayName(v.name, v.kind),
      ),
    );
  }

  return [
    ...explicitSedePins,
    ...implicitSedeByCity.values(),
    ...centroPins,
  ];
}

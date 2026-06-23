import {
  VENUE_LOCATIONS,
  type VenueLocation,
} from "@/lib/locations";
import type { CmsDocument, CmsVenue } from "@/lib/cms/types";

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

export function buildDocWithVenues(
  base: CmsDocument,
  items: CmsVenue[],
  hidden: string[],
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      venues: items,
      venuesHidden: hidden,
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
};

export function getMapPinsFromVenues(venues: VenueLocation[]) {
  const pins = new Map<
    string,
    { city: string; x: number; y: number; variant: "sede" | "centro" }
  >();

  for (const v of venues) {
    const defaults = DEFAULT_MAP[`${v.city}:${v.kind}`];
    const x = v.mapX ?? defaults?.mapX;
    const y = v.mapY ?? defaults?.mapY;
    if (x == null || y == null) continue;
    const variant = v.kind === "sede" ? "sede" : "centro";
    const existing = pins.get(v.city);
    if (!existing || (variant === "sede" && existing.variant === "centro")) {
      pins.set(v.city, { city: v.city, x, y, variant });
    }
  }

  return [...pins.values()];
}

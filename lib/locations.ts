import {
  DIPLOMADO_WHATSAPP_NUMBER,
  DIPLOMADO_WHATSAPP_URL,
  INFO_EMAIL,
} from "@/lib/site-config";
import { isGoogleMapsUrl } from "@/lib/map-coords";

export type VenueKind = "sede" | "centro-cultural";

export type VenueLocation = {  id: string;
  name: string;
  kind: VenueKind;
  city: string;
  zone: string;
  address: string;
  reference?: string;
  phone?: string;
  email?: string;
  mapsQuery: string;
  note?: string;
  mapX?: number;
  mapY?: number;
  /** Si true, el pin en el mapa del sitio no muestra el nombre de la ciudad. */
  mapHideLabel?: boolean;
};

export const CONTACT_EMAIL = INFO_EMAIL;
export const CONTACT_PHONE = "(849) 352-7054";

/** Sedes y puntos culturales con direcciones para «Encuéntranos». */
export const VENUE_LOCATIONS: VenueLocation[] = [
  {
    id: "sede-naco",
    name: "Naco",
    kind: "sede",
    city: "Santo Domingo",
    zone: "Ens. Naco",
    address: "Calle Cub Scouts No. 6, 3er nivel",
    reference: "Antes de Av. Tiradentes, detrás de Plaza Merengue",
    phone: CONTACT_PHONE,
    mapsQuery: "Calle Cub Scouts 6 Naco Santo Domingo República Dominicana",
  },
  {
    id: "sede-los-prados",
    name: "Los Prados",
    kind: "sede",
    city: "Santo Domingo",
    zone: "Los Prados",
    address: "Eugenio Deschamps No. 81",
    reference: "Plaza Los Prados",
    phone: CONTACT_PHONE,
    mapsQuery:
      "Eugenio Deschamps 81 Los Prados Santo Domingo República Dominicana",
  },
  {
    id: "punto-cultural-roberto-pastoriza",
    name: "Roberto Pastoriza",
    kind: "centro-cultural",
    city: "Santo Domingo",
    zone: "Evaristo Morales",
    address: "Roberto Pastoriza No. 709",
    phone: CONTACT_PHONE,
    mapsQuery: "Roberto Pastoriza 709 Evaristo Morales Santo Domingo",
  },
  {
    id: "sede-santiago",
    name: "Santiago",
    kind: "sede",
    city: "Santiago",
    zone: "Santiago de los Caballeros",
    address: "Dirección próximamente",
    phone: CONTACT_PHONE,
    mapsQuery: "Nueva Acrópolis Santiago de los Caballeros República Dominicana",
  },
];

/** Abre el enlace pegado tal cual, o busca por texto si no es URL de Maps. */
export function mapsUrl(query: string): string {
  const t = query.trim();
  if (!t) return "https://www.google.com/maps";
  if (isGoogleMapsUrl(t)) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t)}`;
}

/** Búsqueda estable Naco (misma que Civis; “C.” abreviado geocodifica mal). */
const NACO_MAP_EMBED_QUERY =
  "Calle Cub Scouts No. 6, Ensanche Naco, Santo Domingo, República Dominicana";

/** Dirección estable para iframe cuando mapsQuery es enlace corto. */
export function mapsEmbedFallback(venue: {
  id?: string;
  address?: string;
  zone?: string;
  city?: string;
}): string {
  if (venue.id === "sede-naco") return NACO_MAP_EMBED_QUERY;
  const address = (venue.address ?? "")
    .trim()
    .replace(/^C\.\s+/i, "Calle ")
    .replace(/^Av\.\s+/i, "Avenida ");
  const parts = [address, venue.zone, venue.city, "República Dominicana"]
    .map((p) => p?.trim())
    .filter(Boolean) as string[];
  return [...new Set(parts)].join(", ");
}

/**
 * URL de embed de Google Maps. Los goo.gl / share.google no geocodifican:
 * usar fallbackSearch (dirección) en ese caso.
 */
export function mapsEmbedUrl(query: string, fallbackSearch?: string): string {
  const t = query.trim();
  if (!t && !fallbackSearch?.trim()) {
    return "https://maps.google.com/maps?hl=es&z=17&output=embed";
  }
  const gps = (() => {
    let m = t.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (m) return { lat: Number(m[1]), lon: Number(m[2]) };
    m = t.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (m) return { lat: Number(m[1]), lon: Number(m[2]) };
    m = t.match(
      /[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    );
    if (m) return { lat: Number(m[1]), lon: Number(m[2]) };
    return null;
  })();
  if (gps) {
    return `https://maps.google.com/maps?q=${gps.lat},${gps.lon}&hl=es&z=17&output=embed`;
  }
  const place = t.match(/\/maps\/place\/([^/@]+)/);
  if (place) {
    const name = decodeURIComponent(place[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(name)}&hl=es&z=17&output=embed`;
  }
  if (/maps\.app\.goo\.gl|goo\.gl\/maps|share\.google\//i.test(t)) {
    const q = (fallbackSearch ?? t).trim();
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=es&z=17&output=embed`;
  }
  const q = t || (fallbackSearch ?? "").trim();
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=es&z=17&output=embed`;
}

export function venuesByKind(kind: VenueKind): VenueLocation[] {
  return VENUE_LOCATIONS.filter((v) => v.kind === kind);
}

/** Etiqueta visible en tarjetas (Sede / Punto cultural). */
export function venueKindLabel(kind: VenueKind): string {
  return kind === "sede" ? "Sede" : "Punto cultural";
}

/** Nombre sin repetir la etiqueta («Sede Naco» → «Naco»). */
export function venueDisplayName(name: string, kind: VenueKind): string {
  if (kind === "sede") {
    return name.replace(/^Sede\s+/i, "").trim() || name;
  }
  return name.replace(/^Punto\s+Cultural\s+/i, "").trim() || name;
}

export {
  DIPLOMADO_WHATSAPP_URL as WHATSAPP_URL,
  DIPLOMADO_WHATSAPP_NUMBER as WHATSAPP_NUMBER,
};

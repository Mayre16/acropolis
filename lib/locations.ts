import {
  DIPLOMADO_WHATSAPP_NUMBER,
  DIPLOMADO_WHATSAPP_URL,
  INFO_EMAIL,
} from "@/lib/site-config";

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

export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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

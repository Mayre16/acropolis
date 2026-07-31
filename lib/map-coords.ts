/** Convierte lat/lon (Google Maps) a coordenadas del SVG del mapa RD (viewBox 1000×686). */
import { DR_MAP_BOUNDS } from "@/lib/dr-map-provinces";

export function latLonToDrMapSvg(lat: number, lon: number): { x: number; y: number } {
  const { latMin, latMax, lonMin, lonMax } = DR_MAP_BOUNDS;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * 1000;
  const y = ((latMax - lat) / (latMax - latMin)) * 686;
  return {
    x: Math.round(Math.min(1000, Math.max(0, x))),
    y: Math.round(Math.min(686, Math.max(0, y))),
  };
}

/** Extrae lat/lon de URL o texto de Google Maps. */
export function parseLatLonFromMapsInput(input: string): { lat: number; lon: number } | null {
  const s = input.trim();
  if (!s) return null;

  let m = s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lon: Number(m[2]) };

  // Formato interno de place: !3dLAT!4dLON
  m = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lon: Number(m[2]) };

  m = s.match(/[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (m) return { lat: Number(m[1]), lon: Number(m[2]) };

  m = s.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    // RD: lat ~17–20, lon ~-72–-68
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lat: a, lon: b };
  }

  return null;
}

/** ¿Es un enlace de Google Maps (completo o corto)? */
export function isGoogleMapsUrl(input: string): boolean {
  const s = input.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  return (
    /(?:^|\.)google\.[^/]+\/maps/i.test(s) ||
    /maps\.google\./i.test(s) ||
    /maps\.app\.goo\.gl/i.test(s) ||
    /goo\.gl\/maps/i.test(s)
  );
}

/** Si mapX/mapY parecen lat/lon de Google en lugar de píxeles SVG. */
export function looksLikeGpsNotSvg(mapX?: number, mapY?: number): boolean {
  if (mapX == null || mapY == null) return false;
  return mapX >= -90 && mapX <= 90 && mapY >= -180 && mapY <= 0;
}

export function normalizeVenueMapCoords(
  mapX?: number,
  mapY?: number,
): { mapX?: number; mapY?: number } {
  if (!looksLikeGpsNotSvg(mapX, mapY)) {
    return { mapX, mapY };
  }
  const lat = mapX!;
  const lon = mapY!;
  const { x, y } = latLonToDrMapSvg(lat, lon);
  return { mapX: x, mapY: y };
}

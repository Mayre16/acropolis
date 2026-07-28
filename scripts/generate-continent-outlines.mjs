import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landUrl =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";

function fetchJson(target) {
  return new Promise((resolve, reject) => {
    https
      .get(target, (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function ringLength(coords) {
  let len = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i];
    len += Math.hypot(lat2 - lat1, lon2 - lon1);
  }
  return len;
}

/** Muestrea un anillo de polígono con más puntos en costas largas. */
function sampleRing(coords, targetPoints = 28) {
  if (coords.length < 4) return [];
  const total = ringLength(coords);
  if (total < 3) return [];

  const maxPts = Math.min(48, Math.max(8, Math.round(total / 4)));
  const step = Math.max(1, Math.floor(coords.length / maxPts));
  const pts = [];

  for (let i = 0; i < coords.length; i += step) {
    const [lon, lat] = coords[i];
    pts.push([round(lat), round(lon)]);
  }

  const [lon0, lat0] = coords[0];
  const end = [round(lat0), round(lon0)];
  const last = pts[pts.length - 1];
  if (last[0] !== end[0] || last[1] !== end[1]) pts.push(end);

  return pts;
}

function round(n) {
  return Math.round(n * 10) / 10;
}

/** Rompe anillos donde hay salto de longitud (antimeridiano o artefacto). */
function splitAtGaps(ring) {
  const parts = [];
  let current = [];

  for (let i = 0; i < ring.length; i++) {
    const [lat, lon] = ring[i];
    if (current.length > 0) {
      const [plat, plon] = current[current.length - 1];
      let dLon = Math.abs(lon - plon);
      if (dLon > 180) dLon = 360 - dLon;
      if (dLon > 75 || Math.abs(lat - plat) > 45) {
        if (current.length >= 3) parts.push(current);
        current = [];
      }
    }
    current.push([lat, lon]);
  }
  if (current.length >= 3) parts.push(current);
  return parts;
}

const geo = await fetchJson(landUrl);
const outlines = [];

for (const feature of geo.features) {
  const { geometry } = feature;
  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];

  for (const polygon of polygons) {
    const outer = polygon[0];
    if (!outer || outer.length < 8) continue;

    const sampled = sampleRing(outer);
    if (sampled.length < 4) continue;

    for (const part of splitAtGaps(sampled)) {
      if (part.length < 4) continue;
      const lats = part.map((p) => p[0]);
      const lons = part.map((p) => p[1]);
      const span =
        Math.max(...lats) -
        Math.min(...lats) +
        (Math.max(...lons) - Math.min(...lons));
      if (span < 2.2) continue;
      outlines.push(part);
    }
  }
}

const outPath = path.join(__dirname, "../lib/diplomado-continent-outlines.ts");
const body = `/**
 * Contornos de masas terrestres (Natural Earth 110m land).
 * Generado con: node scripts/generate-continent-outlines.mjs
 */
export const DIPLOMADO_CONTINENT_OUTLINES: [number, number][][] = ${JSON.stringify(outlines, null, 2)};
`;

fs.writeFileSync(outPath, body);
console.log("wrote", outPath, "segments:", outlines.length);

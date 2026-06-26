/**
 * Convierte GeoJSON de provincias (amCharts) a paths SVG viewBox 1000×686.
 * Uso: node principal/scripts/build-dr-provinces.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PAD = 0.012;

function walkCoords(coords, fn) {
  if (typeof coords[0] === "number") {
    fn(coords[0], coords[1]);
    return;
  }
  for (const c of coords) walkCoords(c, fn);
}

function computeBounds(features) {
  let latMin = Infinity;
  let latMax = -Infinity;
  let lonMin = Infinity;
  let lonMax = -Infinity;
  for (const f of features) {
    walkCoords(f.geometry.coordinates, (lon, lat) => {
      latMin = Math.min(latMin, lat);
      latMax = Math.max(latMax, lat);
      lonMin = Math.min(lonMin, lon);
      lonMax = Math.max(lonMax, lon);
    });
  }
  return {
    latMin: latMin - PAD,
    latMax: latMax + PAD,
    lonMin: lonMin - PAD,
    lonMax: lonMax + PAD,
  };
}

/** @param {ReturnType<typeof computeBounds>} bounds */
function project(lat, lon, bounds) {
  const x =
    ((lon - bounds.lonMin) / (bounds.lonMax - bounds.lonMin)) * 1000;
  const y =
    ((bounds.latMax - lat) / (bounds.latMax - bounds.latMin)) * 686;
  return [Math.round(x), Math.round(y)];
}

/** Douglas-Peucker simplification to keep file size reasonable. */
function simplifyRing(ring, tolerance = 0.8) {
  if (ring.length <= 4) return ring;

  function perpendicularDistance(point, lineStart, lineEnd) {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) {
      return Math.hypot(x - x1, y - y1);
    }
    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    const px = x1 + t * dx;
    const py = y1 + t * dy;
    return Math.hypot(x - px, y - py);
  }

  function rdp(points, epsilon) {
    if (points.length < 3) return points;
    let maxDist = 0;
    let index = 0;
    const end = points.length - 1;
    for (let i = 1; i < end; i++) {
      const dist = perpendicularDistance(points[i], points[0], points[end]);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }
    if (maxDist > epsilon) {
      const left = rdp(points.slice(0, index + 1), epsilon);
      const right = rdp(points.slice(index), epsilon);
      return [...left.slice(0, -1), ...right];
    }
    return [points[0], points[end]];
  }

  return rdp(ring, tolerance);
}

function ringToPath(ring, bounds) {
  const pts = simplifyRing(
    ring.map(([lon, lat]) => project(lat, lon, bounds)),
    1.2,
  );
  if (pts.length < 3) return "";
  const [first, ...rest] = pts;
  return `M${first[0]} ${first[1]}${rest.map(([x, y]) => `L${x} ${y}`).join("")}Z`;
}

function geometryToPaths(geometry, bounds) {
  const paths = [];
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) {
      const d = ringToPath(ring, bounds);
      if (d) paths.push(d);
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates) {
      for (const ring of poly) {
        const d = ringToPath(ring, bounds);
        if (d) paths.push(d);
      }
    }
  }
  return paths;
}

const geo = JSON.parse(
  readFileSync(join(__dirname, "_dr-amcharts.json"), "utf8"),
);

const bounds = computeBounds(geo.features);

const provinces = geo.features
  .map((f) => ({
    id: f.id ?? f.properties?.id ?? "",
    name: f.properties?.name ?? "",
    paths: geometryToPaths(f.geometry, bounds),
  }))
  .filter((p) => p.paths.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

function round(n) {
  return Math.round(n * 10000) / 10000;
}

const out = `/** Provincias RD proyectadas al viewBox 1000×686 (fuente: amCharts geodata). */
export const DR_MAP_BOUNDS = ${JSON.stringify(
  {
    latMin: round(bounds.latMin),
    latMax: round(bounds.latMax),
    lonMin: round(bounds.lonMin),
    lonMax: round(bounds.lonMax),
  },
  null,
  2,
)};

export type DrMapProvince = {
  id: string;
  name: string;
  paths: string[];
};

export const DR_MAP_PROVINCES: DrMapProvince[] = ${JSON.stringify(provinces, null, 2)};
`;

const outPath = join(__dirname, "..", "lib", "dr-map-provinces.ts");
writeFileSync(outPath, out);
const kb = Math.round(Buffer.byteLength(out, "utf8") / 1024);
console.log(`Wrote ${provinces.length} provinces (${kb} KB) → ${outPath}`);

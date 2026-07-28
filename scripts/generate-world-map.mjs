/**
 * Mapa mundial equirectangular para la sección impacto (OINA / escuelas).
 * Uso: node scripts/generate-world-map.mjs
 */
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landUrl =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";

const W = 720;
const H = 360;

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

function project(lon, lat) {
  return [lon + 180, 90 - lat];
}

function splitRing(coords) {
  const parts = [];
  let current = [];
  for (let i = 0; i < coords.length; i++) {
    const [lon, lat] = coords[i];
    if (current.length > 0) {
      const [plon, plat] = current[current.length - 1];
      let dLon = Math.abs(lon - plon);
      if (dLon > 180) dLon = 360 - dLon;
      if (dLon > 70 || Math.abs(lat - plat) > 45) {
        if (current.length >= 3) parts.push(current);
        current = [];
      }
    }
    current.push([lon, lat]);
  }
  if (current.length >= 3) parts.push(current);
  return parts;
}

function ringToPath(coords) {
  return (
    coords
      .map(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}

const geo = await fetchJson(landUrl);
const paths = [];

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
    if (!outer || outer.length < 6) continue;
    for (const part of splitRing(outer)) {
      paths.push(ringToPath(part));
    }
  }
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 360 180">
  <defs>
    <linearGradient id="ocean" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f3550"/>
      <stop offset="55%" stop-color="#064a42"/>
      <stop offset="100%" stop-color="#033830"/>
    </linearGradient>
  </defs>
  <rect width="360" height="180" fill="url(#ocean)"/>
  <g fill="rgba(255, 220, 120, 0.22)" stroke="rgba(255, 232, 140, 0.55)" stroke-width="0.35">
    ${paths.map((d) => `<path d="${d}"/>`).join("\n    ")}
  </g>
</svg>`;

const outDir = path.join(__dirname, "../public/img/diplomado/landing");
fs.mkdirSync(outDir, { recursive: true });
const svgPath = path.join(outDir, "world-map-oina.svg");
const webpPath = path.join(outDir, "world-map-oina.webp");

fs.writeFileSync(svgPath, svg);
await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(webpPath);

console.log("wrote", webpPath);

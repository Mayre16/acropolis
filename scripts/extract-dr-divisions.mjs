/**
 * Extrae trazados admin1 (regiones) del SVG de Simplemaps (viewBox 1000×686).
 * Uso: node principal/scripts/extract-dr-divisions.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(__dirname, "_dr-admin1.svg"), "utf8");

const paths = [...svg.matchAll(/<path\s+d="([^"]+)"\s+id="([^"]+)"\s+name="([^"]+)"/g)].map(
  (m) => ({ id: m[2], name: m[3], d: m[1] }),
);

if (paths.length === 0) {
  console.error("No paths found");
  process.exit(1);
}

const out = `/** Divisiones internas RD (regiones admin1 · Simplemaps · viewBox 1000×686). */
export type DrMapDivision = { id: string; name: string; d: string };

/** Límites regionales — ayuda a ubicar sedes; no son las 32 provincias individuales. */
export const DR_MAP_DIVISIONS: DrMapDivision[] = ${JSON.stringify(paths, null, 2)};
`;

writeFileSync(join(__dirname, "..", "lib", "dr-map-divisions.ts"), out);
console.log(`Wrote ${paths.length} divisions`);

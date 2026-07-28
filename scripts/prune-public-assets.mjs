/**
 * Elimina basura y duplicados de public/ (no referenciados en el sitio).
 * Uso: node scripts/prune-public-assets.mjs
 */
import { existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

const DROP_FILES = [
  "brand/_debug-full.png",
  "brand/_debug-icon-na.png",
  "brand/_tmp-am.webp",
  "brand/_tmp-anagrama-mark.webp",
  "brand/_tmp-escuela-band.png",
  "img/diplomado/landing/hero-layer-full.png",
  "img/diplomado/landing/hero-bg-full.png",
  "img/hero/bienestar/respiracion.webp",
  "img/hero/bienestar/respiracion.webp.tmp",
  "index.zip",
];

let saved = 0;

for (const rel of DROP_FILES) {
  const file = join(PUBLIC, rel);
  if (!existsSync(file)) continue;
  const size = statSync(file).size;
  unlinkSync(file);
  saved += size;
  console.log(`  − public/${rel} (${(size / 1024 / 1024).toFixed(2)} MB)`);
}

console.log(`Listo: −${(saved / 1024 / 1024).toFixed(2)} MB en public/`);

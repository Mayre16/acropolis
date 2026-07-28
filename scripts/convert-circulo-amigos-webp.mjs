/**
 * Convierte imágenes JPG/PNG de circulo-amigos a WebP (quality 82).
 * Uso: node scripts/convert-circulo-amigos-webp.mjs
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const DIRS = [
  path.join(ROOT, "principal/public/img/circulo-amigos"),
  path.join(ROOT, "circulodeamigos/public/img/circulo-amigos"),
];

const SKIP = new Set([
  "logo-header.png",
  "logo-header-cropped.png",
  "logo-header-cropped.webp",
  "conversacion.webp",
]);

async function convertDir(dir) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    console.warn("Skip (missing):", dir);
    return;
  }

  for (const name of entries) {
    if (SKIP.has(name)) continue;
    if (!/\.(jpe?g|png)$/i.test(name)) continue;

    const src = path.join(dir, name);
    const dest = path.join(dir, name.replace(/\.(jpe?g|png)$/i, ".webp"));
    const before = (await stat(src)).size;
    await sharp(src).webp({ quality: 82, effort: 4 }).toFile(dest);
    const after = (await stat(dest)).size;
    const pct = Math.round((1 - after / before) * 100);
    console.log(`${path.relative(ROOT, dest)}  ${before} → ${after} bytes (−${pct}%)`);
  }
}

for (const dir of DIRS) {
  console.log("\n", dir);
  await convertDir(dir);
}

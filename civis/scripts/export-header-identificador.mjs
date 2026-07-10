/**
 * Recorta bordes superior/derecho del identificador para header integrado.
 * Conserva la curva blanca NA sobre fondo blanco sólido (sin alpha).
 *
 * Uso: npm run identificador:header
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/brand/identificadores/civis-identificador.webp");
const OUT = path.join(ROOT, "public/brand/identificadores/civis-identificador-header.webp");

/** px a recortar (borde superior + borde derecho) */
const CROP_TOP = 3;
const CROP_RIGHT = 3;
const CROP_BOTTOM = 1;
const CROP_LEFT = 0;

if (!fs.existsSync(SRC)) {
  console.error("No se encontró:", SRC);
  process.exit(1);
}

const meta = await sharp(SRC).metadata();
const width = meta.width - CROP_LEFT - CROP_RIGHT;
const height = meta.height - CROP_TOP - CROP_BOTTOM;

await sharp(SRC)
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .extract({ left: CROP_LEFT, top: CROP_TOP, width, height })
  .removeAlpha()
  .webp({ quality: 92 })
  .toFile(OUT);

console.log("Header identificador exportado:", OUT, `${width}x${height}`);

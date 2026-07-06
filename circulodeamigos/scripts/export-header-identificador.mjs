/**
 * Recorta bordes superior/derecho del identificador para header integrado.
 * Conserva la curva blanca NA; elimina la orilla lavanda del PNG.
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

/** px a recortar (borde superior lavanda + borde derecho) */
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
  .extract({ left: CROP_LEFT, top: CROP_TOP, width, height })
  .webp({ quality: 92 })
  .toFile(OUT);

console.log("Header identificador exportado:", OUT, `${width}x${height}`);

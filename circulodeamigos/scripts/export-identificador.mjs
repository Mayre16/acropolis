/**
 * Exporta el identificador oficial Civis (954×165) a PNG y WebP.
 * Fuente: archivo de marca en tienda o CIVIS-IDENTIFICADOR.jpg en la raíz del monorepo.
 *
 * Uso: npm run identificador:export
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/brand/identificadores");
const BANNER_W = 954;
const BANNER_H = 165;

const sources = [
  path.join(ROOT, "../tienda/public/brand/identificadores/civis-identificador.png"),
  path.join(ROOT, "../CIVIS-IDENTIFICADOR.jpg"),
  path.join(ROOT, "../tienda/public/brand/identificadores/civis-identificador.jpg"),
];

const source = sources.find((p) => fs.existsSync(p));
if (!source) {
  console.error("No se encontró el identificador oficial Civis.");
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const bannerPng = path.join(OUT, "civis-identificador.png");
const bannerWebp = path.join(OUT, "civis-identificador.webp");

const pipeline = sharp(source).resize(BANNER_W, BANNER_H, {
  fit: "contain",
  background: { r: 37, g: 46, b: 101, alpha: 1 },
});

await pipeline.clone().png().toFile(bannerPng);
await pipeline.clone().webp({ quality: 92 }).toFile(bannerWebp);

const meta = await sharp(bannerWebp).metadata();
console.log("Identificador oficial exportado desde:", source);
console.log("  PNG: ", bannerPng);
console.log("  WebP:", bannerWebp, `${meta.width}x${meta.height}`);

/**
 * Recorta el identificador para header integrado (patrón Civis / Editorial).
 * Exporta solo la franja horizontal del banner (sin márgenes grises ni ala inferior).
 *
 * Uso: npm run identificador:header
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("../../principal/node_modules/sharp");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/img/circulo-amigos/logo-header.png");
const OUT_WEBP = path.join(
  ROOT,
  "public/img/circulo-amigos/logo-header-cropped.webp",
);
const OUT_PNG = path.join(
  ROOT,
  "public/img/circulo-amigos/logo-header-cropped.png",
);

/** Borde gris del export (#c5c5c5). */
function isBorderGray(r, g, b) {
  return r >= 195 && g >= 195 && b >= 195 && r <= 205 && g <= 205 && b <= 205;
}

if (!fs.existsSync(SRC)) {
  console.error("No se encontró:", SRC);
  process.exit(1);
}

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

let left = 0;
let right = width - 1;
let bandTop = 0;
let bandBottom = height - 1;

for (let x = 0; x < width; x++) {
  let any = false;
  for (let y = 0; y < height; y++) {
    const i = (y * width + x) * channels;
    if (!isBorderGray(data[i], data[i + 1], data[i + 2])) {
      any = true;
      break;
    }
  }
  if (any) {
    left = x;
    break;
  }
}

for (let x = width - 1; x >= 0; x--) {
  let any = false;
  for (let y = 0; y < height; y++) {
    const i = (y * width + x) * channels;
    if (!isBorderGray(data[i], data[i + 1], data[i + 2])) {
      any = true;
      break;
    }
  }
  if (any) {
    right = x;
    break;
  }
}

/** Franja azul central (excluye gris superior/inferior del banner). */
const bandProbeX = Math.min(1200, right - 40);
for (let y = 0; y < height; y++) {
  const i = (y * width + bandProbeX) * channels;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r < 200 && g > 120 && b > 150) {
    bandTop = y;
    break;
  }
}
for (let y = height - 1; y >= 0; y--) {
  const i = (y * width + bandProbeX) * channels;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r < 200 && g > 120 && b > 150) {
    bandBottom = y;
    break;
  }
}

const extract = {
  left,
  top: bandTop,
  width: right - left + 1,
  height: bandBottom - bandTop + 1,
};

/** Recorte derecho: quitar franja azul vacía después de «AMIGOS». */
function findContentRightEdge() {
  const contrastThreshold = 30;
  const pad = 88;
  let lastContent = left;

  for (let x = right; x >= left; x--) {
    let minR = 255;
    let maxR = 0;
    let minG = 255;
    let maxG = 0;
    let minB = 255;
    let maxB = 0;

    for (let y = bandTop; y <= bandBottom; y += 2) {
      const i = (y * width + x) * channels;
      const a = data[i + 3];
      if (a < 128) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minG = Math.min(minG, g);
      maxG = Math.max(maxG, g);
      minB = Math.min(minB, b);
      maxB = Math.max(maxB, b);
    }

    const contrast = maxR - minR + (maxG - minG) + (maxB - minB);
    if (contrast > contrastThreshold || maxR > 205) {
      lastContent = x;
      break;
    }
  }

  return Math.min(right, lastContent + pad);
}

const tightRight = findContentRightEdge();
const tightExtract = {
  left,
  top: bandTop,
  width: tightRight - left + 1,
  height: bandBottom - bandTop + 1,
};

const cropped = sharp(SRC).extract(tightExtract);
await cropped.clone().webp({ quality: 92 }).toFile(OUT_WEBP);
await cropped.clone().png({ compressionLevel: 9 }).toFile(OUT_PNG);

const outMeta = await sharp(OUT_WEBP).metadata();
console.log(
  "Header identificador Círculo:",
  OUT_WEBP,
  `${outMeta.width}x${outMeta.height}`,
  `aspect ${(outMeta.width / outMeta.height).toFixed(4)}`,
);

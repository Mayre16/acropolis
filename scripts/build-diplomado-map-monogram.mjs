/**
 * Genera monograma NA para mapa diplomado desde PNG de referencia (anagrama completo).
 * Uso: node scripts/build-diplomado-map-monogram.mjs [ruta-origen.png]
 */
import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = join(ROOT, "public", "brand");
const DEFAULT_SRC = join(BRAND, "na-monogram-reference.png");

const src = process.argv[2] ?? DEFAULT_SRC;
const outWhite = join(BRAND, "logo-na-solo-map-white.webp");
const outColor = join(BRAND, "logo-na-solo-map.webp");

if (!existsSync(src)) {
  console.error("No se encontró origen:", src);
  process.exit(1);
}

mkdirSync(BRAND, { recursive: true });

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const color = Buffer.alloc(width * height * 4);
const white = Buffer.alloc(width * height * 4);

for (let i = 0; i < width * height; i++) {
  const o = i * channels;
  const r = data[o];
  const g = data[o + 1];
  const b = data[o + 2];
  const a = channels === 4 ? data[o + 3] : 255;

  const isWhiteBg = r > 240 && g > 240 && b > 240;
  // El logo es verde/teal (g domina); la única franja cálida es la línea
  // naranja decorativa superior. Cualquier píxel con rojo dominante = línea.
  const isWarmLine = r > 120 && r > g && r >= b;
  const isBackground = isWhiteBg || isWarmLine;

  const alpha = isBackground ? 0 : Math.round((a / 255) * 255);
  const d = i * 4;

  color[d] = r;
  color[d + 1] = g;
  color[d + 2] = b;
  color[d + 3] = alpha;

  white[d] = 255;
  white[d + 1] = 255;
  white[d + 2] = 255;
  white[d + 3] = alpha;
}

async function toWebp(buf, padRatio = 0.06) {
  const trimmed = sharp(buf, { raw: { width, height, channels: 4 } }).trim({
    threshold: 8,
  });
  const meta = await trimmed.metadata();
  const w = meta.width ?? width;
  const h = meta.height ?? height;
  const padX = Math.round(w * padRatio);
  const padY = Math.round(h * padRatio);
  return trimmed
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 92, effort: 4 })
    .toBuffer();
}

const colorBuf = await toWebp(color);
await sharp(colorBuf).toFile(outColor);
const whiteBuf = await toWebp(white);
await sharp(whiteBuf).toFile(outWhite);
const whiteMeta = await sharp(outWhite).metadata();

console.log("wrote", outWhite, `${whiteMeta.width}x${whiteMeta.height}`);
console.log("wrote", outColor, `${whiteMeta.width}x${whiteMeta.height}`);

/**
 * Importa lockups aprobados desde `Logos OINADOM/` → `civis/public/brand/`.
 * Misma lógica que principal/scripts/import-approved-logos.mjs
 */
import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "..", "Logos OINADOM");
const OUT_DIR = join(ROOT, "public", "brand");

const PAIRS = [
  ["Logo OINADOM_verde.png", "logo-oinadom.webp"],
  ["Logo OINADOM_blanco.png", "logo-oinadom-white.webp"],
  ["Logo NA_verde.png", "logo-nueva-acropolis-stacked.webp"],
  ["Logo NA_blanco.png", "logo-nueva-acropolis-stacked-white.webp"],
];

function isBlackPixel(r, g, b, a, threshold = 28) {
  if (a < 128) return true;
  return r <= threshold && g <= threshold && b <= threshold;
}

async function stripBlackBackground(srcPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = channels === 4 ? data[o + 3] : 255;
    const d = i * 4;
    const transparent = isBlackPixel(r, g, b, a);

    out[d] = r;
    out[d + 1] = g;
    out[d + 2] = b;
    out[d + 3] = transparent ? 0 : a;
  }

  return sharp(out, { raw: { width, height, channels: 4 } });
}

mkdirSync(OUT_DIR, { recursive: true });

for (const [srcName, outName] of PAIRS) {
  const src = join(SRC_DIR, srcName);
  if (!existsSync(src)) {
    console.warn(`  ! falta fuente: ${srcName}`);
    continue;
  }
  const pipeline = await stripBlackBackground(src);
  const out = join(OUT_DIR, outName);
  const meta = await pipeline
    .webp({ lossless: true, effort: 6, alphaQuality: 100 })
    .toFile(out);
  console.log(`  + ${outName} (${meta.width}×${meta.height}, lossless)`);
}

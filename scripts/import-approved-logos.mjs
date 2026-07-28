/**
 * Importa lockups aprobados desde `Logos OINADOM/` → `public/brand/`.
 * - Fondo negro del kit → transparente (listo para header / heroes).
 * - WebP lossless (sin artefactos de compresión en texto fino).
 *
 * Uso: node scripts/import-approved-logos.mjs
 */
import sharp from "sharp";
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "..", "Logos OINADOM");
const OUT_DIR = join(ROOT, "public", "brand");

/** [archivo fuente, nombre webp destino] */
const PAIRS = [
  ["Logo OINADOM_verde.png", "logo-oinadom.webp"],
  ["Logo OINADOM_blanco.png", "logo-oinadom-white.webp"],
  ["Logo NA_verde.png", "logo-nueva-acropolis-stacked.webp"],
  ["Logo NA_blanco.png", "logo-nueva-acropolis-stacked-white.webp"],
];

const SYNC_DIRS = [
  join(ROOT, "..", "civis", "public", "brand"),
];

function isBlackPixel(r, g, b, a, threshold = 28) {
  if (a < 128) return true;
  return r <= threshold && g <= threshold && b <= threshold;
}

/** Quita el fondo negro sólido del kit de marca (no toca el verde/blanco del logo). */
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

/** Recorte superior del Logo NA — solo anagrama (sin «Nueva Acrópolis»). */
async function detectAnagramCropHeight(srcPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  function greenCount(y) {
    let count = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = channels === 4 ? data[i + 3] : 255;
      if (a < 128) continue;
      if (g > r + 8 && g > b + 5 && g > 60) count++;
    }
    return count;
  }

  const startY = Math.floor(height * 0.52);
  let prev = greenCount(startY);

  for (let y = startY + 1; y < Math.floor(height * 0.92); y++) {
    const cur = greenCount(y);
    // Banda horizontal del wordmark: salto brusco de píxeles verdes en fila ancha.
    if (cur > width * 0.28 && cur > prev * 1.22 && y > height * 0.62) {
      return Math.max(Math.floor(height * 0.58), y - 10);
    }
    prev = cur;
  }

  return Math.round(height * 0.674);
}

async function importNaSolo(colorSrcName, whiteSrcName) {
  for (const [srcName, outName] of [
    [colorSrcName, "logo-na-solo.webp"],
    [whiteSrcName, "logo-na-solo-white.webp"],
  ]) {
    const src = join(SRC_DIR, srcName);
    if (!existsSync(src)) {
      console.warn(`  ! falta fuente anagrama: ${srcName}`);
      continue;
    }
    const { width, height } = await sharp(src).metadata();
    const detected = await detectAnagramCropHeight(src);
    const bottomPad = Math.max(24, Math.round(height * 0.035));
    const cropH = Math.min(height, detected + bottomPad);
    const extracted = sharp(src).extract({
      left: 0,
      top: 0,
      width,
      height: cropH,
    });
    const tmpPath = join(OUT_DIR, `_tmp-${outName}.png`);
    await extracted.png().toFile(tmpPath);
    const pipeline = await stripBlackBackground(tmpPath);
    const out = join(OUT_DIR, outName);
    const meta = await pipeline
      .trim({ threshold: 8 })
      .extend({
        top: 4,
        bottom: 10,
        left: 4,
        right: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ lossless: true, effort: 6, alphaQuality: 100 })
      .toFile(out);
    unlinkSync(tmpPath);
    console.log(
      `  + ${outName} (${meta.width}×${meta.height}, anagrama NA, crop ${cropH}/${height}px)`,
    );
  }
}

async function importLockupFromTransparent(srcName, outName) {
  const src = join(SRC_DIR, srcName);
  if (!existsSync(src)) {
    console.warn(`  ! falta fuente: ${srcName}`);
    return null;
  }

  const out = join(OUT_DIR, outName);
  const meta = await sharp(src)
    .trim({ threshold: 12 })
    .webp({ lossless: true, effort: 6, alphaQuality: 100 })
    .toFile(out);

  console.log(`  + ${outName} (${meta.width}×${meta.height}, lossless)`);
  return meta;
}

async function importWhiteSilhouette(srcName, outName) {
  const src = join(SRC_DIR, srcName);
  if (!existsSync(src)) {
    console.warn(`  ! falta fuente: ${srcName}`);
    return null;
  }

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .trim({ threshold: 12 })
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
    const isBg = a < 16;
    const d = i * 4;
    out[d] = 255;
    out[d + 1] = 255;
    out[d + 2] = 255;
    out[d + 3] = isBg ? 0 : Math.round((a / 255) * 255);
  }

  const dest = join(OUT_DIR, outName);
  const meta = await sharp(out, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true, effort: 6, alphaQuality: 100 })
    .toFile(dest);

  console.log(`  + ${outName} (${meta.width}×${meta.height}, blanco)`);
  return meta;
}

async function importLockup(srcName, outName) {
  const src = join(SRC_DIR, srcName);
  if (!existsSync(src)) {
    console.warn(`  ! falta fuente: ${srcName}`);
    return null;
  }

  const pipeline = await stripBlackBackground(src);
  const out = join(OUT_DIR, outName);
  const meta = await pipeline
    .webp({ lossless: true, effort: 6, alphaQuality: 100 })
    .toFile(out);

  console.log(`  + ${outName} (${meta.width}×${meta.height}, lossless)`);
  return meta;
}

function syncOutputs() {
  const files = [
    ...PAIRS.map(([, out]) => out),
    "logo-na-solo.webp",
    "logo-na-solo-white.webp",
    "logo-esfera-punto-focal.webp",
    "logo-esfera-punto-focal-white.webp",
  ];
  for (const dir of SYNC_DIRS) {
    mkdirSync(dir, { recursive: true });
    for (const f of files) {
      const from = join(OUT_DIR, f);
      if (existsSync(from)) copyFileSync(from, join(dir, f));
    }
    console.log(`  · sincronizado → ${dir}`);
  }
}

mkdirSync(OUT_DIR, { recursive: true });

console.log("Importando lockups aprobados (fondo negro → α, WebP lossless)…\n");

for (const [srcName, outName] of PAIRS) {
  await importLockup(srcName, outName);
}

console.log("\nAnagrama NA (recorte del Logo NA)…");
await importNaSolo("Logo NA_verde.png", "Logo NA_blanco.png");

console.log("\nEsfera Punto Focal (kit OINADOM)…");
const ESFERA_SRC = "EsferaPuntoFocal_rgb_t-removebg-preview.png";
const ESFERA_FALLBACK = "EsferaPuntoFocal_rgb_t.png";
if (existsSync(join(SRC_DIR, ESFERA_SRC))) {
  await importLockupFromTransparent(ESFERA_SRC, "logo-esfera-punto-focal.webp");
  await importWhiteSilhouette(ESFERA_SRC, "logo-esfera-punto-focal-white.webp");
} else if (existsSync(join(SRC_DIR, ESFERA_FALLBACK))) {
  await importLockup(ESFERA_FALLBACK, "logo-esfera-punto-focal.webp");
  await importWhiteSilhouette(ESFERA_FALLBACK, "logo-esfera-punto-focal-white.webp");
} else {
  console.warn("  ! falta Esfera Punto Focal en Logos OINADOM/");
}

console.log("\nSincronizando…");
syncOutputs();

console.log("\nListo.");

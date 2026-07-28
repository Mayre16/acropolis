/**
 * Lockups OINA — WebP transparentes + variantes blancas.
 * Guía de marca v01/2025:
 *   na          → header (anagrama + «Nueva Acrópolis»)
 *   na-solo     → Contenido (solo monograma NA)
 *   oina        → Organización Internacional
 *   oinadom     → República Dominicana
 *   escuela     → Escuela de Filosofía / Diplomado
 *   trilogo     → Filosofía · Cultura · Voluntariado
 *
 * Uso: node scripts/generate-brand-variants.mjs
 */
import sharp from "sharp";
import { mkdirSync, copyFileSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = join(ROOT, "public", "brand");
const BIBLIOTECA_BRAND = join(ROOT, "..", "..", "Biblioteca-OINA", "public", "brand");
const CIVIS_BRAND = join(ROOT, "..", "civis", "public", "brand");

/** Quita blanco y preserva canal alpha (PNG/WebP oficiales). */
async function toTransparentWebp(srcPath, destPath) {
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
    const isWhite = r > 250 && g > 250 && b > 250;
    const d = i * 4;
    out[d] = r;
    out[d + 1] = g;
    out[d + 2] = b;
    out[d + 3] = isWhite ? 0 : Math.round((a / 255) * 255);
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(destPath);

  return sharp(destPath).metadata();
}

async function toWhiteSilhouette(srcPath, destPath) {
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
    const isBg = a < 16 || (r > 242 && g > 242 && b > 242);
    const d = i * 4;
    out[d] = 255;
    out[d + 1] = 255;
    out[d + 2] = 255;
    out[d + 3] = isBg ? 0 : Math.round((a / 255) * 255);
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(destPath);
}

async function fromPng(base) {
  const src = join(BRAND, `${base}.png`);
  if (!existsSync(src)) {
    console.warn("  (omitido — falta)", `${base}.png`);
    return null;
  }
  const meta = await toTransparentWebp(src, join(BRAND, `${base}.webp`));
  await toWhiteSilhouette(join(BRAND, `${base}.webp`), join(BRAND, `${base}-white.webp`));
  console.log(`  + ${base}.webp ${meta.width}x${meta.height} α + ${base}-white.webp`);
  return meta;
}

async function naSoloFromOina() {
  const src = join(BRAND, "logo-oina.png");
  if (!existsSync(src)) return;

  const tmp = join(BRAND, "_tmp-na-solo.png");
  await sharp(src)
    .extract({ left: 0, top: 0, width: 102, height: 112 })
    .trim({ threshold: 12 })
    .png()
    .toFile(tmp);

  const meta = await toTransparentWebp(tmp, join(BRAND, "logo-na-solo.webp"));
  await toWhiteSilhouette(join(BRAND, "logo-na-solo.webp"), join(BRAND, "logo-na-solo-white.webp"));
  unlinkSync(tmp);
  console.log(`  + logo-na-solo.webp ${meta.width}x${meta.height} α (monograma NA)`);
}

async function naHeaderFromAnagrama() {
  const src = join(BRAND, "logo-anagrama-mark.webp");
  if (!existsSync(src)) return;

  const meta = await sharp(src).metadata();
  if (meta.hasAlpha) {
    await toWhiteSilhouette(src, join(BRAND, "logo-anagrama-mark-white.webp"));
    console.log(`  · logo-anagrama-mark.webp ${meta.width}x${meta.height} (ya transparente)`);
    return;
  }

  const tmp = join(BRAND, "_tmp-anagrama-mark.webp");
  const dest = join(BRAND, "logo-anagrama-mark.webp");
  const out = await toTransparentWebp(src, tmp);
  copyFileSync(tmp, dest);
  unlinkSync(tmp);
  await toWhiteSilhouette(dest, join(BRAND, "logo-anagrama-mark-white.webp"));
  console.log(`  + logo-anagrama-mark.webp ${out.width}x${out.height} α (header)`);
}

async function esferaRedGlobal() {
  const src = join(BRAND, "logo-esfera-red-global.png");
  if (!existsSync(src)) return;
  const colorPath = join(BRAND, "logo-esfera-red-global.webp");
  const meta = await toTransparentWebp(src, colorPath);
  copyFileSync(colorPath, join(BRAND, "logo-esfera.webp"));
  await toWhiteSilhouette(colorPath, join(BRAND, "logo-esfera-red-global-white.webp"));
  console.log(`  + logo-esfera-red-global.webp ${meta.width}x${meta.height} α + logo-esfera-red-global-white.webp`);
}

function syncTo(dir) {
  mkdirSync(dir, { recursive: true });
  const files = [
    "logo-anagrama-mark.webp",
    "logo-anagrama-mark-white.webp",
    "logo-na-solo.webp",
    "logo-na-solo-white.webp",
    "logo-oina.webp",
    "logo-oina-white.webp",
    "logo-oinadom.webp",
    "logo-oinadom-white.webp",
    "logo-escuela.webp",
    "logo-escuela-white.webp",
    "trilogo.webp",
    "trilogo-white.webp",
    "logo-esfera-red-global.webp",
    "logo-esfera-red-global-white.webp",
    "logo-esfera.webp",
    "logo-oina.png",
    "logo-oinadom.png",
  ];
  for (const f of files) {
    const from = join(BRAND, f);
    if (existsSync(from)) copyFileSync(from, join(dir, f));
  }
}

async function main() {
  console.log("Generando lockups transparentes (guía OINA)…\n");
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, ["scripts/generate-brand-lockups.mjs"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

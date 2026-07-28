/**
 * Genera logo-oinadom.png — lockup país (NA + NUEVA ACRÓPOLIS + REPÚBLICA DOMINICANA).
 * Parte de logo-oina.png y respeta la banda inferior de la guía (§ Organización Internacional).
 *
 * Uso: node scripts/generate-oinadom-logo.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "public", "brand", "logo-oina.png");
const FONT = join(ROOT, "scripts", "fonts", "NotoSans-Bold.ttf");
const FONT_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-700-normal.ttf";

/** Medidas del lockup logo-oina (307×199) según guía de marca. */
const SCALE = 4;
const SRC_W = 307;
const SRC_H = 199;
const CROP_H = 158; // monograma + «NUEVA ACRÓPOLIS» + separación
const SUB_H = SRC_H - CROP_H; // banda inferior (≈ Organización Internacional)
const GREEN = "#086357";
const GREY = "#707070";

const OUT_DIRS = [
  join(ROOT, "public", "brand"),
  join(ROOT, "..", "..", "Biblioteca-OINA", "public", "brand"),
];

async function ensureFont() {
  if (existsSync(FONT)) return;
  mkdirSync(dirname(FONT), { recursive: true });
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`No se pudo descargar Noto Sans: ${res.status}`);
  writeFileSync(FONT, Buffer.from(await res.arrayBuffer()));
}

function fontBase64() {
  return readFileSync(FONT).toString("base64");
}

async function buildOinadom() {
  await ensureFont();
  const w = SRC_W * SCALE;
  const cropH = CROP_H * SCALE;
  const subH = SUB_H * SCALE;
  const totalH = SRC_H * SCALE;

  const top = await sharp(SOURCE)
    .resize(w, totalH, { kernel: sharp.kernel.lanczos3 })
    .extract({ left: 0, top: 0, width: w, height: cropH })
    .png()
    .toBuffer();

  const topB64 = top.toString("base64");
  const fontB64 = fontBase64();

  // Tamaño y tracking calibrados contra la banda de «ORGANIZACIÓN INTERNACIONAL».
  const fontSize = Math.round(11.5 * SCALE);
  const letterSpacing = 0.14 * fontSize;
  const textY = cropH + subH * 0.62;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Noto Sans';
        src: url('data:font/truetype;base64,${fontB64}') format('truetype');
        font-weight: 700;
        font-style: normal;
      }
    </style>
  </defs>
  <image href="data:image/png;base64,${topB64}" width="${w}" height="${cropH}" />
  <rect x="0" y="${cropH}" width="${w}" height="${subH}" fill="#ffffff"/>
  <text
    x="${w / 2}"
    y="${textY}"
    text-anchor="middle"
    font-family="Noto Sans, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="${GREY}"
    letter-spacing="${letterSpacing}px"
  >REPÚBLICA DOMINICANA</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const webp = await sharp(png).webp({ quality: 92 }).toBuffer();

  for (const dir of OUT_DIRS) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "logo-oinadom.png"), png);
    writeFileSync(join(dir, "logo-oinadom.webp"), webp);
    console.log("  +", join(dir, "logo-oinadom.png"));
    console.log("  +", join(dir, "logo-oinadom.webp"));
  }

  console.log(`\nListo (${w}×${totalH}px). Colores: título ${GREEN}, país ${GREY}.`);
}

buildOinadom().catch((err) => {
  console.error(err);
  process.exit(1);
});

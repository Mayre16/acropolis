/**
 * Regenera lockups OINA desde fuentes HD (guía v01/2025).
 * Anagrama + «NUEVA ACRÓPOLIS» + banda descriptora (Noto Sans 700, #707070).
 * El descriptor se estira/compacta al ancho medido del wordmark (textLength).
 *
 * Uso: node scripts/generate-brand-lockups.mjs
 */
import sharp from "sharp";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = join(ROOT, "public", "brand");
const PREVIEW_DIR = join(
  ROOT,
  "..",
  ".cursor",
  "skills",
  "na-brand-lockups",
  "references",
);
const ASSETS_CANDIDATES = [
  join(ROOT, "..", "..", "Biblioteca-OINA", "assets"),
  join(
    process.env.USERPROFILE ?? "",
    ".cursor",
    "projects",
    "c-Users-marth-Cursor-Projects-Biblioteca-OINA",
    "assets",
  ),
];

function resolveAssetsDir() {
  for (const dir of ASSETS_CANDIDATES) {
    if (dir && existsSync(dir)) return dir;
  }
  return ASSETS_CANDIDATES[0];
}

const FONT = join(ROOT, "scripts", "fonts", "NotoSans-Bold.ttf");
const FONT_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-700-normal.ttf";

const GREY = "#707070";

/** Referencia guía: lockup 307×199 px. */
const REF_W = 307;
const REF_H = 199;
const REF_TOP = 158;
const REF_SUB = REF_H - REF_TOP;
const TOP_RATIO = REF_TOP / REF_H;

/** Ancho canónico HD (alineado con _logo-check.png). */
const TARGET_W = 2429;

/** Descriptores oficiales (guía § Descriptores). */
export const LOCKUP_DESCRIPTORS = {
  oina: "ORGANIZACIÓN INTERNACIONAL",
  oinadom: "REPÚBLICA DOMINICANA",
  trilogo: "FILOSOFÍA • CULTURA • VOLUNTARIADO",
  escuela: "ESCUELA DE FILOSOFÍA",
};

/** Ajuste fino por lockup (calibrado contra referencias visuales). */
const DESCRIPTOR_TUNING = {
  oina: { fontScale: 1, textLengthScale: 1, textYRatio: 0.62, subHScale: 1 },
  oinadom: { fontScale: 1.22, textLengthScale: 1, textYRatio: 0.58, subHScale: 1.18 },
  escuela: { fontScale: 1, textLengthScale: 1, textYRatio: 0.62, subHScale: 1 },
  trilogo: { fontScale: 0.94, textLengthScale: 0.98, textYRatio: 0.64, subHScale: 1 },
};

const HI_RES = {
  oina: "_oina-lockup-check.png",
};

const FALLBACK_SOURCES = {
  "logo-oina.png":
    "c__Users_marth_AppData_Roaming_Cursor_User_workspaceStorage_c500178c995daed3dad8f656ed344ae5_images_image-6aa3d7eb-8db7-4fb3-9e81-36350d4dba1f.png",
};

const SYNC_DIRS = [
  join(ROOT, "..", "..", "Biblioteca-OINA", "public", "brand"),
  join(ROOT, "..", "civis", "public", "brand"),
  join(ROOT, "..", "tienda", "public", "brand"),
];

const MONO_CROP = { left: 0, top: 0, width: 108, height: 115 };

function scaledLayout(width = TARGET_W, tuning = DESCRIPTOR_TUNING.oina) {
  const scale = width / REF_W;
  const topH = Math.round(REF_TOP * scale);
  const subH = Math.round(REF_SUB * scale * (tuning.subHScale ?? 1));
  const totalH = topH + subH;
  const fontSize = Math.round(11.5 * scale * (tuning.fontScale ?? 1));
  return {
    width,
    topH,
    subH,
    totalH,
    fontSize,
    textY: topH + subH * (tuning.textYRatio ?? 0.62),
  };
}

function isGreenPixel(r, g, b, a) {
  if (a < 128) return false;
  return g > r + 12 && g > b + 8 && g > 70;
}

/**
 * Ancho horizontal del wordmark «NUEVA ACRÓPOLIS» en la parte superior del lockup.
 * Escanea la franja inferior del bloque (debajo del anagrama).
 */
async function measureWordmarkWidth(topPngBuffer) {
  const { data, info } = await sharp(topPngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const yStart = Math.floor(height * 0.56);
  let minX = width;
  let maxX = 0;

  for (let y = yStart; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isGreenPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }

  if (maxX <= minX) {
    return Math.round(width * 0.88);
  }
  return maxX - minX + 1;
}

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

function assetPath(name) {
  return join(resolveAssetsDir(), name);
}

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function toTransparentBuffer(input) {
  const { data, info } = await sharp(input)
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
    const isWhite = r > 248 && g > 248 && b > 248;
    const lum = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    const isLightGray = lum > 210 && sat < 22;
    const transparent = isWhite || isLightGray;
    const d = i * 4;
    out[d] = r;
    out[d + 1] = g;
    out[d + 2] = b;
    out[d + 3] = transparent ? 0 : Math.round((a / 255) * 255);
  }

  return sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

async function toWhiteBuffer(transparentPng) {
  const { data, info } = await sharp(transparentPng)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const a = data[o + 3];
    const d = i * 4;
    out[d] = 255;
    out[d + 1] = 255;
    out[d + 2] = 255;
    out[d + 3] = a;
  }

  return sharp(out, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true, effort: 6 })
    .toBuffer();
}

async function savePair(colorPng, baseName) {
  const transparent = await toTransparentBuffer(colorPng);
  const meta = await sharp(transparent).metadata();
  const colorPath = join(BRAND, `${baseName}.webp`);
  const whitePath = join(BRAND, `${baseName}-white.webp`);

  await sharp(transparent).webp({ lossless: true, effort: 6 }).toFile(colorPath);
  writeFileSync(whitePath, await toWhiteBuffer(transparent));

  return { width: meta.width, height: meta.height };
}

async function restoreOinaSource() {
  mkdirSync(BRAND, { recursive: true });
  const from = assetPath(HI_RES.oina);
  const to = join(BRAND, "logo-oina.png");
  if (existsSync(from)) {
    copyFileSync(from, to);
    console.log("  · logo-oina.png ← fuente HD");
    return;
  }
  const fb = assetPath(FALLBACK_SOURCES["logo-oina.png"]);
  if (existsSync(fb)) {
    copyFileSync(fb, to);
    console.warn("  ! logo-oina.png ← respaldo baja resolución");
  }
}

async function extractTopFromOina(targetW) {
  const src = join(BRAND, "logo-oina.png");
  if (!existsSync(src)) throw new Error("Falta logo-oina.png");

  const meta = await sharp(src).metadata();
  const srcW = meta.width ?? TARGET_W;
  const srcH = meta.height ?? Math.round(TARGET_W * (REF_H / REF_W));
  const topH = Math.round(srcH * TOP_RATIO);
  const layout = scaledLayout(targetW);

  return sharp(src)
    .extract({ left: 0, top: 0, width: srcW, height: topH })
    .resize(layout.width, layout.topH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
}

async function buildLockupWithDescriptor(baseName, lockupId, descriptor) {
  await ensureFont();
  const tuning = DESCRIPTOR_TUNING[lockupId] ?? DESCRIPTOR_TUNING.oina;
  const layout = scaledLayout(TARGET_W, tuning);
  const top = await extractTopFromOina(layout.width);
  const wordmarkWidth = await measureWordmarkWidth(top);
  const textLength = Math.round(wordmarkWidth * (tuning.textLengthScale ?? 1));
  const topB64 = top.toString("base64");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${layout.width}" height="${layout.totalH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Noto Sans';
        src: url('data:font/truetype;base64,${fontBase64()}') format('truetype');
        font-weight: 700;
        font-style: normal;
      }
    </style>
  </defs>
  <image href="data:image/png;base64,${topB64}" width="${layout.width}" height="${layout.topH}" />
  <rect x="0" y="${layout.topH}" width="${layout.width}" height="${layout.subH}" fill="#ffffff"/>
  <text
    x="${layout.width / 2}"
    y="${layout.textY}"
    text-anchor="middle"
    font-family="Noto Sans, sans-serif"
    font-weight="700"
    font-size="${layout.fontSize}"
    fill="${GREY}"
    textLength="${textLength}"
    lengthAdjust="spacingAndGlyphs"
  >${escapeXml(descriptor)}</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(BRAND, `${baseName}.png`), png);

  const meta = await savePair(png, baseName);
  console.log(
    `  + ${baseName}.webp ${meta.width}×${meta.height} α — ${descriptor} (textLength ${textLength}px)`,
  );
  return meta;
}

async function buildHeaderMark() {
  const stacked = join(BRAND, "logo-nueva-acropolis-stacked.webp");
  if (existsSync(stacked)) {
    const png = await sharp(stacked).png().toBuffer();
    const meta = await savePair(png, "logo-anagrama-mark");
    console.log(
      `  + logo-anagrama-mark.webp ${meta.width}×${meta.height} α ← stacked (wordmark continuo)`,
    );
    return meta;
  }

  const layout = scaledLayout(TARGET_W);
  const top = await extractTopFromOina(layout.width);
  const meta = await savePair(top, "logo-anagrama-mark");
  console.log(`  + logo-anagrama-mark.webp ${meta.width}×${meta.height} α (sin descriptor)`);
  return meta;
}

async function buildNaSolo() {
  const src = join(BRAND, "logo-oina.png");
  if (!existsSync(src)) return null;

  const srcMeta = await sharp(src).metadata();
  const scaleX = (srcMeta.width ?? TARGET_W) / REF_W;
  const scaleY = (srcMeta.height ?? scaledLayout().totalH) / REF_H;

  const cropped = await sharp(src)
    .extract({
      left: Math.round(MONO_CROP.left * scaleX),
      top: Math.round(MONO_CROP.top * scaleY),
      width: Math.round(MONO_CROP.width * scaleX),
      height: Math.round(MONO_CROP.height * scaleY),
    })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();

  const meta = await savePair(cropped, "logo-na-solo");
  console.log(`  + logo-na-solo.webp ${meta.width}×${meta.height} α`);
  return meta;
}

async function writePreviews() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const contexts = [
    { bg: "#ffffff", label: "blanco" },
    { bg: "#ed7e2a", label: "naranja-editorial" },
    { bg: "#1d2723", label: "separador-oscuro" },
  ];
  const widths = [420, 200, 168, 80];
  const lockups = [
    ["logo-oinadom.webp", "oinadom"],
    ["logo-oinadom-white.webp", "oinadom-white"],
    ["logo-escuela.webp", "escuela"],
    ["trilogo.webp", "trilogo"],
  ];

  for (const [src, id] of lockups) {
    const from = join(BRAND, src);
    if (!existsSync(from)) continue;
    for (const w of widths) {
      await sharp(from).resize({ width: w }).png().toFile(join(PREVIEW_DIR, `preview-${id}-${w}px.png`));
      for (const ctx of contexts) {
        const resized = await sharp(from).resize({ width: w }).png().toBuffer();
        const meta = await sharp(resized).metadata();
        const h = meta.height ?? Math.round(w * 0.65);
        await sharp({
          create: {
            width: w + 40,
            height: h + 40,
            channels: 3,
            background: ctx.bg,
          },
        })
          .composite([{ input: resized, top: 20, left: 20 }])
          .png()
          .toFile(join(PREVIEW_DIR, `preview-${id}-${w}px-${ctx.label}.png`));
      }
    }
  }

  const editorial = join(ROOT, "..", "tienda", "public", "brand", "identificadores", "editorial-identificador.webp");
  if (existsSync(editorial)) {
    for (const w of [600, 400, 280]) {
      const resized = await sharp(editorial).resize({ width: w }).png().toBuffer();
      const meta = await sharp(resized).metadata();
      const h = meta.height ?? Math.round(w * 0.35);
      await sharp(resized).toFile(join(PREVIEW_DIR, `preview-editorial-identificador-${w}px.png`));
      await sharp({
        create: { width: w + 40, height: h + 40, channels: 3, background: "#ed7e2a" },
      })
        .composite([{ input: resized, top: 20, left: 20 }])
        .png()
        .toFile(join(PREVIEW_DIR, `preview-editorial-header-${w}px.png`));
    }
  }

  console.log("  · vistas previas → .cursor/skills/na-brand-lockups/references/");
}

function syncAll() {
  const files = [
    "logo-oina.png",
    "logo-oinadom.png",
    "logo-escuela.png",
    "trilogo.png",
    "logo-oina.webp",
    "logo-oina-white.webp",
    "logo-oinadom.webp",
    "logo-oinadom-white.webp",
    "logo-escuela.webp",
    "logo-escuela-white.webp",
    "trilogo.webp",
    "trilogo-white.webp",
    "logo-anagrama-mark.webp",
    "logo-anagrama-mark-white.webp",
    "logo-nueva-acropolis-stacked.webp",
    "logo-nueva-acropolis-stacked-white.webp",
    "logo-na-solo.webp",
    "logo-na-solo-white.webp",
  ];

  for (const dir of SYNC_DIRS) {
    mkdirSync(dir, { recursive: true });
    for (const f of files) {
      const from = join(BRAND, f);
      if (existsSync(from)) copyFileSync(from, join(dir, f));
    }
    console.log(`  · sincronizado → ${dir}`);
  }
}

async function main() {
  console.log("Regenerando lockups OINA (descriptores alineados al wordmark)…\n");
  await restoreOinaSource();

  const top = await extractTopFromOina(TARGET_W);
  const wordmarkW = await measureWordmarkWidth(top);
  console.log(`  · ancho wordmark medido: ${wordmarkW}px @ ${TARGET_W}px\n`);

  const dims = {};
  dims.oina = await buildLockupWithDescriptor(
    "logo-oina",
    "oina",
    LOCKUP_DESCRIPTORS.oina,
  );
  dims.oinadom = await buildLockupWithDescriptor(
    "logo-oinadom",
    "oinadom",
    LOCKUP_DESCRIPTORS.oinadom,
  );
  dims.trilogo = await buildLockupWithDescriptor(
    "trilogo",
    "trilogo",
    LOCKUP_DESCRIPTORS.trilogo,
  );
  dims.escuela = await buildLockupWithDescriptor(
    "logo-escuela",
    "escuela",
    LOCKUP_DESCRIPTORS.escuela,
  );
  dims.na = await buildHeaderMark();
  dims["na-solo"] = await buildNaSolo();

  console.log("\nVistas previas…");
  await writePreviews();

  console.log("\nSincronizando…");
  syncAll();

  console.log("\nDimensiones finales:");
  for (const [k, m] of Object.entries(dims)) {
    if (m) console.log(`  ${k}: ${m.width}×${m.height}`);
  }
  console.log("\nListo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

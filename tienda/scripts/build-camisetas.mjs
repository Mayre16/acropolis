/**
 * Compone las camisetas: base (IA) + cita/título incrustado con tipografía nítida.
 * Recorta a cuadrado para la tarjeta de producto.
 *
 * Uso: npm run camisetas:build
 */
import path from "node:path";
import fs from "node:fs";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "scripts/regalos-src");
const OUT = path.join(ROOT, "public/img/regalos");

// Recorte cuadrado centrado en la camiseta (base 1536x1024).
const CROP = { left: 256, top: 0, width: 1024, height: 1024 };

const FONTS = {
  serif: "Georgia, 'Times New Roman', serif",
  script: "'Segoe Script', 'Brush Script MT', 'Comic Sans MS', cursive",
  impact: "Impact, 'Arial Narrow', 'Arial Black', sans-serif",
  sans: "Arial, sans-serif",
};

const FUERZAS = path.join(SRC, "fuerzas-vivas");

/** Pecho izquierdo (vista frontal plana) — tamaño bolsillo. */
const EMBLEM_POCKET = { left: 395, top: 305, width: 128 };

const ITEMS = [
  {
    key: "socrates",
    out: "camiseta-socrates",
    texts: [
      { t: "«Solo sé que", x: 660, y: 652, s: 42, font: "serif", style: "italic", weight: 700, fill: "#2f2b26" },
      { t: "no sé nada.»", x: 660, y: 698, s: 42, font: "serif", style: "italic", weight: 700, fill: "#2f2b26" },
      { t: "— Sócrates", x: 660, y: 748, s: 30, font: "sans", style: "italic", weight: 400, fill: "#4a443c" },
    ],
  },
  {
    key: "negra",
    out: "camiseta-platon",
    texts: [
      { t: "La medida de un hombre", x: 768, y: 372, s: 38, font: "script", weight: 400, fill: "#f5f3ec" },
      { t: "es aquello que lo hace feliz.", x: 768, y: 430, s: 38, font: "script", weight: 400, fill: "#f5f3ec" },
      { t: "— Platón", x: 905, y: 502, s: 40, font: "script", weight: 400, fill: "#f5f3ec" },
    ],
  },
  {
    key: "metaphysica",
    out: "camiseta-metaphysica",
    metaphysicaTitle: true,
  },
  {
    key: "fuerza-cisne",
    out: "camiseta-fuerza-cisne",
    base: "socrates",
    emblem: path.join(FUERZAS, "cisne.svg"),
    ...EMBLEM_POCKET,
  },
  {
    key: "fuerza-leon",
    out: "camiseta-fuerza-leon",
    base: "negra",
    emblem: path.join(FUERZAS, "leon.svg"),
    ...EMBLEM_POCKET,
  },
  {
    key: "fuerza-hacha",
    out: "camiseta-fuerza-hacha",
    base: "negra",
    emblem: path.join(FUERZAS, "hacha.svg"),
    left: 400,
    top: 298,
    width: 118,
  },
];

function svgFor(item) {
  const parts = item.texts.map((tx) => {
    const style = tx.style ? `font-style="${tx.style}" ` : "";
    const spacing = tx.spacing ? `letter-spacing="${tx.spacing}" ` : "";
    return `<text x="${tx.x}" y="${tx.y}" fill="${tx.fill}" font-family="${FONTS[tx.font]}" font-size="${tx.s}" font-weight="${tx.weight}" ${style}${spacing}text-anchor="middle">${tx.t}</text>`;
  });
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024">${parts.join("")}</svg>`,
  );
}

async function writeWebp(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");
  await sharp(pngPath).webp({ quality: 86, effort: 4 }).toFile(webpPath);
}

/** Quita el fondo oscuro del arte de catálogo (PNG con negro ~#111). */
async function darkBgToAlpha(buffer, { threshold = 38 } = {}) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.max(data[i], data[i + 1], data[i + 2]);
    if (lum <= threshold) data[i + 3] = 0;
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

/** Título del catálogo → blanco nítido sobre camiseta negra. */
async function titleInkToWhite(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

/** Metaphysica: mockup + título METAPHYSICA estilo Metallica del arte de catálogo. */
async function buildMetaphysicaTee(item) {
  const basePath = path.join(SRC, `tee-base-${item.key}.png`);
  const catalogPath = path.join(SRC, "tee-metaphysica-catalog.png");
  if (!fs.existsSync(basePath)) {
    console.warn("Falta base:", basePath);
    return;
  }
  if (!fs.existsSync(catalogPath)) {
    console.warn("Falta arte catálogo:", catalogPath);
    return;
  }

  const titleWidth = 560;
  const titleLeft = 768 - Math.round(titleWidth / 2);
  const titleTop = 158;

  const titleLayer = await titleInkToWhite(
    await darkBgToAlpha(
      await sharp(catalogPath)
        .extract({ left: 0, top: 0, width: 1024, height: 298 })
        .resize({ width: titleWidth, kernel: sharp.kernel.lanczos3 })
        .png()
        .toBuffer(),
    ),
  );

  const composed = await sharp(basePath)
    .composite([{ input: titleLayer, left: titleLeft, top: titleTop }])
    .png()
    .toBuffer();

  const pngOut = path.join(OUT, `${item.out}.png`);
  const out = await sharp(composed).extract(CROP).png().toFile(pngOut);
  await writeWebp(pngOut);
  console.log("Camiseta (metaphysica):", `${item.out}.png`, `${out.width}x${out.height}`);
}

async function buildEmblemTee(item) {
  const base = path.join(SRC, `tee-base-${item.base}.png`);
  if (!fs.existsSync(base)) {
    console.warn("Falta base:", base);
    return;
  }
  if (!fs.existsSync(item.emblem)) {
    console.warn("Falta emblema:", item.emblem);
    return;
  }

  const emblemBuf = await sharp(item.emblem)
    .resize({ width: item.width, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const composed = await sharp(base)
    .composite([{ input: emblemBuf, left: item.left, top: item.top }])
    .png()
    .toBuffer();

  const pngOut = path.join(OUT, `${item.out}.png`);
  const out = await sharp(composed).extract(CROP).png().toFile(pngOut);
  await writeWebp(pngOut);
  console.log("Camiseta (emblema):", `${item.out}.png`, `${out.width}x${out.height}`);
}

async function build() {
  for (const item of ITEMS) {
    if (item.emblem) {
      await buildEmblemTee(item);
      continue;
    }

    if (item.metaphysicaTitle) {
      await buildMetaphysicaTee(item);
      continue;
    }

    if (item.catalogSrc) {
      const catalog = path.join(SRC, item.catalogSrc);
      if (!fs.existsSync(catalog)) {
        console.warn("Falta catálogo:", item.catalogSrc);
        continue;
      }
      const bg = item.catalogBg ?? "#ededed";
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      const out = await sharp(catalog)
        .resize(1024, 1024, {
          fit: "contain",
          background: { r, g, b, alpha: 1 },
        })
        .png()
        .toFile(path.join(OUT, `${item.out}.png`));
      const pngOut = path.join(OUT, `${item.out}.png`);
      await writeWebp(pngOut);
      console.log("Camiseta (catálogo):", `${item.out}.png`, `${out.width}x${out.height}`);
      continue;
    }

    const base = path.join(SRC, `tee-base-${item.key}.png`);
    if (!fs.existsSync(base)) {
      console.warn("Falta base:", base);
      continue;
    }

    if (!item.texts?.length) {
      const pngOut = path.join(OUT, `${item.out}.png`);
      const out = await sharp(base).extract(CROP).png().toFile(pngOut);
      await writeWebp(pngOut);
      console.log("Camiseta (base):", `${item.out}.png`, `${out.width}x${out.height}`);
      continue;
    }

    const composed = await sharp(base)
      .composite([{ input: svgFor(item), top: 0, left: 0 }])
      .png()
      .toBuffer();

    const pngOut = path.join(OUT, `${item.out}.png`);
    const out = await sharp(composed)
      .extract(CROP)
      .png()
      .toFile(pngOut);

    await writeWebp(pngOut);
    console.log("Camiseta:", `${item.out}.png`, `${out.width}x${out.height}`);
  }
}

build();

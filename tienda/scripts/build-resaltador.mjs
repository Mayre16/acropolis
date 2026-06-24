/**
 * Compone la foto del resaltador triple: foto base + lockup OINA (con país)
 * y lema «Ilumina las ideas» sobre la cara blanca del triángulo.
 *
 * Uso: npm run resaltador:build
 */
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = path.join(ROOT, "scripts/regalos-src/resaltador-base.png");
const OINADOM = path.join(ROOT, "public/brand/logo-oinadom.webp");
const OUT = path.join(ROOT, "public/img/regalos/resaltador-ideas.png");

const TEAL = "#1f5a4e";
const TAGLINE_FONT =
  "Georgia, 'Palatino Linotype', 'Times New Roman', serif";
/** Centro de la cara blanca del triángulo en la base 1536×1024. */
const CX = 768;
/** Ancho del lockup — más grande para leer «República Dominicana». */
const LOCKUP_WIDTH = 228;

async function build() {
  const lockupBuf = await sharp(OINADOM)
    .resize({ width: LOCKUP_WIDTH })
    .png()
    .toBuffer();
  const lockupMeta = await sharp(lockupBuf).metadata();
  const lockupLeft = Math.round(CX - (lockupMeta.width ?? LOCKUP_WIDTH) / 2);
  const lockupTop = 334;

  const textSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024">
  <text x="${CX}" y="678" fill="${TEAL}" font-family="${TAGLINE_FONT}" font-size="54" font-style="italic" font-weight="600" letter-spacing="1.5" text-anchor="middle">Ilumina</text>
  <text x="${CX}" y="742" fill="${TEAL}" font-family="${TAGLINE_FONT}" font-size="54" font-style="italic" font-weight="600" letter-spacing="1.5" text-anchor="middle">las ideas</text>
</svg>`);

  const composed = await sharp(BASE)
    .composite([
      { input: lockupBuf, top: lockupTop, left: lockupLeft },
      { input: textSvg, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  const out = await sharp(composed)
    .extract({ left: 384, top: 0, width: 768, height: 1024 })
    .png()
    .toFile(OUT);

  const webpOut = OUT.replace(/\.png$/i, ".webp");
  await sharp(OUT).webp({ quality: 84, effort: 4 }).toFile(webpOut);

  console.log("Resaltador:", `${out.width}x${out.height}`);
  console.log("  WebP →", webpOut);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});

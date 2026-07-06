import sharp from "sharp";

const src =
  "c:/Users/marth/Cursor Projects/acropolis.org.do/principal/public/brand/logo-nueva-acropolis-stacked.webp";
const outStacked =
  "c:/Users/marth/Cursor Projects/acropolis.org.do/civis/public/brand/logo-nueva-acropolis-stacked.webp";
const outOina =
  "c:/Users/marth/Cursor Projects/acropolis.org.do/civis/public/brand/logo-nueva-acropolis-oina.webp";

const trimmed = await sharp(src).trim().toBuffer({ resolveWithObject: true });
const lw = trimmed.info.width;
const lh = trimmed.info.height;
const padX = 40;
const textH = 72;
const gap = 18;
const canvasW = lw + padX * 2;
const canvasH = lh + gap + textH + 20;

const textSvg = Buffer.from(`<svg width="${canvasW}" height="${textH}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="52" text-anchor="middle" font-family="'Noto Sans', Arial, sans-serif" font-weight="700" font-size="34" letter-spacing="8" fill="#009485">ORGANIZACI&#211;N INTERNACIONAL</text>
</svg>`);

await sharp({
  create: {
    width: canvasW,
    height: canvasH,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: trimmed.data, top: 0, left: Math.round((canvasW - lw) / 2) },
    { input: textSvg, top: lh + gap, left: 0 },
  ])
  .webp({ quality: 92 })
  .toFile(outOina);

await sharp(src).webp({ quality: 92 }).toFile(outStacked);

const meta = await sharp(outOina).metadata();
console.log("created", outOina, `${meta.width}x${meta.height}`);

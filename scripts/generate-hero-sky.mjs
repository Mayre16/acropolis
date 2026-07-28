/**
 * Cielo de respaldo con textura (nebulosa + miles de estrellas).
 * El hero debe usar hero-bg.png de Framer; esto es fallback.
 * Uso: node scripts/generate-hero-sky.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/img/diplomado/landing");
const size = 860;

function rnd(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = rnd(42);

const nebulaBlobs = [
  { cx: 0.35, cy: 0.22, rx: 0.45, ry: 0.35, color: "88, 60, 140", op: 0.35 },
  { cx: 0.62, cy: 0.18, rx: 0.38, ry: 0.28, color: "40, 90, 130", op: 0.4 },
  { cx: 0.5, cy: 0.42, rx: 0.55, ry: 0.25, color: "30, 70, 110", op: 0.28 },
  { cx: 0.2, cy: 0.35, rx: 0.3, ry: 0.22, color: "50, 40, 100", op: 0.25 },
  { cx: 0.78, cy: 0.38, rx: 0.32, ry: 0.2, color: "25, 55, 95", op: 0.22 },
];

let nebulaSvg = "";
for (const b of nebulaBlobs) {
  const cx = b.cx * size;
  const cy = b.cy * size;
  const rx = b.rx * size;
  const ry = b.ry * size;
  nebulaSvg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(${b.color},${b.op})"/>`;
}

const milkyWay = `<ellipse cx="${size * 0.5}" cy="${size * 0.32}" rx="${size * 0.55}" ry="${size * 0.12}" fill="rgba(180, 200, 255, 0.06)" transform="rotate(-12 ${size * 0.5} ${size * 0.32})"/>`;

const starDots = [];
for (let i = 0; i < 2200; i++) {
  const x = rand() * size;
  const y = rand() * size * 0.72;
  const r = 0.35 + rand() * 1.4;
  const op = 0.15 + rand() * 0.75;
  starDots.push(
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${op.toFixed(2)}"/>`,
  );
}

const brightStars = [];
for (let i = 0; i < 45; i++) {
  const x = rand() * size;
  const y = rand() * size * 0.65;
  const r = 1.2 + rand() * 2.2;
  brightStars.push(
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fffef8" opacity="0.95"/>`,
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 2.5).toFixed(1)}" fill="rgba(255,255,255,0.12)"/>`,
  );
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="deep" cx="50%" cy="35%" r="85%">
      <stop offset="0%" stop-color="#1a0e3a"/>
      <stop offset="35%" stop-color="#0c2848"/>
      <stop offset="70%" stop-color="#063a42"/>
      <stop offset="100%" stop-color="#021f1c"/>
    </radialGradient>
    <filter id="grain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="8" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.04  0 0 0 0 0.08  0 0 0 0.15 0" result="g"/>
      <feBlend in="SourceGraphic" in2="g" mode="screen"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#deep)" filter="url(#grain)"/>
  ${milkyWay}
  ${nebulaSvg}
  ${starDots.join("\n  ")}
  ${brightStars.join("\n  ")}
  <rect width="100%" height="100%" fill="url(#deep)" opacity="0.25"/>
</svg>`;

fs.mkdirSync(outDir, { recursive: true });
const svgPath = path.join(outDir, "hero-sky-rich.svg");
const webpPath = path.join(outDir, "hero-sky-rich.webp");

fs.writeFileSync(svgPath, svg);
await sharp(Buffer.from(svg))
  .webp({ quality: 90 })
  .toFile(webpPath);

console.log("wrote", webpPath);

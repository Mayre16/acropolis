import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = "c:\\Users\\marth\\Cursor Projects\\acropolis.org.do\\principal";
const FONTS = "c:\\Users\\marth\\Cursor Projects\\Biblioteca-OINA\\scripts\\_fonts";
const OUTDIR = path.join(ROOT, "public", "brand", "identificadores");

const logoB64 = fs.readFileSync(path.join(ROOT, "public/brand/logo-nueva-acropolis-stacked-white.png")).toString("base64");
const logoHref = `data:image/png;base64,${logoB64}`;

const W = 720, H = 126;
const dark = "#0A5F54";
const light1 = "#13917F";
const light2 = "#18AC95";

// logo (aspect 2.182) en bloque izquierdo
const logoH = 78, logoW = Math.round(logoH * 2429 / 1113), logoX = 34, logoY = (H - logoH) / 2;

// contenido derecho centrado
const iconX = 404, iconY = 31, iconS = 64;
const textX = iconX + iconS + 22;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${light1}"/>
      <stop offset="1" stop-color="${light2}"/>
    </linearGradient>
    <clipPath id="round"><rect x="0" y="0" width="${W}" height="${H}" rx="18" ry="18"/></clipPath>
  </defs>
  <g clip-path="url(#round)">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#rg)"/>
    <path d="M0,0 H322 C300,34 300,92 278,${H} L0,${H} Z" fill="${dark}"/>
    <path d="M322,0 C300,34 300,92 278,${H}" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="2"/>
    <image href="${logoHref}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet"/>
    <g transform="translate(${iconX},${iconY})" fill="#ffffff">
      <polygon points="2,26 32,4 62,26"/>
      <rect x="3" y="27" width="58" height="6" rx="1"/>
      <rect x="8" y="35" width="7" height="18" rx="1"/>
      <rect x="22" y="35" width="7" height="18" rx="1"/>
      <rect x="35" y="35" width="7" height="18" rx="1"/>
      <rect x="49" y="35" width="7" height="18" rx="1"/>
      <rect x="3" y="54" width="58" height="5" rx="1"/>
      <rect x="0" y="60" width="64" height="5" rx="2"/>
    </g>
    <text x="${textX}" y="49" font-family="Noto Sans" font-weight="600" font-size="15" letter-spacing="4" fill="#ffffff">CONSULTING</text>
    <text x="${textX}" y="96" font-family="Noto Sans" font-weight="900" font-size="46" letter-spacing="1" fill="#ffffff">CIVIS</text>
  </g>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: W * 2 },
  font: {
    fontFiles: [
      path.join(FONTS, "NotoSans-Regular.ttf"),
      path.join(FONTS, "NotoSans-Medium.ttf"),
      path.join(FONTS, "NotoSans-Bold.ttf"),
      path.join(FONTS, "NotoSans-Black.ttf"),
    ],
    loadSystemFonts: false,
    defaultFontFamily: "Noto Sans",
  },
});
const pngBuf = resvg.render().asPng();

fs.mkdirSync(OUTDIR, { recursive: true });
const outPng = path.join(OUTDIR, "submarca-civis-consulting.png");
const outWebp = path.join(OUTDIR, "submarca-civis-consulting.webp");
await sharp(pngBuf).png({ compressionLevel: 9 }).toFile(outPng);
await sharp(pngBuf).webp({ quality: 92 }).toFile(outWebp);

// preview a 1x para revisar
await sharp(pngBuf).resize({ width: W }).png().toFile(path.join(ROOT, "scripts", "_preview_civis.png"));

const m = await sharp(outPng).metadata();
console.log("PNG", m.width + "x" + m.height, Math.round(fs.statSync(outPng).size / 1024) + "kb");
console.log("WEBP", Math.round(fs.statSync(outWebp).size / 1024) + "kb");

/**
 * Descarga assets originales del Framer (landing Diplomado).
 *
 * Hero collage (capas separadas — NO usar hero-mobile.jpg en el collage):
 *   hero-bg.png      → cielo / nebulosa (sin figuras)
 *   hero-layer.png   → pirámides (PNG con alpha)
 *   hero-buddha.png  → figura izquierda (PNG con alpha)
 *   hero-accent.png  → figura derecha / filósofo (PNG con alpha)
 *
 * Móvil: slots en constellation-hero--mobile (430px, aspect 99/100)
 * Web:   slots en constellation-hero--desktop (≥1024px, aspect 4/3)
 *
 * Uso: node scripts/download-framer-diplomado-assets.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/img/diplomado/landing");

const ASSETS = {
  "hero-bg.png": "https://framerusercontent.com/images/7A31bBXQM6WsyKZ8BoU0PBG1DM.png?width=1200",
  "hero-layer.png": "https://framerusercontent.com/images/AN9VfYD4NEMMUSFUpmms6RFaGE.png?width=1200",
  "hero-accent.png": "https://framerusercontent.com/images/3vVbpgnJRUBrbd3WbkX0VoOiSeM.png?width=1200",
  "hero-buddha.png": "https://framerusercontent.com/images/henpDZYa42cDMSiVw3sMmURkMI.png?width=1500",
  "about.png": "https://framerusercontent.com/images/henpDZYa42cDMSiVw3sMmURkMI.png?width=1200",
  "modulo-01.png": "https://framerusercontent.com/images/YA5jINfAQRKVQDYoCvZsC491GI.png?width=1200",
  "modulo-02.png": "https://framerusercontent.com/images/Jko9qeePSwVLSR4uPLo6X8A68.png?width=1200",
  "modulo-03.png": "https://framerusercontent.com/images/GSdJ2UhbRyoMXhKr8btSHiymGBI.png?width=1200",
  "logo-small-1.png": "https://framerusercontent.com/images/6HeqUi7jEZ4OaspoVPeIOYRlpo.png?width=350",
  "logo-small-2.png": "https://framerusercontent.com/images/rkCe9Plnx6xpj7SQUNVLWwESCM.png?width=350",
};

fs.mkdirSync(outDir, { recursive: true });

for (const [name, url] of Object.entries(ASSETS)) {
  const dest = path.join(outDir, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log("skip", name);
    continue;
  }
  const res = await fetch(url);
  if (!res.ok) {
    console.error("fail", name, res.status);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log("ok", name, buf.length);
}

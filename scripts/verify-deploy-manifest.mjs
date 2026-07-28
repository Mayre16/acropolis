/**
 * Lista lo mínimo que debe existir en public_html tras subir `out/`.
 * Uso: node scripts/verify-deploy-manifest.mjs
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out");

function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) n += countFiles(full);
    else n += 1;
  }
  return n;
}

function findWebpackChunk() {
  const dir = join(OUT, "na-assets", "static", "chunks");
  if (!existsSync(dir)) return null;
  for (const name of readdirSync(dir)) {
    if (name.startsWith("webpack-") && name.endsWith(".js")) {
      return join("na-assets", "static", "chunks", name);
    }
  }
  return null;
}

const webpackRel = findWebpackChunk();

const checks = [
  [".htaccess", "Reglas Apache (HTTPS, rutas, seguridad)"],
  ["index.html", "Página de inicio"],
  ...(webpackRel
    ? [[webpackRel, "Runtime webpack (JS principal)"]]
    : []),
  ["404.html", "Página de error"],
  ["brand/logo-nueva-acropolis-stacked.webp", "Logo header"],
  ["img/cultura/talleres/teatro.webp", "Imagen home/cultura"],
  ["img/filosofia/diplomado/diplomado-01.webp", "Imagen diplomado"],
];

console.log("Verificación deploy — carpeta out/\n");
let ok = 0;
for (const [rel, label] of checks) {
  const full = join(OUT, rel);
  const exists = existsSync(full);
  if (exists) ok += 1;
  console.log(`${exists ? "✓" : "✗"} ${rel} — ${label}`);
}

const nextCount = countFiles(join(OUT, "na-assets"));
const imgCount = countFiles(join(OUT, "img"));
console.log("");
console.log(`na-assets/: ${nextCount} archivo(s)`);
console.log(`img/:   ${imgCount} archivo(s)`);
console.log("");
if (ok === checks.length && nextCount > 0 && imgCount > 0) {
  console.log("Listo para subir TODO el contenido de out/ a public_html.");
  console.log("IMPORTANTE: los JS/CSS van en na-assets/ (no _next/). El .htaccess redirige _next por compatibilidad.");
} else {
  console.log("Faltan archivos — ejecuta npm run build:cpanel antes de subir.");
  process.exit(1);
}

/**
 * Paquete mínimo para actualizar solo /diplomado en cPanel (sin reemplazar todo el sitio).
 * Uso: node scripts/pack-diplomado-cpanel.mjs
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const PATCH = join(ROOT, "deploy", "diplomado-patch");
const stamp = new Date().toISOString().slice(0, 10);
const ZIP = join(ROOT, "deploy", `diplomado-patch-${stamp}.zip`);

if (!existsSync(join(OUT, "diplomado", "index.html"))) {
  console.error("Falta out/diplomado — ejecuta antes: npm run build:cpanel");
  process.exit(1);
}

function copyRel(src, dest = src) {
  const from = join(OUT, src);
  const to = join(PATCH, dest);
  if (!existsSync(from)) {
    console.warn("  (omitido, no existe)", src);
    return;
  }
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log("  +", dest);
}

/** Rutas estáticas referenciadas en el HTML del diplomado. */
function assetsFromHtml() {
  const html = readFileSync(join(OUT, "diplomado", "index.html"), "utf8");
  const paths = new Set();
  for (const m of html.matchAll(/(?:href|src)="(\/[^"?#]+)"/g)) {
    const p = m[1].replace(/^\//, "").replace(/\\/g, "/");
    if (
      p.startsWith("_next/") ||
      p.startsWith("img/diplomado/") ||
      p.startsWith("brand/")
    ) {
      paths.add(p);
    }
  }
  return [...paths];
}

function countFiles(dir) {
  let n = 0;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

console.log("Empaquetando actualización diplomado…\n");

rmSync(PATCH, { recursive: true, force: true });
mkdirSync(PATCH, { recursive: true });

console.log("Carpetas fijas:");
copyRel("diplomado");
copyRel("img/diplomado");

const landingDir = join(PATCH, "img/diplomado/landing");
const landingCount = existsSync(landingDir) ? countFiles(landingDir) : 0;
if (landingCount < 15) {
  console.error(
    `\nERROR: img/diplomado/landing tiene solo ${landingCount} archivos (se esperan ≥15).`,
  );
  console.error("Vuelve a ejecutar: npm run build:cpanel");
  process.exit(1);
}
console.log(`  ✓ img/diplomado/landing — ${landingCount} archivos`);

console.log("\nAssets referenciados en diplomado/index.html:");
for (const p of assetsFromHtml()) {
  copyRel(p);
}

console.log("\nCreando ZIP…");
if (process.platform === "win32") {
  const zip = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${PATCH}\\*' -DestinationPath '${ZIP}' -Force`,
    ],
    { stdio: "inherit" },
  );
  if (zip.status !== 0) process.exit(zip.status ?? 1);
} else {
  const zip = spawnSync("zip", ["-r", ZIP, "."], { cwd: PATCH, stdio: "inherit" });
  if (zip.status !== 0) process.exit(zip.status ?? 1);
}

const size = statSync(ZIP).size;
console.log("");
console.log("Listo para subir a public_html (extraer encima de lo existente):");
console.log("  Carpeta:", PATCH);
console.log("  ZIP:    ", ZIP);
console.log("  Tamaño: ", (size / 1024 / 1024).toFixed(2), "MB");
console.log("");
console.log("URL: https://acropolis.adesa.com.do/diplomado/");

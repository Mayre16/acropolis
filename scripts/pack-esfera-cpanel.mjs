/**
 * Paquete mínimo para actualizar solo /esfera en cPanel (sin reemplazar todo el sitio).
 * Uso: npm run build:cpanel && npm run pack:esfera
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const PATCH = join(ROOT, "deploy", "esfera-patch");
const stamp = new Date().toISOString().slice(0, 10);
const ZIP = join(ROOT, "deploy", `esfera-patch-${stamp}.zip`);

if (!existsSync(join(OUT, "esfera", "index.html"))) {
  console.error("Falta out/esfera — ejecuta antes: npm run build:cpanel");
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

/** Assets referenciados en el HTML de una ruta estática. */
function assetsFromHtml(relHtml) {
  const html = readFileSync(join(OUT, relHtml), "utf8");
  const paths = new Set();
  for (const m of html.matchAll(/(?:href|src)="(\/[^"?#]+)"/g)) {
    const p = m[1].replace(/^\//, "").replace(/\\/g, "/");
    if (
      p.startsWith("_next/") ||
      p.startsWith("img/esfera/") ||
      p.startsWith("brand/")
    ) {
      paths.add(p);
    }
  }
  return [...paths];
}

console.log("Empaquetando actualización Esfera…\n");

rmSync(PATCH, { recursive: true, force: true });
mkdirSync(PATCH, { recursive: true });

console.log("Carpetas fijas:");
copyRel("esfera");
copyRel("img/esfera");

const assetPaths = new Set();
for (const html of ["esfera/index.html", "esfera/solicitud/index.html"]) {
  if (existsSync(join(OUT, html))) {
    for (const p of assetsFromHtml(html)) assetPaths.add(p);
  }
}

console.log("\nAssets referenciados en esfera:");
for (const p of assetPaths) {
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
console.log("URL: https://acropolis.org.do/esfera/");

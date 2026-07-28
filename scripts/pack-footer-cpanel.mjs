/**
 * Paquete para actualizar el footer en todas las páginas (HTML estático).
 * Uso: npm run build:cpanel && node scripts/pack-footer-cpanel.mjs
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
import { join, dirname, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const PATCH = join(ROOT, "deploy", "footer-patch");
const stamp = new Date().toISOString().slice(0, 10);
const ZIP = join(ROOT, "deploy", `footer-patch-${stamp}.zip`);

const MARKER = "Filosofía, Cultura y Voluntariado.";

function walkHtml(dir, files = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, files);
    else if (ent.name.endsWith(".html")) files.push(p);
  }
  return files;
}

const sample = join(OUT, "index.html");
if (!existsSync(sample)) {
  console.error("Falta out/ — ejecuta: npm run build:cpanel");
  process.exit(1);
}
if (!readFileSync(sample, "utf8").includes(MARKER)) {
  console.error("El build no tiene el footer nuevo. Revisa Footer.tsx y vuelve a build.");
  process.exit(1);
}

rmSync(PATCH, { recursive: true, force: true });
mkdirSync(PATCH, { recursive: true });

let count = 0;
for (const file of walkHtml(OUT)) {
  const rel = relative(OUT, file);
  const dest = join(PATCH, rel);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(file, dest);
  count += 1;
}

console.log(`Copiados ${count} HTML con footer nuevo.`);

if (process.platform === "win32") {
  spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${PATCH}\\*' -DestinationPath '${ZIP}' -Force`,
    ],
    { stdio: "inherit" },
  );
} else {
  spawnSync("zip", ["-r", ZIP, "."], { cwd: PATCH, stdio: "inherit" });
}

console.log("");
console.log("ZIP footer:", ZIP);
console.log("Tamaño:", (statSync(ZIP).size / 1024 / 1024).toFixed(2), "MB");
console.log("Extrae en public_html (fusionar carpetas index.html de cada ruta).");

/**
 * Build de producción + ZIP para subir a cPanel (editor.acropolis.adesa.com.do).
 *
 * Uso:
 *   npm run build:cpanel
 *   NEXT_PUBLIC_CMS_API_URL=https://editor.acropolis.adesa.com.do/api npm run build:cpanel
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const NEXT = join(ROOT, ".next");
const DEPLOY = join(ROOT, "deploy");

const editorUrl =
  process.env.NEXT_PUBLIC_EDITOR_URL?.trim() ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://editor.acropolis.adesa.com.do";

const cmsApiUrl =
  process.env.NEXT_PUBLIC_CMS_API_URL?.trim() ||
  `${editorUrl.replace(/\/$/, "")}/api`;

const principalUrl =
  process.env.NEXT_PUBLIC_PRINCIPAL_URL?.trim() ||
  "https://acropolis.adesa.com.do";

const civisUrl =
  process.env.NEXT_PUBLIC_CIVIS_URL?.trim() ||
  "https://civis.acropolis.adesa.com.do";

const tiendaUrl =
  process.env.NEXT_PUBLIC_TIENDA_URL?.trim() ||
  "https://tienda.acropolis.adesa.com.do";

const env = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_PUBLIC_SITE_URL: editorUrl.replace(/\/$/, ""),
  NEXT_PUBLIC_CMS_API_URL: cmsApiUrl.replace(/\/$/, ""),
  NEXT_PUBLIC_PRINCIPAL_URL: principalUrl.replace(/\/$/, ""),
  NEXT_PUBLIC_CIVIS_URL: civisUrl.replace(/\/$/, ""),
  NEXT_PUBLIC_TIENDA_URL: tiendaUrl.replace(/\/$/, ""),
};

console.log("Build cPanel Editor —", env.NEXT_PUBLIC_SITE_URL);
console.log("  CMS API:", env.NEXT_PUBLIC_CMS_API_URL);
console.log("  Principal:", env.NEXT_PUBLIC_PRINCIPAL_URL);
console.log("  Civis:", env.NEXT_PUBLIC_CIVIS_URL);
console.log("  Tienda:", env.NEXT_PUBLIC_TIENDA_URL);

for (const dir of [OUT, NEXT]) {
  if (existsSync(dir)) {
    console.log("Limpiando", dir.replace(ROOT, "").replace(/\\/g, "/") || "/");
    rmSync(dir, { recursive: true, force: true });
  }
}

const build = spawnSync("npm", ["run", "build"], {
  cwd: ROOT,
  env,
  stdio: "inherit",
  shell: true,
});

if (build.status !== 0) process.exit(build.status ?? 1);

const prepare = spawnSync("node", ["scripts/prepare-cpanel-export.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if (prepare.status !== 0) process.exit(prepare.status ?? 1);

mkdirSync(DEPLOY, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const zipBase = `acropolis-editor-${stamp}`;

const zip = spawnSync("node", ["scripts/zip-deploy.mjs", zipBase], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if (zip.status !== 0) process.exit(zip.status ?? 1);

const zipPath = join(DEPLOY, `${zipBase}.zip`);
const assetsZipPath = join(DEPLOY, `${zipBase}-assets.zip`);

console.log("");
console.log("Listo para cPanel (public_html de editor.acropolis.adesa.com.do):");
console.log("  1. Borra o respalda el contenido anterior (conserva data/ y api/config.php)");
console.log("  2. Sube y extrae:", zipPath);
console.log("     Si JS/CSS fallan, sube también:", assetsZipPath);
console.log("  3. Verifica .htaccess, api/, na-assets/");
console.log("  4. data/ debe tener permisos de escritura (published.json, uploads/)");
console.log("  5. Prueba login y /api/health o publicar");
console.log("");
console.log("  Carpeta:", OUT);
console.log("  ZIP:     ", zipPath);
console.log("  Assets:  ", assetsZipPath);

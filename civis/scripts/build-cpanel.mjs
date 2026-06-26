/**
 * Build de producción + ZIP para subir a cPanel (subdominio civis).
 *
 * Uso:
 *   npm run build:cpanel
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run build:cpanel
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const DEPLOY = join(ROOT, "deploy");

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://civis.acropolis.adesa.com.do";

const principalUrl =
  process.env.NEXT_PUBLIC_PRINCIPAL_URL?.trim() ||
  "https://acropolis.adesa.com.do";

const cmsUrl =
  process.env.NEXT_PUBLIC_CMS_URL?.trim() ||
  "https://editor.acropolis.adesa.com.do/api";

const env = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_PUBLIC_SITE_URL: siteUrl.replace(/\/$/, ""),
  NEXT_PUBLIC_PRINCIPAL_URL: principalUrl.replace(/\/$/, ""),
  NEXT_PUBLIC_CMS_URL: cmsUrl.replace(/\/$/, ""),
};

console.log("Build cPanel Civis — NEXT_PUBLIC_SITE_URL =", env.NEXT_PUBLIC_SITE_URL);
console.log("  CMS:", env.NEXT_PUBLIC_CMS_URL);
if (env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
  console.log("  Turnstile: site key definida");
} else {
  console.warn("  Turnstile: sin NEXT_PUBLIC_TURNSTILE_SITE_KEY — formularios sin captcha en producción");
}

const build = spawnSync("npm", ["run", "build"], {
  cwd: ROOT,
  env,
  stdio: "inherit",
  shell: true,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const prepare = spawnSync("node", ["scripts/prepare-cpanel-export.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if (prepare.status !== 0) {
  process.exit(prepare.status ?? 1);
}

mkdirSync(DEPLOY, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const zipBase = `acropolis-civis-${stamp}`;

const zip = spawnSync("node", ["scripts/zip-deploy.mjs", zipBase], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if (zip.status !== 0) {
  process.exit(zip.status ?? 1);
}

const zipPath = join(DEPLOY, `${zipBase}.zip`);
const assetsZipPath = join(DEPLOY, `${zipBase}-assets.zip`);

console.log("");
console.log("Listo para cPanel (subida completa desde cero):");
console.log("  1. cPanel → Administrador de archivos → public_html del subdominio");
console.log("     civis.acropolis.adesa.com.do");
console.log("  2. Borra el contenido anterior (o mueve a backup)");
console.log("  3. Sube y extrae:", zipPath);
console.log("     Si JS/CSS siguen en 404, sube SOLO:", assetsZipPath);
console.log("     (extrae en public_html → debe crear na-assets/static/chunks/)");
console.log("     — o sube todo el contenido de:", OUT);
console.log("  4. Verifica que exista .htaccess en la raíz");
console.log("  5. CRÍTICO: confirma na-assets/static/chunks/ y na-assets/static/css/ con archivos.");
console.log("     (El build renombra _next → na-assets para evitar problemas de cPanel con _).");
console.log("  6. Verifica img/ y brand/ en la raíz.");
console.log("  7. Prueba: /na-assets/static/chunks/webpack-*.js → debe dar 200");
console.log("");
console.log("  Carpeta:", OUT);
console.log("  ZIP:     ", zipPath);
console.log("  Assets:  ", assetsZipPath);

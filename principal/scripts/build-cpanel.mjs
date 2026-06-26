/**
 * Build de producción + ZIP para subir a cPanel (public_html) desde cero.
 *
 * Uso:
 *   npm run build:cpanel
 *   NEXT_PUBLIC_SITE_URL=https://acropolis.adesa.com.do npm run build:cpanel
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run build:cpanel
 *   NEXT_PUBLIC_GSC_VERIFICATION=... npm run build:cpanel
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const NEXT = join(ROOT, ".next");
const DEPLOY = join(ROOT, "deploy");

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://acropolis.adesa.com.do";

const cmsUrl =
  process.env.NEXT_PUBLIC_CMS_URL?.trim() ||
  "https://editor.acropolis.adesa.com.do/api";

const env = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_PUBLIC_PLATFORMS_DEV: "false",
  NEXT_PUBLIC_SITE_URL: siteUrl.replace(/\/$/, ""),
  NEXT_PUBLIC_CMS_URL: cmsUrl.replace(/\/$/, ""),
};

console.log("Build cPanel (desde cero) — NEXT_PUBLIC_SITE_URL =", env.NEXT_PUBLIC_SITE_URL);
console.log("  CMS:", env.NEXT_PUBLIC_CMS_URL);
if (env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
  console.log("  Turnstile: site key definida");
} else {
  console.warn("  Turnstile: sin NEXT_PUBLIC_TURNSTILE_SITE_KEY — formularios sin captcha en producción");
}
if (env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
  console.log("  GA4:", env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}
if (env.NEXT_PUBLIC_GSC_VERIFICATION) {
  console.log("  Search Console: meta verification definida");
}

for (const dir of [OUT, NEXT]) {
  if (existsSync(dir)) {
    console.log("Limpiando", dir.replace(ROOT, "").replace(/\\/g, "/") || "/");
    rmSync(dir, { recursive: true, force: true });
  }
}

const brand = spawnSync("npm", ["run", "brand:lockups"], {
  cwd: ROOT,
  env,
  stdio: "inherit",
  shell: true,
});

if (brand.status !== 0) {
  process.exit(brand.status ?? 1);
}

const fetchFeed = spawnSync("node", ["scripts/fetch_mundo_feed.mjs"], {
  cwd: ROOT,
  env,
  stdio: "inherit",
  shell: true,
});

if (fetchFeed.status !== 0) {
  process.exit(fetchFeed.status ?? 1);
}

const prunePublic = spawnSync("node", ["scripts/prune-public-assets.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if (prunePublic.status !== 0) {
  process.exit(prunePublic.status ?? 1);
}

const build = spawnSync("npx", ["next", "build"], {
  cwd: ROOT,
  env,
  stdio: "inherit",
  shell: true,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const prune = spawnSync("node", ["scripts/prune-deploy-assets.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if (prune.status !== 0) {
  process.exit(prune.status ?? 1);
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
const zipBase = `acropolis-principal-${stamp}`;

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
console.log("  1. En cPanel → Administrador de archivos → public_html del subdominio");
console.log("     (acropolis.adesa.com.do — acropolis.org.do sigue siendo WordPress)");
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

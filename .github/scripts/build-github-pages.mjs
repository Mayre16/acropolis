#!/usr/bin/env node
/**
 * Build principal, civis y tienda con basePath para GitHub Pages
 * (https://mayre16.github.io/acropolis/…)
 */
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = join(import.meta.dirname, "../..");
const OUT_ROOT = join(ROOT, ".pages-site");
const GITHUB_USER = process.env.GITHUB_PAGES_USER?.trim() || "mayre16";
const REPO_NAME = process.env.GITHUB_PAGES_REPO?.trim() || "acropolis";
const ORIGIN = `https://${GITHUB_USER}.github.io`;
const PAGES_BASE = `/${REPO_NAME}`;

const sites = [
  {
    dir: "principal",
    basePath: `${PAGES_BASE}/principal`,
    env: {
      NEXT_PUBLIC_SITE_URL: `${ORIGIN}${PAGES_BASE}/principal`,
      NEXT_PUBLIC_CIVIS_URL: `${ORIGIN}${PAGES_BASE}/civis`,
      NEXT_PUBLIC_TIENDA_URL: `${ORIGIN}${PAGES_BASE}/tienda`,
      NEXT_PUBLIC_CMS_URL: "",
    },
  },
  {
    dir: "civis",
    basePath: `${PAGES_BASE}/civis`,
    env: {
      NEXT_PUBLIC_SITE_URL: `${ORIGIN}${PAGES_BASE}/civis`,
      NEXT_PUBLIC_PRINCIPAL_URL: `${ORIGIN}${PAGES_BASE}/principal`,
      NEXT_PUBLIC_TIENDA_URL: `${ORIGIN}${PAGES_BASE}/tienda`,
      NEXT_PUBLIC_CMS_URL: "",
    },
  },
  {
    dir: "tienda",
    basePath: `${PAGES_BASE}/tienda`,
    env: {
      NEXT_PUBLIC_SITE_URL: `${ORIGIN}${PAGES_BASE}/tienda`,
      NEXT_PUBLIC_PRINCIPAL_URL: `${ORIGIN}${PAGES_BASE}/principal`,
      NEXT_PUBLIC_CIVIS_URL: `${ORIGIN}${PAGES_BASE}/civis`,
      NEXT_PUBLIC_STORE_API_URL: "https://biblioteca-oina.adesa.com.do",
      NEXT_PUBLIC_CMS_URL: "",
    },
  },
];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function prepareCivisEditorData() {
  const src = join(ROOT, "principal/data/acropolis/published.json");
  const destDir = join(ROOT, "editor/data/acropolis");
  const dest = join(destDir, "published.json");
  if (!existsSync(src)) {
    console.error("Falta principal/data/acropolis/published.json para build de Civis");
    process.exit(1);
  }
  mkdirSync(destDir, { recursive: true });
  cpSync(src, dest);
}

rmSync(OUT_ROOT, { recursive: true, force: true });
mkdirSync(OUT_ROOT, { recursive: true });
cpSync(join(ROOT, ".github/pages-preview/index.html"), join(OUT_ROOT, "index.html"));

prepareCivisEditorData();

for (const site of sites) {
  console.log(`\n=== Build ${site.dir} (basePath ${site.basePath}) ===\n`);
  run("npm", ["ci"], { cwd: join(ROOT, site.dir) });
  run("npm", ["run", "build"], {
    cwd: join(ROOT, site.dir),
    env: {
      ...process.env,
      ...site.env,
      NEXT_PUBLIC_BASE_PATH: site.basePath,
    },
  });
  const slug = site.dir;
  cpSync(join(ROOT, site.dir, "out"), join(OUT_ROOT, slug), { recursive: true });
}

console.log("\nSitio listo en:", OUT_ROOT);

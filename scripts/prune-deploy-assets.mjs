/**
 * Quita del export estático lo que no debe ir a cPanel (basura, fuentes de build, duplicados).
 * Uso: node scripts/prune-deploy-assets.mjs [directorio]
 */
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(ROOT, "out");

/** PNG de lockups — en web solo se sirven los .webp (BrandLogo). */
const BRAND_PNG_LOCKUPS = new Set([
  "logo-oina.png",
  "logo-oinadom.png",
  "logo-escuela.png",
  "trilogo.png",
]);

let removed = 0;
let savedBytes = 0;

function remove(file) {
  const size = statSync(file).size;
  unlinkSync(file);
  removed += 1;
  savedBytes += size;
  console.log(`  − ${file.replace(target, "").replace(/\\/g, "/")} (${(size / 1024 / 1024).toFixed(2)} MB)`);
}

function shouldDrop(name, rel) {
  const lower = name.toLowerCase();
  const norm = rel.replace(/\\/g, "/");
  if (lower.endsWith(".zip") || lower.endsWith(".tmp")) return true;
  if (name.startsWith("_debug") || name.startsWith("_tmp")) return true;
  if (name.endsWith("-full.png")) return true;
  if (
    (norm.startsWith("brand/") || norm.includes("/brand/")) &&
    BRAND_PNG_LOCKUPS.has(name)
  ) {
    return true;
  }
  return false;
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    const rel = full.slice(target.length + 1);
    if (shouldDrop(name, rel)) remove(full);
  }
}

console.log("Poda deploy:", target);
walk(target);
console.log(
  `Listo: ${removed} archivo(s), −${(savedBytes / 1024 / 1024).toFixed(2)} MB`,
);

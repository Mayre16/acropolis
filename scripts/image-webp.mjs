/**
 * Utilidades compartidas: descargar imagen remota y guardar como WebP local.
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";

export const WEBP_QUALITY = 82;

export function slugFromUrl(url) {
  const name = basename(new URL(url).pathname).replace(/\.[^.]+$/, "");
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Descarga URL y guarda WebP. Devuelve ruta pública (/img/...). */
export async function downloadAsWebp(url, destDir, publicSubdir, filename) {
  mkdirSync(destDir, { recursive: true });
  const outName = filename.endsWith(".webp") ? filename : `${filename}.webp`;
  const outFile = join(destDir, outName);
  const publicPath = `/${publicSubdir}/${outName}`.replace(/\\/g, "/");

  if (existsSync(outFile)) {
    return publicPath;
  }

  const res = await fetch(url, {
    headers: { "User-Agent": "AcropolisRD-ImageProxy/1.0" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .webp({ quality: WEBP_QUALITY, effort: 4, smartSubsample: true })
    .toFile(outFile);

  return publicPath;
}

/** Convierte buffer o archivo existente a WebP en destino. */
export async function bufferToWebp(input, outFile) {
  await sharp(input)
    .webp({ quality: WEBP_QUALITY, effort: 4, smartSubsample: true })
    .toFile(outFile);
}

/**
 * Redimensiona/comprime las fotos que PageSpeed marca como sobredimensionadas.
 * Uso: node scripts/optimize-pagespeed-images.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Display ≈ ×2 retina, alineado a slots CMS (card 800×500, hero 1600×900). */
const JOBS = [
  {
    rel: "public/img/home/filosofia-para-vivir.webp",
    width: 1600,
    height: 1067,
    quality: 72,
  },
  {
    rel: "public/img/home/grecia.webp",
    width: 1000,
    height: 750,
    quality: 72,
  },
  {
    rel: "public/img/eventos/feria-salud.webp",
    width: 800,
    height: 500,
    quality: 72,
  },
  {
    rel: "public/img/home/hero-voluntarios-chalecos.webp",
    width: 1600,
    height: 900,
    quality: 74,
  },
  {
    rel: "public/img/cultura/talleres/teatro.webp",
    width: 800,
    height: 500,
    quality: 72,
  },
  {
    rel: "public/img/eventos/santiago.webp",
    width: 800,
    height: 500,
    quality: 72,
  },
  {
    rel: "public/brand/logo-esfera-punto-focal.webp",
    width: 640,
    height: 272,
    quality: 78,
    fit: "inside",
  },
];

function kib(n) {
  return `${(n / 1024).toFixed(1)} KiB`;
}

for (const job of JOBS) {
  const file = path.join(ROOT, job.rel);
  if (!fs.existsSync(file)) {
    console.warn("SKIP missing", job.rel);
    continue;
  }
  const before = fs.statSync(file).size;
  const meta = await sharp(file).metadata();
  const fit = job.fit ?? "cover";
  const buf = await sharp(file)
    .resize(job.width, job.height, {
      fit,
      position: "centre",
      withoutEnlargement: true,
    })
    .webp({ quality: job.quality, effort: 5 })
    .toBuffer();
  // No agrandar el archivo si la salida pesa más
  if (buf.length >= before && (meta.width ?? 0) <= job.width) {
    // Solo recomprimir
    const recompressed = await sharp(file)
      .webp({ quality: job.quality, effort: 5 })
      .toBuffer();
    if (recompressed.length < before) {
      const tmp = `${file}.opt.webp`;
      fs.writeFileSync(tmp, recompressed);
      try {
        fs.unlinkSync(file);
      } catch {
        /* ignore */
      }
      fs.renameSync(tmp, file);
      const afterMeta = await sharp(file).metadata();
      console.log(
        `${job.rel}: ${meta.width}x${meta.height} ${kib(before)} → ${afterMeta.width}x${afterMeta.height} ${kib(recompressed.length)} (recompress)`,
      );
    } else {
      console.log(`${job.rel}: sin cambio (ya óptimo)`);
    }
    continue;
  }
  const stagingDir = path.join(ROOT, "scripts", "_img-opt");
  const staging = path.join(stagingDir, job.rel.replace(/^public[\\/]/, ""));
  fs.mkdirSync(path.dirname(staging), { recursive: true });
  fs.writeFileSync(staging, buf);
  try {
    fs.copyFileSync(staging, file);
  } catch {
    console.warn(
      `WARN: no se pudo sobrescribir ${job.rel} (archivo bloqueado). Quedó en ${staging}`,
    );
    continue;
  }
  fs.unlinkSync(staging);
  const afterMeta = await sharp(file).metadata();
  console.log(
    `${job.rel}: ${meta.width}x${meta.height} ${kib(before)} → ${afterMeta.width}x${afterMeta.height} ${kib(buf.length)}`,
  );
}

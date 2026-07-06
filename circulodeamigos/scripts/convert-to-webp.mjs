/**
 * Convierte JPG/PNG de public/ a WebP y actualiza referencias en el código.
 *
 * Uso: npm run images:webp
 */
import sharp from "sharp";
import {
  readdirSync,
  statSync,
  unlinkSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, extname, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const SOURCE_DIRS = ["app", "components", "lib"];
const QUALITY = 82;
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png"]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      // El banner Civis se exporta con npm run identificador:export
      if (relative(PUBLIC, full).replace(/\\/g, "/") === "brand/identificadores") {
        continue;
      }
      out.push(...walk(full));
    } else if (IMAGE_EXT.has(extname(name).toLowerCase())) out.push(full);
  }
  return out;
}

function toWebpPath(file) {
  return file.replace(/\.(jpe?g|png)$/i, ".webp");
}

function publicPath(file) {
  return "/" + relative(PUBLIC, file).replace(/\\/g, "/");
}

async function convertOne(file) {
  const webp = toWebpPath(file);
  const before = statSync(file).size;

  await sharp(file)
    .webp({ quality: QUALITY, effort: 4, smartSubsample: true })
    .toFile(webp);

  const after = statSync(webp).size;
  unlinkSync(file);
  return { before, after, from: publicPath(file), to: publicPath(webp) };
}

function updateSourceRefs(mapping) {
  const exts = ["ts", "tsx"];
  let filesUpdated = 0;
  let replacements = 0;

  for (const dir of SOURCE_DIRS) {
    const base = join(ROOT, dir);
    for (const file of walkSource(base, exts)) {
      let text = readFileSync(file, "utf8");
      let changed = false;

      for (const { from, to } of mapping) {
        if (text.includes(from)) {
          text = text.split(from).join(to);
          changed = true;
          replacements += 1;
        }
      }

      if (changed) {
        writeFileSync(file, text, "utf8");
        filesUpdated += 1;
      }
    }
  }

  return { filesUpdated, replacements };
}

function walkSource(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkSource(full, exts));
    else if (exts.includes(extname(name).slice(1))) out.push(full);
  }
  return out;
}

const files = walk(PUBLIC);
console.log(`Convirtiendo ${files.length} imágenes a WebP (calidad ${QUALITY})…`);

let totalBefore = 0;
let totalAfter = 0;
const mapping = [];

for (const file of files) {
  const result = await convertOne(file);
  totalBefore += result.before;
  totalAfter += result.after;
  mapping.push({ from: result.from, to: result.to });
  const pct = Math.round((1 - result.after / result.before) * 100);
  console.log(
    `  ${result.from} → ${result.to}  (${Math.round(result.before / 1024)}KB → ${Math.round(result.after / 1024)}KB, −${pct}%)`,
  );
}

const { filesUpdated, replacements } = updateSourceRefs(mapping);

// Favicon: actualizar tipo MIME si se convirtió icon-na
const layoutPath = join(ROOT, "app", "layout.tsx");
let layout = readFileSync(layoutPath, "utf8");
if (layout.includes('type: "image/png"') && layout.includes("icon-na.webp")) {
  layout = layout.replace('type: "image/png"', 'type: "image/webp"');
  writeFileSync(layoutPath, layout, "utf8");
}

console.log("");
console.log(
  `Total: ${Math.round(totalBefore / 1024 / 1024)} MB → ${Math.round(totalAfter / 1024 / 1024)} MB (−${Math.round((1 - totalAfter / totalBefore) * 100)}%)`,
);
console.log(`Referencias actualizadas: ${replacements} en ${filesUpdated} archivos.`);

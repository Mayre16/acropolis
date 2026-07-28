/**
 * Descarga las fotos del feed Instagram (home) y las guarda como WebP local.
 * Uso: node scripts/localize-instagram-images.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { downloadAsWebp } from "./image-webp.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = join(ROOT, "public", "img", "instagram");
const HOME = join(ROOT, "lib", "home-content.ts");

const SOURCES = [
  "https://www.acropolis.org.do/wp-content/uploads/2026/06/383.png",
  "https://www.acropolis.org.do/wp-content/uploads/2026/06/382.png",
  "https://www.acropolis.org.do/wp-content/uploads/2026/06/381.png",
  "https://www.acropolis.org.do/wp-content/uploads/2026/06/380.png",
  "https://www.acropolis.org.do/wp-content/uploads/2026/06/379-1.png",
  "https://www.acropolis.org.do/wp-content/uploads/2026/05/5.png",
];

const FILES = [
  "383.webp",
  "382.webp",
  "381.webp",
  "380.webp",
  "379-1.webp",
  "05-5.webp",
];

const posts = [];
for (let i = 0; i < SOURCES.length; i++) {
  const publicPath = await downloadAsWebp(
    SOURCES[i],
    DEST,
    "img/instagram",
    FILES[i],
  );
  posts.push(publicPath);
  console.log(`  ${SOURCES[i]} → ${publicPath}`);
}

const block = `/** Publicaciones recientes — imágenes locales (WebP) del feed Instagram RD. */
export const INSTAGRAM_POSTS: InstagramPost[] = [
${posts
  .map(
    (src) => `  {
    src: "${src}",
    alt: "Publicación reciente de @nuevaacropolisdominicana",
    href: "https://www.instagram.com/nuevaacropolisdominicana/",
  }`,
  )
  .join(",\n")}
];`;

let text = readFileSync(HOME, "utf8");
text = text.replace(
  /\/\*\* Base de medios del sitio acropolis\.org\.do[\s\S]*?export const ACROPOLIS_RD_MEDIA =[\s\S]*?\n\n/,
  "",
);
text = text.replace(
  /\/\*\* Publicaciones recientes[\s\S]*?export const INSTAGRAM_POSTS: InstagramPost\[\] = \[[\s\S]*?\];/,
  block,
);

writeFileSync(HOME, text, "utf8");
console.log("Actualizado lib/home-content.ts");

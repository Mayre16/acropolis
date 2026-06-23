/**
 * Obtiene publicaciones recientes de @nuevaacropolisdominicana,
 * descarga thumbnails locales y actualiza lib/home-content.ts.
 *
 * Uso: node scripts/fetch-instagram-posts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { downloadAsWebp } from "./image-webp.mjs";

const USERNAME = "nuevaacropolisdominicana";
const PROFILE_URL = `https://www.instagram.com/${USERNAME}/`;
const MAX_POSTS = 6;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = join(ROOT, "public", "img", "instagram");
const HOME = join(ROOT, "lib", "home-content.ts");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const SEARCH_QUERIES = [
  "nuevaacropolisdominicana instagram",
  "nueva acropolis dominicana instagram post",
  "nuevaacropolisdominicana instagram p",
  `@${USERNAME} instagram`,
];

/** Fallback cuando DDG/Instagram bloquean descubrimiento automático. */
const SEED_SHORTCODES = [
  "DTCD1NHjusg",
  "C9vFlxtvJCl",
  "DBCAWHxN9KE",
  "DF2xM_5uMgW",
  "DML_C8Rvrxa",
  "DJNajckqkUA",
];

async function discoverShortcodesFromProfile() {
  const res = await fetch(PROFILE_URL, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
  });
  if (!res.ok) return [];
  const html = await res.text();
  return extractShortcodes(html);
}

async function discoverShortcodesFromSearch() {
  const seen = new Set();
  const codes = [];

  for (const query of SEARCH_QUERIES) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) continue;
    const html = await res.text();
    for (const code of extractShortcodes(html)) {
      if (seen.has(code)) continue;
      seen.add(code);
      codes.push(code);
    }
    await sleep(400);
  }

  return codes;
}

function extractShortcodes(html) {
  const seen = new Set();
  const codes = [];
  for (const re of [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/g,
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/g,
    /"shortcode":"([A-Za-z0-9_-]+)"/g,
  ]) {
    for (const m of html.matchAll(re)) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      codes.push(m[1]);
    }
  }
  return codes;
}

async function resolveThumbnailUrl(shortcode) {
  const postUrl = `https://www.instagram.com/p/${shortcode}/`;
  const mediaRes = await fetch(`${postUrl}media/?size=l`, {
    headers: { "User-Agent": UA },
    redirect: "manual",
  });
  const location = mediaRes.headers.get("location");
  if (mediaRes.status >= 300 && mediaRes.status < 400 && location) {
    return location;
  }

  const embedRes = await fetch(`${postUrl}embed/captioned/`, {
    headers: { "User-Agent": UA },
  });
  if (!embedRes.ok) return null;
  const embedHtml = await embedRes.text();
  const match =
    embedHtml.match(/src="(https:\/\/[^"]+\.jpg[^"]*)"/) ??
    embedHtml.match(/srcset="(https:\/\/[^"\s]+)/);
  return match?.[1]?.replace(/&amp;/g, "&") ?? null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRecentPosts() {
  const seen = new Set();
  const shortcodes = [];

  for (const code of [
    ...(await discoverShortcodesFromProfile()),
    ...(await discoverShortcodesFromSearch()),
  ]) {
    if (seen.has(code)) continue;
    seen.add(code);
    shortcodes.push(code);
    if (shortcodes.length >= MAX_POSTS) break;
  }

  if (shortcodes.length === 0) {
    console.warn("  Descubrimiento automático vacío — usando lista verificada.");
    for (const code of SEED_SHORTCODES) {
      if (seen.has(code)) continue;
      seen.add(code);
      shortcodes.push(code);
      if (shortcodes.length >= MAX_POSTS) break;
    }
  }

  if (shortcodes.length === 0) {
    throw new Error(
      "No se encontraron publicaciones de @nuevaacropolisdominicana.",
    );
  }

  const posts = [];
  for (const code of shortcodes.slice(0, MAX_POSTS)) {
    const thumbUrl = await resolveThumbnailUrl(code);
    if (!thumbUrl) {
      console.warn(`  Sin thumbnail para /p/${code}/ — se omite`);
      continue;
    }

    const file = `${code}.webp`;
    const publicPath = await downloadAsWebp(
      thumbUrl,
      DEST,
      "img/instagram",
      file,
    );
    posts.push({
      src: publicPath,
      alt: `Publicación de @${USERNAME} en Instagram`,
      href: `https://www.instagram.com/p/${code}/`,
    });
    console.log(`  /p/${code}/ → ${publicPath}`);
    await sleep(500);
  }

  if (posts.length === 0) {
    throw new Error("No se pudieron descargar thumbnails de Instagram.");
  }

  return posts;
}

const posts = await fetchRecentPosts();

const block = `/** Publicaciones recientes — @${USERNAME} (imágenes locales WebP). */
export const INSTAGRAM_POSTS: InstagramPost[] = [
${posts
  .map(
    (p) => `  {
    src: "${p.src}",
    alt: "${p.alt}",
    href: "${p.href}",
  }`,
  )
  .join(",\n")}
];`;

let text = readFileSync(HOME, "utf8");
text = text.replace(
  /\/\*\* Publicaciones recientes[\s\S]*?export const INSTAGRAM_POSTS: InstagramPost\[\] = \[[\s\S]*?\];/,
  block,
);

writeFileSync(HOME, text, "utf8");
console.log(`Actualizado lib/home-content.ts (${posts.length} publicaciones)`);
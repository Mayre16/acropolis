/**
 * Obtiene publicaciones recientes de @nuevaacropolisdominicana,
 * descarga thumbnails locales y actualiza lib/home-content.ts.
 *
 * Solo acepta shortcodes cuyo autor verificado sea USERNAME
 * (evita posts ajenos que DuckDuckGo a veces mezcla en la búsqueda).
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

/** Fallback cuando Instagram bloquea descubrimiento automático. */
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

/** Confirma que el post pertenece a @USERNAME (embed HTML). */
async function shortcodeBelongsToAccount(shortcode) {
  const embedRes = await fetch(
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    { headers: { "User-Agent": UA } },
  );
  if (!embedRes.ok) return false;
  const html = await embedRes.text();
  const users = new Set();
  for (const m of html.matchAll(/instagram\.com\/([A-Za-z0-9._]+)\//g)) {
    const u = m[1].toLowerCase();
    if (
      [
        "p",
        "reel",
        "reels",
        "stories",
        "accounts",
        "static",
        "about",
        "v",
        "rsrc.php",
      ].includes(u)
    ) {
      continue;
    }
    users.add(u);
  }
  const jsonUser = html.match(/"username"\s*:\s*"([^"]+)"/i)?.[1]?.toLowerCase();
  if (jsonUser) users.add(jsonUser);
  return users.has(USERNAME.toLowerCase());
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
  const candidates = [];

  for (const code of [
    ...(await discoverShortcodesFromProfile()),
    ...SEED_SHORTCODES,
  ]) {
    if (seen.has(code)) continue;
    seen.add(code);
    candidates.push(code);
  }

  if (candidates.length === 0) {
    throw new Error(
      "No se encontraron publicaciones de @nuevaacropolisdominicana.",
    );
  }

  const posts = [];
  for (const code of candidates) {
    if (posts.length >= MAX_POSTS) break;

    const ok = await shortcodeBelongsToAccount(code);
    if (!ok) {
      console.warn(`  Omitido /p/${code}/ — no es de @${USERNAME}`);
      await sleep(300);
      continue;
    }

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

try {
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
} catch (err) {
  // CI diario: no tumbar el job si Instagram bloquea; se mantienen las fotos actuales.
  console.warn(
    "Advertencia Instagram:",
    err instanceof Error ? err.message : String(err),
  );
  console.warn("Se conservan las publicaciones ya existentes en home-content.ts.");
  process.exitCode = 0;
}

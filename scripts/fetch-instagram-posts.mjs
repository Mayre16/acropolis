/**
 * Obtiene publicaciones recientes de @nuevaacropolisdominicana,
 * descarga thumbnails locales y actualiza lib/home-content.ts.
 *
 * Reglas (Instagram a menudo bloquea verificación de autor):
 * - ok === true  → aceptar (autor confirmado)
 * - ok === false → rechazar (otra cuenta)
 * - ok === null  → solo aceptar si está en ALLOWLIST (curada a mano)
 *
 * Nunca confiar en shortcodes “descubiertos” sin autor confirmado.
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

/**
 * Shortcodes verificados visualmente como de @nuevaacropolisdominicana (RD).
 * NO incluir posts de otras sedes, medios o cuentas ajenas.
 * Actualizar a mano cuando se confirmen posts nuevos.
 */
const ALLOWLIST = [
  // Recientes (jul 2026) — verificados en perfil @nuevaacropolisdominicana
  "DbZKn1SEo-K",
  "DbV9sNdEs9y",
  "DbSy-n9lebg",
  "DbRyjM4kruj",
  "DbHMYWzkrhL",
  "DbA6LIXEhMZ",
  "Da3ih2UkmeF",
  "Da3cNbQErY9",
  "DZuvpbzkqax",
  "DavokKXElyr",
  // Anteriores confirmados RD
  "DAd3eCqNDj_",
  "C9vFlxtvJCl",
  "DML_C8Rvrxa",
  "DJNajckqkUA",
  "DFiqGiAPqCb",
  "DJQCfRUty9X",
];

const ALLOW_SET = new Set(ALLOWLIST);

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

/**
 * Confirma autor vía embed.
 * - true: es @USERNAME
 * - false: es otra cuenta (detectada)
 * - null: inconcluso (login wall / HTML sin username)
 */
async function shortcodeBelongsToAccount(shortcode) {
  const embedRes = await fetch(
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    { headers: { "User-Agent": UA } },
  );
  if (!embedRes.ok) return null;
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

  if (users.size === 0) return null;
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

  // Allowlist primero (orden curado), luego descubrimiento de perfil.
  for (const code of [
    ...ALLOWLIST,
    ...(await discoverShortcodesFromProfile()),
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
    if (ok === false) {
      console.warn(`  Omitido /p/${code}/ — no es de @${USERNAME}`);
      await sleep(300);
      continue;
    }
    if (ok === null && !ALLOW_SET.has(code)) {
      console.warn(
        `  Omitido /p/${code}/ — autor no verificable y no está en allowlist`,
      );
      await sleep(300);
      continue;
    }
    if (ok === null && ALLOW_SET.has(code)) {
      console.warn(
        `  /p/${code}/ — autor no verificable; se usa por allowlist curada`,
      );
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

  let src = readFileSync(HOME, "utf8");
  src = src.replace(
    /\/\*\* Publicaciones recientes[\s\S]*?export const INSTAGRAM_POSTS: InstagramPost\[\] = \[[\s\S]*?\];/,
    block,
  );
  writeFileSync(HOME, src);
  console.log(`Actualizado lib/home-content.ts (${posts.length} publicaciones)`);
} catch (err) {
  console.error(err);
  process.exit(1);
}

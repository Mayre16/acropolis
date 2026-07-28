/**
 * Descarga el RSS de Nueva Acrópolis Internacional (acropolis.org) y genera
 * public/data/mundo-feed.json para desarrollo local y respaldo estático.
 * Las imágenes se descargan y guardan como WebP en public/img/mundo/.
 *
 * Uso: node scripts/fetch_mundo_feed.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { downloadAsWebp, slugFromUrl } from "./image-webp.mjs";

const FEED = "https://www.acropolis.org/feed/";
const LIMIT = 6;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "data", "mundo-feed.json");
const MUNDO_IMG = join(ROOT, "public", "img", "mundo");

function decodeEntities(text) {
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8230;/g, "…");
}

function stripHtml(html) {
  return decodeEntities(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(block) {
  const candidates = [];

  for (const m of block.matchAll(
    /(?:src|url)="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/gi,
  )) {
    candidates.push(decodeEntities(m[1]));
  }

  return (
    candidates.find(
      (url) =>
        !/\/cropped-Logo-NA|LOGO_NA|favicon|icon-/i.test(url) &&
        /wp-content\/uploads\//i.test(url),
    ) ?? null
  );
}

async function fetchOgImage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AcropolisRD-FeedProxy/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/property="og:image"\s+content="([^"]+)"/i) ??
      html.match(/content="([^"]+)"\s+property="og:image"/i);
    return m?.[1] ? decodeEntities(m[1]) : null;
  } catch {
    return null;
  }
}

async function localizeImage(url) {
  if (!url || url.startsWith("/img/")) return url;
  try {
    const slug = slugFromUrl(url);
    return await downloadAsWebp(url, MUNDO_IMG, "img/mundo", `${slug}.webp`);
  } catch (err) {
    console.warn(`  imagen no localizada (${url}): ${err.message}`);
    return url;
  }
}

async function main() {
  const res = await fetch(FEED, {
    headers: { "User-Agent": "AcropolisRD-FeedProxy/1.0" },
  });
  if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
  const xml = await res.text();

  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  for (const block of blocks) {
    if (items.length >= LIMIT) break;
    const pick = (tag) => {
      const m = block.match(
        new RegExp(
          `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
          "i",
        ),
      );
      return decodeEntities((m?.[1] ?? m?.[2] ?? "").trim());
    };
    const title = pick("title");
    if (!title) continue;
    const link = pick("link");
    const desc = pick("description") || pick("content:encoded");
    const pub = pick("pubDate");
    const date = pub
      ? new Date(pub).toLocaleDateString("es-DO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : undefined;

    let image = extractImage(block);
    if (!image && link) {
      image = await fetchOgImage(link);
    }
    if (image) {
      image = await localizeImage(image);
    }

    items.push({
      title,
      excerpt: stripHtml(desc).slice(0, 220),
      date,
      image,
      url: link || undefined,
    });
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ items }, null, 2), "utf8");
  console.log(`Wrote ${items.length} items to ${OUT}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

/**
 * Descarga published.json del CMS para el build (frases / OG / static params).
 * Falla de forma clara si la API no devuelve JSON (p. ej. HTML de error).
 *
 * Uso: node scripts/sync-cms-published.mjs
 * Env: CMS_API (default https://editor.acropolis.adesa.com.do/api)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data/acropolis/published.json");
const CMS_API = (
  process.env.CMS_API ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  "https://editor.acropolis.adesa.com.do/api"
).replace(/\/$/, "");
const URL = `${CMS_API}/content/acropolis/published`;

async function fetchPublished(attempt = 1) {
  const res = await fetch(URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "acropolis-pages-build/1.0 (+github-actions)",
    },
    redirect: "follow",
  });
  const text = await res.text();
  const trimmed = text.trim();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${trimmed.slice(0, 160)}`);
  }
  if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
    throw new Error(
      `La API devolvió HTML en vez de JSON (posible login/WAF). Inicio: ${trimmed.slice(0, 80)}`,
    );
  }
  let doc;
  try {
    doc = JSON.parse(trimmed);
  } catch (err) {
    throw new Error(
      `JSON inválido: ${(err && err.message) || err}. Inicio: ${trimmed.slice(0, 80)}`,
    );
  }
  if (!doc || doc.version !== 1) {
    throw new Error("Documento CMS sin version:1");
  }
  return doc;
}

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const doc = await fetchPublished(attempt);
      fs.writeFileSync(OUT, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
      const frases = (doc.sections?.frasesDelDia || []).filter((f) => f?.src).length;
      console.log("CMS sync OK", URL, "updatedAt", doc.updatedAt ?? "?");
      console.log("frases con foto:", frases);
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`Intento ${attempt}/3 falló:`, err?.message ?? err);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  const requireSync = process.env.CMS_SYNC_REQUIRED === "1";
  if (!requireSync && fs.existsSync(OUT)) {
    try {
      const fallback = JSON.parse(fs.readFileSync(OUT, "utf8"));
      if (fallback?.version === 1) {
        const frases = (fallback.sections?.frasesDelDia || []).filter(
          (f) => f?.src,
        ).length;
        console.warn(
          "Usando published.json local (CMS no sincronizó). frases con foto:",
          frases,
        );
        process.exit(0);
      }
    } catch {
      /* fall through */
    }
  }
  console.error("No se pudo sincronizar published.json del CMS.");
  console.error(lastErr?.message ?? lastErr);
  if (requireSync) {
    console.error(
      "CMS_SYNC_REQUIRED=1: abortando para no desplegar páginas de frases desactualizadas.",
    );
  }
  process.exit(1);
}

await main();

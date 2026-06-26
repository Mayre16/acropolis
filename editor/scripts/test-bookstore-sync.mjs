/**
 * Prueba E2E sync CMS → Biblioteca (upsert).
 * Uso:
 *   $env:STORE_API_URL="http://127.0.0.1:8090"   # o producción
 *   $env:STORE_SYNC_TOKEN="oina-dev-sync-2026-acropolis-local"
 *   node scripts/test-bookstore-sync.mjs
 */
const storeApi = (process.env.STORE_API_URL || "https://biblioteca-oina.adesa.com.do").replace(
  /\/$/,
  "",
);
const token = process.env.STORE_SYNC_TOKEN || "oina-dev-sync-2026-acropolis-local";
const upsertPath = process.env.STORE_UPSERT_PATH || "/api/bookstore_upsert.php";
const slug = `libro-test-${Date.now().toString(36)}`;

const payload = {
  title: `Libro prueba sync ${new Date().toISOString().slice(11, 19)}`,
  author: "Cursor Test",
  price: 199,
  currency: "DOP",
  stock: 3,
  product_type: "impreso",
  cms_slug: slug,
};

const url = `${storeApi}${upsertPath}`;
console.log("POST", url);
console.log("cms_slug:", slug);

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});

const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  data = { raw: text };
}

console.log("Status:", res.status);
console.log("Body:", JSON.stringify(data, null, 2));

if (!res.ok || !data.ok || !data.id) {
  process.exit(1);
}

const listRes = await fetch(
  `${storeApi}/api/bookstore_public_list.php?product_type=impreso&q=${encodeURIComponent(payload.title)}`,
);
const list = await listRes.json();
const found = list.items?.find((b) => b.id === data.id);
console.log(found ? `✓ Visible en catálogo (#${found.id})` : "✗ No aparece en listado público");
process.exit(found ? 0 : 1);

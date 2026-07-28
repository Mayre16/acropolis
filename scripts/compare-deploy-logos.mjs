import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const deployRoot = join(
  import.meta.dirname,
  "..",
  "deploy",
  "_compare-2026-06-19",
);
const localClearSpace = readFileSync(
  join(import.meta.dirname, "..", "lib", "brand-clear-space.ts"),
  "utf8",
);

function walkJs(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkJs(p, out);
    else if (name.endsWith(".js")) out.push(p);
  }
  return out;
}

const chunk = walkJs(join(deployRoot, "na-assets")).find((p) => {
  const t = readFileSync(p, "utf8");
  return t.includes("brandLogoHeightClass") || t.includes("contenidoHub");
});

if (!chunk) {
  console.error("No BrandLogo chunk found");
  process.exit(1);
}

const bundle = readFileSync(chunk, "utf8");

const presets = [
  "headerFilial",
  "hero",
  "footer",
  "pageHero",
  "pageHeroTrilogo",
  "contenidoHub",
  "contentDigital",
  "internationalBand",
  "sectionStacked",
  "diplomadoHero",
];

console.log("Deploy ZIP: acropolis-principal-2026-06-19.zip");
console.log("Bundle chunk:", chunk.replace(deployRoot, ""));
console.log("\n--- Presets in deploy bundle ---");
for (const key of presets) {
  const re = new RegExp(`${key}:"\\[--brand-logo-h:[^"]+"`);
  const m = bundle.match(re);
  console.log(`${key}: ${m ? m[0].slice(key.length + 2, -1) : "NOT FOUND"}`);
}

console.log("\n--- Descriptor factors in deploy ---");
for (const f of ["0.058", "0.19", "0.21", "0.026", "0.03"]) {
  console.log(`${f}: ${bundle.includes(f) ? "yes" : "no"}`);
}
console.log(
  "descriptorProminence in bundle:",
  bundle.includes("descriptorProminence") ? "yes" : "no",
);
console.log(
  `oinadomWordmarkFit / SVG band: ${bundle.includes("BRAND_WORDMARK_WIDTH_RATIO") || bundle.includes("0.6015") ? "yes" : "partial"}`,
);

console.log("\n--- Local brand-clear-space.ts presets ---");
for (const key of presets) {
  const re = new RegExp(`${key}:\\s*"\\[--brand-logo-h:[^"]+"`);
  const m = localClearSpace.match(re);
  console.log(`${key}: ${m ? m[0].slice(key.length + 3, -1) : "NOT FOUND"}`);
}

const pages = ["index", "contenido/index", "voluntariado/index", "filosofia/index"];
console.log("\n--- SSR HTML (pre-rendered classes) ---");
for (const rel of pages) {
  const html = readFileSync(join(deployRoot, `${rel}.html`), "utf8");
  const heights = [...new Set([...html.matchAll(/--brand-logo-h:([^\]"\\]+)/g)].map((m) => m[1]))];
  console.log(`\n${rel}:`);
  console.log("  --brand-logo-h:", heights.join(" | ") || "(client-only)");
  console.log("  oinadom text:", /REPÚBLICA DOMINICANA|REP\\u00dablica DOMINICANA/i.test(html));
  console.log("  oina text:", /ORGANIZACIÓN INTERNACIONAL|ORGANIZACI\\u00d3N INTERNACIONAL/i.test(html));
  console.log("  trilogo text:", /FILOSOF/i.test(html) && /VOLUNTARIADO/i.test(html));
  console.log("  escuela text:", /ESCUELA DE FILOSOF/i.test(html));
}

console.log("\n--- Descriptor clamp patterns in deploy ---");
const clampHits = [...new Set([...bundle.matchAll(/clamp\([^)]{10,100}\)/g)].map((m) => m[0]))];
clampHits.forEach((c) => console.log(c));

console.log("\n--- Lockup props in deploy bundles ---");
const allJs = walkJs(join(deployRoot, "na-assets"));
for (const rel of ["contenido/page", "layout", "page"]) {
  const files = allJs.filter((f) => f.includes("contenido") || f.includes("layout") || f.endsWith("page-6fa1704102118a06.js"));
  if (rel === "contenido/page") {
    const p = allJs.find((f) => f.includes("contenido\\page") || f.includes("contenido/page"));
    if (p) scanLockups(p, rel);
  } else if (rel === "layout") {
    const p = allJs.find((f) => f.includes("layout-"));
    if (p) scanLockups(p, rel);
  } else {
    const p = allJs.find((f) => f.endsWith("page-6fa1704102118a06.js"));
    if (p) scanLockups(p, "home page chunk");
  }
}

function scanLockups(file, label) {
  const t = readFileSync(file, "utf8");
  console.log(`\n${label} (${file.split(/[/\\]/).pop()}):`);
  for (const needle of [
    'lockup:"oina"',
    'lockup:"oinadom"',
    'lockup:"trilogo"',
    'lockup:"escuela"',
    'size:"footer"',
    'size:"contenidoHub"',
    'size:"hero"',
    'descriptorProminence:"hero"',
  ]) {
    console.log(`  ${needle}: ${t.includes(needle) ? "yes" : "no"}`);
  }
}

console.log("\n--- DIFF summary (deploy zip vs local source) ---");
const deployFooter = bundle.match(/footer:"\[(--brand-logo-h:[^\]]+\][^"]*)"/)?.[1];
const localFooter = localClearSpace.match(/footer:\s*"\[([^\]]+\][^"]*)"/)?.[1];
console.log("footer preset:", deployFooter === localFooter ? "MATCH" : "DIFFER");
if (deployFooter && localFooter) {
  console.log("  deploy:", deployFooter);
  console.log("  local:", localFooter);
}

const inspectFiles = [
  "7088-783275e7d61f2160.js",
  "app/layout-8fecfe79a9ae95df.js",
  "app/contenido/page-9c2152b1ca6eb488.js",
];
console.log("\n--- Deploy chunk details ---");
for (const rel of inspectFiles) {
  const p = join(deployRoot, "na-assets", "static", "chunks", ...rel.split("/"));
  const t = readFileSync(p, "utf8");
  console.log(`\n${rel}:`);
  for (const n of [
    "0.8125rem",
    "0.5rem",
    "0.5625rem",
    "0.4375rem",
    "textLength",
    'viewBox="0 0 100 12"',
    "oinadomWordmarkFit",
    'size:"footer"',
    "3.5rem",
    "2.65rem",
  ]) {
    console.log(`  ${n}: ${t.includes(n) ? "yes" : "no"}`);
  }
}

const styleIdx = bundle.indexOf("0.8125rem");
if (styleIdx >= 0) {
  console.log("\n--- Deploy descriptor style snippet ---");
  console.log(bundle.slice(Math.max(0, styleIdx - 200), styleIdx + 800));
}

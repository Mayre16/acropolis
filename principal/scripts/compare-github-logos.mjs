/**
 * Compara lockups en GitHub Pages vs ZIP adesa vs fuente local.
 * Uso: node scripts/compare-github-logos.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const GH_BASE = "https://mayre16.github.io/acropolis/principal";
const deployRoot = join(import.meta.dirname, "..", "deploy", "_compare-2026-06-19");
const localClearSpace = readFileSync(
  join(import.meta.dirname, "..", "lib", "brand-clear-space.ts"),
  "utf8",
);
const localBrandLogo = readFileSync(
  join(import.meta.dirname, "..", "components", "BrandLogo.tsx"),
  "utf8",
);

const checks = [
  'footer:"[--brand-logo-h:3.5rem',
  'footer:"[--brand-logo-h:2.65rem',
  "0.8125rem",
  "0.4375rem",
  "0.027",
  "0.19",
  "0.21",
  "oinadomWordmarkFit",
  'viewBox="0 0 1000 120"',
  "textLength",
  'lockup:"oina"',
  'descriptorProminence:"hero"',
];

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function report(label, text) {
  console.log(`\n=== ${label} ===`);
  for (const c of checks) {
    console.log(`  ${c}: ${text.includes(c) ? "yes" : "no"}`);
  }
  const footer = text.match(/footer:"(\[--brand-logo-h:[^\]]+\][^"]*)"/)?.[1];
  if (footer) console.log(`  footer preset: ${footer}`);
}

const pages = ["", "contenido/", "voluntariado/"];
console.log("GitHub Pages vs adesa ZIP vs local\n");

let ghChunk = "";
for (const page of pages) {
  const html = await fetchText(`${GH_BASE}/${page}`);
  console.log(`\n--- GH page /${page || "(home)"} ---`);
  console.log("  ORGANIZACIÓN in HTML:", /ORGANIZ/i.test(html));
  console.log("  REPÚBLICA in HTML:", /REPÚBLICA|REP\\u00daBLICA/i.test(html));
  console.log("  svg wordmark:", /viewBox="0 0 1000 120"/.test(html));
  const chunk = html.match(/7088-[a-f0-9]+\.js/)?.[0];
  const chunkPath =
    html.match(/\/acropolis\/principal\/_next\/static\/chunks\/7088-[a-f0-9]+\.js/)?.[0] ||
    html.match(/\/acropolis\/principal\/na-assets\/static\/chunks\/7088-[a-f0-9]+\.js/)?.[0] ||
    html.match(/na-assets\/static\/chunks\/7088-[a-f0-9]+\.js/)?.[0];
  if (chunkPath && !ghChunk) {
    ghChunk = chunkPath.startsWith("http")
      ? chunkPath
      : chunkPath.startsWith("/")
        ? `https://mayre16.github.io${chunkPath}`
        : `${GH_BASE}/${chunkPath}`;
  } else if (chunk && !ghChunk) {
    ghChunk = `${GH_BASE}/na-assets/static/chunks/${chunk}`;
  }
}

if (ghChunk) {
  const cacheDir = join(import.meta.dirname, "..", "deploy", "_compare-github");
  mkdirSync(cacheDir, { recursive: true });
  const chunkUrl = ghChunk;
  console.log(`\nFetching GH chunk: ${chunkUrl}`);
  const ghJs = await fetchText(chunkUrl);
  const ghName = chunkUrl.split("/").pop();
  writeFileSync(join(cacheDir, ghName), ghJs);
  report("GitHub chunk (7088)", ghJs);

  const adesaJs = readFileSync(
    join(deployRoot, "na-assets", "static", "chunks", "7088-783275e7d61f2160.js"),
    "utf8",
  );
  report("adesa ZIP chunk (7088)", adesaJs);

  console.log("\n=== GH vs adesa chunk ===");
  console.log("  identical:", ghJs === adesaJs);
  console.log("  GH size:", ghJs.length, "adesa size:", adesaJs.length);
} else {
  console.log("\nNo 7088 chunk found in GH HTML");
}

report("local brand-clear-space.ts", localClearSpace);
console.log("\n=== local BrandLogo.tsx ===");
console.log("  oinadomWordmarkFit:", localBrandLogo.includes("oinadomWordmarkFit"));
console.log("  OinadomDescriptor:", localBrandLogo.includes("OinadomDescriptor"));

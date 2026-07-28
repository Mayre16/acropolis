import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const paths = [
  join(root, "deploy/_compare-2026-06-19/na-assets/static/chunks/app/donde-estamos/page-d60c46ee3c017f5d.js"),
  join(root, "out/_next/static/chunks/4263-39c665dfc404fc55.js"),
];

for (const p of paths) {
  const s = readFileSync(p, "utf8");
  console.log("\n===", p.split(/[/\\]/).slice(-3).join("/"), "===");
  for (const needle of ["centro-leon", "Centro Le", "Santiago", "mapX", "VENUE_LOCATIONS", "punto-cultural"]) {
    const i = s.indexOf(needle);
    if (i >= 0) console.log(needle, "→", s.slice(Math.max(0, i - 40), i + 400));
  }
}

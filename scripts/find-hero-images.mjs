import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

// Mobile breakpoint section: images near HERO / 7A31bBX / AN9VfYD
for (const id of ["7A31bBX", "AN9VfYD", "3vVbpgn", "t60hIPMS"]) {
  const i = h.indexOf(id);
  if (i < 0) {
    console.log(id, "NOT FOUND");
    continue;
  }
  const ctx = h.slice(Math.max(0, i - 200), i + 200);
  const name = ctx.match(/data-framer-name="([^"]+)"/g);
  console.log("\n===", id, "===");
  console.log(name?.slice(-3).join(" | ") || "(no name)");
}

// Find mobile hero block (2s3ur7 = max-width mobile)
const mobileIdx = h.indexOf("hidden-72rtr7");
const chunk = h.slice(mobileIdx, mobileIdx + 120000);
const imgs = [...chunk.matchAll(/images\/([A-Za-z0-9]+)\.(png|jpg)/g)].map((m) => m[1]);
const counts = {};
for (const id of imgs) counts[id] = (counts[id] || 0) + 1;
console.log("\nMobile section image IDs (top):");
Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([k, v]) => console.log(v, k));

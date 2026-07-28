import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

// Bloque móvil del hero (después de marquee / Filosofía)
const idx = h.indexOf("data-framer-name=\"HERO\"");
const mobile = h.indexOf("hidden-72rtr7", idx);
const chunk = h.slice(mobile, mobile + 80000);

const imgBlocks = [...chunk.matchAll(
  /data-framer-name="([^"]+)"[\s\S]{0,800}?framerusercontent\.com\/images\/([A-Za-z0-9]+)\.(png|jpg)/g,
)];
console.log("Hero mobile images (name -> id):");
for (const m of imgBlocks.slice(0, 20)) {
  console.log(`  ${m[1]} -> ${m[2]}.${m[3]}`);
}

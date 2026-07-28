import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

const start = h.indexOf('data-framer-name="HERO"');
const end = h.indexOf('data-framer-name="Info-Banner"', start);
const chunk = h.slice(start, end > 0 ? end : start + 100000);

const names = [...chunk.matchAll(/data-framer-name="([^"]+)"[\s\S]{0,1500}?images\/([A-Za-z0-9]+)\.(png|jpg)/g)];
for (const m of names) {
  console.log(m[1], "->", m[2] + "." + m[3]);
}

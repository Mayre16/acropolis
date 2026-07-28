import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

const start = h.indexOf('data-framer-name="HERO"');
const end = h.indexOf('data-framer-name="Info-Banner"', start);
const chunk = h.slice(start, end);

// blend modes, opacity, transforms
const re = /data-framer-name="(1920x1080 1|w1caDiPS[^"]*|Rectangle 3)"[\s\S]{0,2500}/g;
let m;
while ((m = re.exec(chunk))) {
  const block = m[0];
  const blend = block.match(/mix-blend-mode:\s*([^;"]+)/)?.[1];
  const opacity = block.match(/opacity:\s*([^;"]+)/)?.[1];
  const transform = block.match(/transform:([^;"]+)/)?.[1];
  console.log("\n---", m[1].slice(0, 40), "---");
  console.log("blend:", blend, "opacity:", opacity, "transform:", transform?.slice(0, 80));
}

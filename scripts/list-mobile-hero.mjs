import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

// Mobile root: framer-2s3ur7 or hidden-72rtr7 on desktop
const idx = h.indexOf("framer-2s3ur7");
const chunk = h.slice(idx, idx + 60000);
const re = /data-framer-name="([^"]+)"[\s\S]{0,2000}?images\/([A-Za-z0-9]+)\.(png|jpg)/g;
let m;
const seen = new Set();
while ((m = re.exec(chunk))) {
  const key = m[2];
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(m[1], "->", m[2] + "." + m[3]);
}

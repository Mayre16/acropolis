import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

const start = h.indexOf('data-framer-name="Images"');
const chunk = h.slice(start, start + 20000);
const re = /object-fit:([^;"]+)[\s\S]{0,120}?images\/([A-Za-z0-9]+)\.png/g;
let m;
while ((m = re.exec(chunk))) {
  console.log(m[2], "->", m[1]);
}

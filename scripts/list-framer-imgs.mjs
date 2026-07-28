import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);
const imgs = [...h.matchAll(/framerusercontent\.com\/images\/[A-Za-z0-9]+\.(?:png|jpg)[^"'\s]*/g)].map(
  (m) => m[0],
);
[...new Set(imgs)].forEach((x) => console.log(x));

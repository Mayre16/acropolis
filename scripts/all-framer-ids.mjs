import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);
const m = h.match(/framerusercontent\.com\/images\/[A-Za-z0-9]+/g) || [];
[...new Set(m)].forEach((x) => console.log(x));

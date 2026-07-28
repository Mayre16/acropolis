import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer-live.html"),
  "utf8",
);
const i = h.indexOf('data-framer-name="About/Img');
if (i < 0) {
  console.log("no About/Img");
  process.exit(0);
}
console.log(h.slice(i, i + 3000).match(/images\/[A-Za-z0-9]+\.(png|jpg)/g));

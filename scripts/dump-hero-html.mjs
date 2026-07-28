import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer-live.html"),
  "utf8",
);
const start = h.indexOf('data-framer-name="Images"');
const chunk = h.slice(start, start + 25000);
fs.writeFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-hero-images-chunk.html"),
  chunk,
);
const imgs = [...chunk.matchAll(/<img[^>]+>/g)];
console.log("img tags:", imgs.length);
imgs.forEach((m, i) => {
  const src = m[0].match(/images\/([A-Za-z0-9]+)/)?.[1];
  const fit = m[0].match(/object-fit:([^;"]+)/)?.[1];
  console.log(i, src, fit);
});

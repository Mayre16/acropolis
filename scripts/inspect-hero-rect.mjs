import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

const names = ["1920x1080 1", "w1caDiPSLeD6tzIuLfAcEYHRV96wjwxjqvU00rjv 1", "Rectangle 3"];
for (const name of names) {
  const i = h.indexOf(`data-framer-name="${name}"`);
  const block = h.slice(i, i + 1200);
  const w = block.match(/width:\s*([^;]+)/)?.[1];
  const hgt = block.match(/height:\s*([^;]+)/)?.[1];
  const aspect = block.match(/aspect-ratio:\s*([^;]+)/)?.[1];
  console.log(name, { w, h: hgt, aspect });
}

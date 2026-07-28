import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

for (const id of ["7A31bBX", "AN9VfYD", "3vVbpgn"]) {
  const i = h.indexOf(id);
  const ctx = h.slice(i - 400, i + 600);
  const fit = ctx.match(/object-fit:[^;"]+/);
  const pos = ctx.match(/object-position:[^;"]+/);
  console.log(id, "fit:", fit?.[0], "pos:", pos?.[0]);
}

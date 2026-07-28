import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const h = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../tmp-framer.html"),
  "utf8",
);

for (const id of ["7A31bBXQM6WsyKZ8BoU0PBG1DM", "AN9VfYD4NEMMUSFUpmms6RFaGE", "3vVbpgnJRUBrbd3WbkX0VoOiSeM"]) {
  const i = h.indexOf(id);
  const imgStart = h.lastIndexOf("<img", i);
  const imgEnd = h.indexOf(">", i) + 1;
  const tag = h.slice(imgStart, imgEnd + 200);
  const style = tag.match(/style="([^"]+)"/)?.[1] ?? "";
  console.log("\n", id.slice(0, 8));
  console.log(style.slice(0, 200));
}

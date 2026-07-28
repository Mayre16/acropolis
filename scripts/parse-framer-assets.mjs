import fs from "fs";

const h = fs.readFileSync(
  new URL("../tmp-framer.html", import.meta.url),
  "utf8",
);

const re = /framerusercontent\.com\/images\/([A-Za-z0-9]+)\.(png|jpg|gif|webp|mp4)/g;
const byId = new Map();
let m;
while ((m = re.exec(h)) !== null) {
  const id = `${m[1]}.${m[2]}`;
  if (!byId.has(id)) byId.set(id, 0);
  byId.set(id, byId.get(id) + 1);
}

console.log("Assets by frequency:");
[...byId.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([id, n]) => console.log(n, id));

const mobileChunk = h.split("hidden-72rtr7").slice(1).join("");
const mobileIds = new Set();
while ((m = re.exec(mobileChunk)) !== null) {
  mobileIds.add(`${m[1]}.${m[2]}`);
}
re.lastIndex = 0;
console.log("\nMobile-only section images:");
console.log([...mobileIds].join("\n"));

const colors = [...h.matchAll(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)]
  .map((x) => x[0])
  .filter((v, i, a) => a.indexOf(v) === i)
  .slice(0, 20);
console.log("\nColors:", colors.join(", "));

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const h = fs.readFileSync(path.join(__dirname, "../tmp-framer.html"), "utf8");
const svgs = h.match(/<svg[\s\S]{500,80000}?<\/svg>/g) || [];
const globe = svgs.reduce((a, b) => (a.length > b.length ? a : b), "");
const out = path.join(__dirname, "../public/img/diplomado/landing/globe.svg");

const clean = globe
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

fs.writeFileSync(out, clean);
console.log("wrote", out, clean.length, "paths", (clean.match(/<path/g) || []).length);

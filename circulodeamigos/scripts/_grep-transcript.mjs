import fs from "node:fs";

const t = fs.readFileSync(
  "C:/Users/marth/.cursor/projects/c-Users-marth-Cursor-Projects-Biblioteca-OINA/agent-transcripts/252d7b74-433e-4c53-a1fc-b45a83c677ac/252d7b74-433e-4c53-a1fc-b45a83c677ac.jsonl",
  "utf8",
);
const urls = [...t.matchAll(/https?:\/\/[^\s"'\\]+/g)].map((m) => m[0]);
const filtered = [...new Set(urls)].filter((u) =>
  /licdn|barna|media\.|wp-content|instagram|facebook\.com\/.*posts/i.test(u),
);
console.log(filtered.join("\n") || "none");

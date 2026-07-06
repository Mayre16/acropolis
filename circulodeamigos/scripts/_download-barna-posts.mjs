const posts = [
  "7225239267613048833",
  "7236854105443319808",
  "7222005133524570113",
  "7191863507850510336",
  "7307402491179012099",
  "7284942054420316162",
  "7463735096928530433",
  "7460530417889075201",
  "7457497101644730368",
  "7305228919748636675",
];

import fs from "node:fs";
import path from "node:path";
const out = "c:/Users/marth/Cursor Projects/acropolis.org.do/civis/public/img/_tmp";

for (const id of posts) {
  const url = `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  const img = html.match(/property="og:image" content="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&");
  const title = html.match(/property="og:title" content="([^"]+)"/)?.[1];
  const desc = html.match(/property="og:description" content="([^"]+)"/)?.[1];
  console.log("\n", id, title?.slice(0, 90));
  console.log(" ", desc?.slice(0, 120));
  if (img) {
    const ir = await fetch(img, { headers: { "User-Agent": "Mozilla/5.0" } });
    const buf = Buffer.from(await ir.arrayBuffer());
    fs.writeFileSync(path.join(out, `post-${id}.jpg`), buf);
    console.log(" saved", buf.length);
  }
}

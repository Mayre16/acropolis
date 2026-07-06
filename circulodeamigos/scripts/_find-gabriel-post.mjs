import fs from "node:fs";

const target = fs.readFileSync(
  "c:/Users/marth/Cursor Projects/acropolis.org.do/civis/public/img/hero/taller-barna.jpg",
);
const targetMd5 = require("crypto")
  .createHash("md5")
  .update(target)
  .digest("hex");
console.log("target md5", targetMd5, "size", target.length);

async function check(id) {
  const url = `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (res.status !== 200) return;
  const html = await res.text();
  const imgs = [...html.matchAll(/property="og:image" content="([^"]+)"/g)].map(
    (m) => m[1].replace(/&amp;/g, "&"),
  );
  const title = html.match(/property="og:title" content="([^"]+)"/)?.[1];
  const desc = html.match(/property="og:description" content="([^"]+)"/)?.[1];
  const text = `${title || ""} ${desc || ""}`;
  for (const imgUrl of imgs) {
    try {
      const ir = await fetch(imgUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!ir.ok) continue;
      const buf = Buffer.from(await ir.arrayBuffer());
      const md5 = require("crypto").createHash("md5").update(buf).digest("hex");
      if (md5 === targetMd5 || buf.length === target.length) {
        console.log("\nMATCH!", id, md5, buf.length);
        console.log("TITLE", title?.slice(0, 120));
        console.log("DESC", desc?.slice(0, 200));
        console.log("IMG", imgUrl.slice(0, 150));
      }
    } catch {}
  }
  if (/conflict|acropolis|Gabriel|Eva|Experiencia|Nueva Acr/i.test(text)) {
    console.log("\nHIT", id, title?.slice(0, 100));
    console.log("DESC", desc?.slice(0, 180));
  }
}

// scan around likely 2025 barna posts
const bases = [
  [7460000000000000000, 7461000000000000000, 5000000000000],
  [7450000000000000000, 7452000000000000000, 10000000000000],
  [7440000000000000000, 7442000000000000000, 10000000000000],
];
for (const [start, end, step] of bases) {
  for (let id = start; id < end; id += step) {
    await check(String(id));
  }
}
console.log("done");

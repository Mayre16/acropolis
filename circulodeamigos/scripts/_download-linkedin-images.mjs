import fs from "node:fs";
import path from "node:path";

const outDir =
  "c:/Users/marth/Cursor Projects/acropolis.org.do/civis/public/img/_tmp";
fs.mkdirSync(outDir, { recursive: true });

async function og(id) {
  const url = `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  const ogImg = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  const title = html.match(/property="og:title" content="([^"]+)"/)?.[1];
  const desc = html.match(/property="og:description" content="([^"]+)"/)?.[1];
  return { id, title, desc, img: ogImg?.replace(/&amp;/g, "&") };
}

const ids = [
  "7460530417889075201",
  "7463735096928530433",
  "7457497101644730368",
  "7305228919748636675",
];

// wider scan
for (let i = 7463000000000000000; i < 7464000000000000000; i += 200000000000) {
  ids.push(String(i));
}

const seen = new Set();
for (const id of ids) {
  try {
    const data = await og(id);
    if (!data.img || seen.has(data.img)) continue;
    const text = `${data.title || ""} ${data.desc || ""}`;
    if (
      !/conflict|acropolis|Acropolis|Gabriel|Eva|Nueva|Experiencia|filosof|convivencia|retos|Barna/i.test(
        text,
      )
    )
      continue;
    seen.add(data.img);
    console.log("\n---", id, "---");
    console.log("TITLE:", data.title?.slice(0, 120));
    console.log("DESC:", data.desc?.slice(0, 200));
    console.log("IMG:", data.img.slice(0, 120));
    const file = path.join(outDir, `li-${id}.jpg`);
    const imgRes = await fetch(data.img, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(file, buf);
      console.log("Saved", file, buf.length);
    }
  } catch (e) {
    // ignore
  }
}

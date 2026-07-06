import fs from "node:fs";
import path from "node:path";

const ids = [
  "7463735096928530433",
  "7463735096928530400",
  "7463735096928530500",
];

const out = "c:/Users/marth/Cursor Projects/acropolis.org.do/civis/public/img/_tmp";
fs.mkdirSync(out, { recursive: true });

for (const id of ids) {
  const url = `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "es-ES,es;q=0.9",
    },
  });
  const html = await res.text();
  console.log(`\n=== activity ${id} (${html.length}) ===`);
  const imgs = [
    ...new Set(
      [...html.matchAll(/https:\/\/media\.licdn\.com[^"'\\]+/g)].map((m) =>
        m[0].replace(/&amp;/g, "&"),
      ),
    ),
  ].filter((u) => /dms\/image|feedshare|image-shrink/.test(u));
  console.log("found", imgs.length, "licdn urls");
  let n = 0;
  for (const imgUrl of imgs) {
    try {
      const ir = await fetch(imgUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!ir.ok) continue;
      const buf = Buffer.from(await ir.arrayBuffer());
      if (buf.length < 10000) continue;
      const file = path.join(out, `carousel-${id}-${n++}.jpg`);
      fs.writeFileSync(file, buf);
      console.log("saved", file, buf.length);
    } catch {}
  }
  const snippets = [
    ...html.matchAll(
      /.{0,80}(Gabriel|Eva|conflict|Acropolis|Acrópolis|Nueva|Experiencia|Yamille).{0,80}/gi,
    ),
  ].slice(0, 10);
  snippets.forEach((s) =>
    console.log("SNIP:", s[0].replace(/\s+/g, " ").slice(0, 140)),
  );
}

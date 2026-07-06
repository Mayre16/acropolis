const ids = [
  "7463735096928530433", // medios.ts (wrong post)
  "7457497101644730368",
  "7305228919748636675",
  "7225239267613048833",
  "7460530417889075201",
];

// also try searching activity range around conflict event - scan a few
for (let i = 7463735096928500000; i < 7463735096928540000; i += 50000) {
  ids.push(String(i));
}

const seen = new Set();
for (const id of [...new Set(ids)]) {
  const url = `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    const html = await res.text();
    const og = html.match(/property="og:image" content="([^"]+)"/);
    const desc = html.match(/property="og:description" content="([^"]+)"/);
    const title = html.match(/property="og:title" content="([^"]+)"/);
    const text = `${title?.[1] || ""} ${desc?.[1] || ""}`;
    if (
      og &&
      !seen.has(og[1]) &&
      /conflict|acropolis|Acropolis|Gabriel|Eva|Experiencia|Nueva|filosof/i.test(text + html.slice(0, 5000))
    ) {
      seen.add(og[1]);
      console.log("\nID", id);
      console.log("TITLE", title?.[1]?.slice(0, 120));
      console.log("DESC", desc?.[1]?.slice(0, 200));
      console.log("IMG", og[1].slice(0, 150));
    }
  } catch {}
}

console.log("\nDone");

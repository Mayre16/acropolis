const ids = [];
// scan range for barna+acropolis+conflict posts
for (let base = 7460530417889075000; base < 7460530417889080000; base += 10000) ids.push(String(base));
for (let base = 7463735096928500000; base < 7463735096928540000; base += 10000) ids.push(String(base));
for (let base = 7450000000000000000; base < 7451000000000000000; base += 5000000000000) ids.push(String(base));

const hits = [];
for (const id of [...new Set(ids)]) {
  const url = `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (res.status !== 200) continue;
    const html = await res.text();
    const og = html.match(/property="og:image" content="([^"]+)"/);
    const desc = html.match(/property="og:description" content="([^"]+)"/);
    const title = html.match(/property="og:title" content="([^"]+)"/);
    const text = `${title?.[1] || ""} ${desc?.[1] || ""}`;
    if (
      og &&
      /conflict|acropolis|Acropolis|Gabriel|Eva|Nueva|filosof|convivencia|retos/i.test(text)
    ) {
      hits.push({ id, title: title?.[1], desc: desc?.[1], img: og[1] });
    }
  } catch {}
}

hits.forEach((h) => {
  console.log("\nID", h.id);
  console.log("TITLE", h.title?.slice(0, 150));
  console.log("DESC", h.desc?.slice(0, 250));
  console.log("IMG", h.img?.replace(/&amp;/g, "&").slice(0, 180));
});
console.log("\nTotal hits:", hits.length);

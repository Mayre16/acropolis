const accounts = [
  "https://www.instagram.com/barnamanagementschool/",
  "https://www.instagram.com/nuevaacropolisrd/",
];

for (const url of accounts) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  console.log(`\n=== ${url} (${res.status}, ${html.length}) ===`);
  for (const pat of [
    /"display_url":"([^"]+)"/g,
    /"thumbnail_src":"([^"]+)"/g,
    /https:\/\/[^"'\\s>]*scontent[^"'\\s>]+\.(jpg|webp)/gi,
  ]) {
    const m = [...html.matchAll(pat)].slice(0, 8);
    if (m.length) {
      console.log("pat", pat.source.slice(0, 25), m.length);
      m.forEach((x) => console.log((x[1] || x[0]).replace(/\\u0026/g, "&").slice(0, 100)));
    }
  }
  const hits = [...html.matchAll(/.{0,50}(acropolis|Acropolis|conflict|Eva|Gabriel|Experiencia|Nueva).{0,50}/gi)].slice(0, 8);
  hits.forEach((h) => console.log("HIT:", h[0].replace(/\s+/g, " ")));
}

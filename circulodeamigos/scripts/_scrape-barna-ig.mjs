const urls = [
  "https://www.instagram.com/barnamanagement/",
  "https://www.instagram.com/nuevaacropolisrd/",
];

for (const url of urls) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  console.log("\n===", url, res.status, html.length, "===");
  for (const pat of [
    /"display_url":"([^"]+)"/g,
    /"thumbnail_src":"([^"]+)"/g,
    /content="(https:\/\/scontent[^"]+)"/g,
  ]) {
    const m = [...html.matchAll(pat)].slice(0, 8);
    if (m.length) {
      console.log("pattern", pat.source.slice(0, 30), m.length);
      m.forEach((x) =>
        console.log(x[1].replace(/\\u0026/g, "&").slice(0, 120)),
      );
    }
  }
  const textHits = [...html.matchAll(/.{0,60}(acropolis|conflict|eva|experiencia).{0,60}/gi)].slice(0, 5);
  textHits.forEach((h) => console.log("HIT:", h[0].replace(/\s+/g, " ").slice(0, 140)));
}

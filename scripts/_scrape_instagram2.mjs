const res = await fetch("https://www.instagram.com/nuevaacropolisdominicana/", {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
});
const html = await res.text();
for (const pat of [
  /"display_url":"([^"]+)"/g,
  /"thumbnail_src":"([^"]+)"/g,
  /"src":"(https:\\/\\/scontent[^"]+)"/g,
  /content="(https:\/\/scontent[^"]+)"/g,
]) {
  const m = [...html.matchAll(pat)].slice(0, 6);
  if (m.length) {
    console.log("\nPattern", pat.source.slice(0, 30), m.length);
    m.forEach((x) => console.log(x[1].replace(/\\u0026/g, "&").slice(0, 100)));
  }
}

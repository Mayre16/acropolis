const html = await fetch("https://www.acropolis.org.do/circulo-de-amigos/", {
  signal: AbortSignal.timeout(60000),
}).then((r) => r.text());

const patterns = [
  /https:\/\/www\.acropolis\.org\.do\/wp-content\/uploads\/[^"'\s)]+\.(?:jpg|jpeg|png|webp)/gi,
  /\/wp-content\/uploads\/[^"'\s)]+\.(?:jpg|jpeg|png|webp)/gi,
  /data-src="([^"]+)"/gi,
  /src="([^"]*wp-content[^"]+)"/gi,
];

const found = new Set();
for (const re of patterns) {
  for (const m of html.matchAll(re)) {
    const u = m[1] ?? m[0];
    found.add(u.startsWith("http") ? u : `https://www.acropolis.org.do${u}`);
  }
}

console.log("FOUND", found.size);
[...found].sort().forEach((u) => console.log(u));

const pages = [
  "https://www.acropolis.org.do",
  "https://www.acropolis.org.do/esfera/",
  "https://www.acropolis.org.do/voluntariado/",
  "https://www.acropolis.org.do/quienes-somos/",
];
const all = new Set();
for (const url of pages) {
  const html = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } }).then((r) => r.text());
  for (const m of html.matchAll(/wp-content\/uploads\/[^"'\s>]+\.(jpg|jpeg|png|webp)/gi)) all.add(m[0]);
}
[...all].sort().forEach((u) => console.log(u));

const urls = [
  "https://www.acropolis.org.do",
  "https://www.acropolis.org.do/fotos-de-nuestras-actividades/",
];

for (const url of urls) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  const matches = [...html.matchAll(/wp-content\/uploads\/[^"'\s>]+\.(jpg|jpeg|png|webp)/gi)];
  const unique = [...new Set(matches.map((m) => m[0]))];
  console.log(`\n=== ${url} (${unique.length}) ===`);
  unique.forEach((u) => console.log(u));
}

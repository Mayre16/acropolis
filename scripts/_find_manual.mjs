const urls = [
  "https://www.acropolis.org.do/esfera/",
  "https://www.acropolis.org.do/voluntariado/",
  "https://spherestandards.org/",
];

for (const url of urls) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const imgs = [...html.matchAll(/https?:\/\/[^"'\s>]+\.(jpg|jpeg|png|webp)/gi)].map((m) => m[0]);
    const esfera = imgs.filter((u) => /esfera|manual|sphere|handbook/i.test(u));
    console.log(`\n=== ${url} ===`);
    esfera.slice(0, 15).forEach((u) => console.log(u));
    if (!esfera.length) imgs.filter((u) => /manual|esfera/i.test(u)).slice(0, 10).forEach((u) => console.log(u));
  } catch (e) {
    console.log(url, e.message);
  }
}

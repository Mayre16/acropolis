const html = await fetch("https://www.acropolis.org.do", {
  headers: { "User-Agent": "Mozilla/5.0" },
}).then((r) => r.text());
const all = [...html.matchAll(/wp-content\/uploads\/[^"'\s>]+\.(jpg|jpeg|png|webp)/gi)].map((m) => m[0]);
const hits = all.filter((u) => /esfera|manual|sphere/i.test(u));
console.log("hits", hits.length);
hits.forEach((u) => console.log(u));
// also search full html for manual esfera
const idx = html.toLowerCase().indexOf("manual esfera");
if (idx >= 0) console.log("context:", html.slice(Math.max(0, idx - 200), idx + 400));

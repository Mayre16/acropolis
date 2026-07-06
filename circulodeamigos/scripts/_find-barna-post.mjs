const res = await fetch("https://www.acropolis.org.do/?s=barna+management", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const html = await res.text();
const posts = [...html.matchAll(/href="(https:\/\/www\.acropolis\.org\.do\/20[^"]+)"/g)].map(
  (m) => m[1],
);
console.log("posts", [...new Set(posts)]);
const imgs = [...html.matchAll(/wp-content\/uploads\/[^"'\\s>]+\.(jpg|jpeg|png|webp)/gi)].map(
  (m) => m[0],
);
console.log("imgs", [...new Set(imgs)]);

// also search medios/articles for conflictos barna
const res2 = await fetch("https://www.acropolis.org.do/?s=conflictos+barna", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const html2 = await res2.text();
const posts2 = [...html2.matchAll(/href="(https:\/\/www\.acropolis\.org\.do\/20[^"]+)"/g)].map(
  (m) => m[1],
);
console.log("posts2", [...new Set(posts2)]);

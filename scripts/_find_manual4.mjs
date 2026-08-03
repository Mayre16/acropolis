const html = await fetch("https://practicalactionpublishing.com/book/602/el-manual-esfera", {
  headers: { "User-Agent": "Mozilla/5.0" },
}).then((r) => r.text());
const imgs = [...html.matchAll(/https?:\/\/[^"'\s>]+\.(jpg|jpeg|png|webp)/gi)].map((m) => m[0]);
[...new Set(imgs)].forEach((u) => console.log(u));

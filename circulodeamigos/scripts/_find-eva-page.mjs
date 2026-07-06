const res = await fetch("https://www.acropolis.org.do/?s=eva+rodriguez", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const html = await res.text();
const posts = [...html.matchAll(/href="(https:\/\/www\.acropolis\.org\.do\/[^"]+)"/g)].map(
  (m) => m[1],
);
console.log([...new Set(posts)].slice(0, 15).join("\n"));
const idx = html.indexOf("dd.jpg");
if (idx > -1) {
  console.log("\nDD context:\n", html.slice(idx - 800, idx + 400).replace(/\s+/g, " "));
}

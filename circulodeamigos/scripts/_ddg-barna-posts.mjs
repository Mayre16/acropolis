const queries = [
  "site:linkedin.com/posts/barna-management-school Acropolis",
  "site:linkedin.com/posts/barna-management-school Acrópolis",
  "site:linkedin.com/posts/barna-management-school conflictos",
  "site:linkedin.com/posts/barna-management-school Gabriel",
  "site:linkedin.com/posts/barna-management-school filosofia",
  "site:linkedin.com/posts/nuevaacropolis barna",
  "site:linkedin.com/posts nueva acropolis republica dominicana barna",
];

for (const q of queries) {
  await new Promise((r) => setTimeout(r, 800));
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  const html = await res.text();
  console.log(`\n=== ${q} ===`);
  const links = [...html.matchAll(/uddg=([^&"]+)/g)].map((m) =>
    decodeURIComponent(m[1]),
  );
  [...new Set(links)].slice(0, 8).forEach((l) => console.log(l));
}

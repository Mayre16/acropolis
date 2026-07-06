const queries = [
  "site:linkedin.com/posts barna-management-school gabriel",
  "site:linkedin.com/posts barna-management-school eva",
  "site:linkedin.com/posts barna-management-school filosofia",
  "site:linkedin.com/posts barna-management-school liderazgo convivencia",
  "site:linkedin.com/posts nueva-acropolis barna",
  '"EXPERIENCIA | BARNA" linkedin',
  "barna management school nueva acropolis charla linkedin",
];

for (const q of queries) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  const html = await res.text();
  console.log(`\n=== ${q} ===`);
  const links = [...html.matchAll(/uddg=([^&"]+)/g)].map((m) =>
    decodeURIComponent(m[1]),
  );
  [...new Set(links)].slice(0, 10).forEach((l) => console.log(l));
}

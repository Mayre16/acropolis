const queries = [
  "site:linkedin.com/posts barna-management-school experiencia",
  "site:linkedin.com/posts barna-management-school acropolis",
  "site:linkedin.com/posts barna-management-school conflictos",
  "site:linkedin.com/posts barna-management-school nueva-acropolis",
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
  [...new Set(links)].slice(0, 12).forEach((l) => console.log(l));
}

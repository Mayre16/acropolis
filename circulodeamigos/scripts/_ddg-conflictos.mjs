const queries = [
  "Gabriel Paredes Barna conflictos linkedin",
  "Gabriel Paredes Nueva Acropolis Barna linkedin",
  "Los conflictos como retos oportunidades Barna linkedin",
  "Eva Rodriguez Nueva Acropolis Barna linkedin",
  "site:linkedin.com conflictos retos oportunidades barna",
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

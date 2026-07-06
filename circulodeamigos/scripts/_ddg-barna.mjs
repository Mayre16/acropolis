const queries = [
  "Los conflictos como retos y oportunidades Barna",
  "Nueva Acropolis Barna Management School",
  "EXPERIENCIA BARNA Nueva Acropolis",
  "Eva Rodriguez Barna conflictos",
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
  [...new Set(links)].slice(0, 8).forEach((l) => console.log(l));
}

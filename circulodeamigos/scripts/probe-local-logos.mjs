const bases = [
  process.env.CIVIS_BASE,
  "http://localhost:3200",
  "http://localhost:3200/acropolis/civis",
].filter(Boolean);

let base = bases[0];
for (const candidate of bases) {
  const ok = await fetch(`${candidate}/`).then((r) => r.status === 200).catch(() => false);
  if (ok) {
    base = candidate;
    break;
  }
}
console.log("Using base:", base);

const paths = ["/", "/quienes-somos/?tab=nueva-acropolis"];

for (const path of paths) {
  const res = await fetch(`${base}${path}`);
  const html = await res.text();
  console.log(`\n=== ${path} (${res.status}) ===`);
  const heights = [
    ...new Set([...html.matchAll(/--brand-logo-h:([^\]"\\]+)/g)].map((m) => m[1])),
  ];
  console.log("  heights:", heights.join(" | ") || "(client-only)");
  console.log("  REPÚBLICA (oinadom):", /REPÚBLICA|REP\\u00daBLICA/i.test(html));
  console.log("  ORGANIZACIÓN (oina):", /ORGANIZACIÓN INTERNACIONAL|ORGANIZACI\\u00d3N INTERNACIONAL/i.test(html));
}

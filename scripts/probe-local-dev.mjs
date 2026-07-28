const base =
  process.env.NEXT_PUBLIC_BASE_PATH?.trim().replace(/\/$/, "") || "";
const paths = ["/", "/contenido", "/voluntariado"].map((p) => `${base}${p}`);
console.log("Local dev base:", base || "(root)");
for (const path of paths) {
  const res = await fetch(`http://localhost:3100${path}`);
  const html = await res.text();
  console.log(`\n=== ${path} (${res.status}) ===`);
  const heights = [
    ...new Set([...html.matchAll(/--brand-logo-h:([^\]"\\]+)/g)].map((m) => m[1])),
  ];
  console.log("  heights:", heights.join(" | ") || "(client-only)");
  console.log("  REPÚBLICA:", /REPÚBLICA|REP\\u00daBLICA/i.test(html));
  console.log("  ORGANIZACIÓN:", /ORGANIZACIÓN|ORGANIZACI\\u00d3N/i.test(html));
  console.log("  SVG wordmark:", /viewBox="0 0 1000 120"/.test(html));
}

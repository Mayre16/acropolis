const html = await fetch("https://mayre16.github.io/acropolis/principal/").then((r) => r.text());
const paths = [
  ...new Set([
    ...html.matchAll(/\/acropolis\/principal\/[^"'\\s]+\.js/g),
    ...html.matchAll(/na-assets\/[^"'\\s]+\.js/g),
    ...html.matchAll(/\/na-assets\/[^"'\\s]+\.js/g),
  ].flatMap((m) => [...m].map((x) => x[0]))),
];
console.log("Sample HTML around 7088:", html.includes("7088") ? html.slice(html.indexOf("7088") - 80, html.indexOf("7088") + 80) : "not found");
console.log("JS paths:", paths.length);
for (const p of paths.slice(0, 25)) {
  const url = p.startsWith("http") ? p : p.startsWith("/") ? `https://mayre16.github.io${p.startsWith("/acropolis") ? p : "/acropolis/principal/" + p.replace(/^\//, "")}` : `https://mayre16.github.io/acropolis/principal/${p}`;
  const st = await fetch(url, { method: "HEAD" }).then((r) => r.status).catch(() => "err");
  console.log(st, url.replace("https://mayre16.github.io", ""));
}

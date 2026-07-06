const urls = [
  "https://www.facebook.com/BarnaManagementSchool/photos",
  "https://www.facebook.com/nuevaacropolisrd/photos",
];

for (const url of urls) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
  });
  const html = await res.text();
  console.log(`\n=== ${url} (${res.status}) ===`);
  const imgs = [...html.matchAll(/https:\/\/[^"'\\]+fbcdn\.net[^"'\\]+\.(jpg|png)/gi)].map(
    (m) => m[0],
  );
  const unique = [...new Set(imgs)].filter((u) => !u.includes("160x160") && !u.includes("s160x160"));
  unique.slice(0, 15).forEach((u) => console.log(u.slice(0, 120)));
  const hits = [...html.matchAll(/.{0,60}(acropolis|Acropolis|conflict|Eva|Gabriel|Experiencia).{0,60}/gi)].slice(0, 5);
  hits.forEach((h) => console.log("HIT:", h[0].replace(/\s+/g, " ").slice(0, 120)));
}

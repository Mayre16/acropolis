const urls = [
  "https://www.linkedin.com/company/nueva-acropolis-international-organization/posts/?feedView=all",
  "https://do.linkedin.com/school/barna-management-school/posts/?feedView=all",
];

for (const url of urls) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();
  console.log("\n===", url, res.status, html.length, "===");
  const imgs = [...html.matchAll(/https:\/\/media\.licdn\.com[^"'\\s>]+\.(jpg|jpeg|png|webp)/gi)].map(
    (m) => m[0],
  );
  console.log("imgs", [...new Set(imgs)].slice(0, 10).join("\n"));
  const acts = [...html.matchAll(/urn:li:activity:\d+/g)].map((m) => m[0]);
  console.log("activities", [...new Set(acts)].slice(0, 10).join("\n"));
  const hits = [...html.matchAll(/.{0,80}(conflict|acropolis|barna|eva|gabriel).{0,80}/gi)].slice(0, 8);
  hits.forEach((h) => console.log("HIT:", h[0].replace(/\s+/g, " ").slice(0, 160)));
}

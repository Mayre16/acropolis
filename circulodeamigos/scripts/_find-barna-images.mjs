const urls = [
  "https://www.acropolis.org.do/?s=barna",
  "https://www.acropolis.org.do/?s=conflictos",
  "https://www.acropolis.org.do/?s=eva+rodriguez",
  "https://barna.edu.do/?s=acropolis",
  "https://www.linkedin.com/feed/update/urn:li:activity:7463735096928530433/",
];

for (const url of urls) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    const html = await res.text();
    const patterns = [
      /wp-content\/uploads\/[^"'\\s>]+\.(jpg|jpeg|png|webp)/gi,
      /https:\/\/media\.licdn\.com[^"'\\s>]+\.(jpg|jpeg|png|webp)/gi,
      /https:\/\/[^"'\\s>]*barna[^"'\\s>]*\.(jpg|jpeg|png|webp)/gi,
    ];
    const all = new Set();
    for (const pat of patterns) {
      for (const m of html.matchAll(pat)) all.add(m[0]);
    }
    console.log(`\n=== ${url} (${res.status}) ${all.size} imgs ===`);
    [...all].slice(0, 20).forEach((u) => console.log(u));
    if (/conflict|barna|eva|acropolis/i.test(html)) {
      const snippets = html.match(/.{0,80}(conflict|barna|eva|acropolis).{0,80}/gi);
      if (snippets) snippets.slice(0, 3).forEach((s) => console.log("SNIP:", s.replace(/\s+/g, " ").slice(0, 160)));
    }
  } catch (e) {
    console.log(url, e.message);
  }
}

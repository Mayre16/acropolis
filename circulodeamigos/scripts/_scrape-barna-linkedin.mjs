const url =
  "https://www.linkedin.com/company/barnamanagement/posts/?feedView=all";

const res = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
  },
});
const html = await res.text();
console.log("status", res.status, "len", html.length);

const imgs = [
  ...html.matchAll(/https:\/\/media\.licdn\.com[^"'\\s>]+\.(jpg|jpeg|png|webp)/gi),
];
console.log("imgs", imgs.length);
[...new Set(imgs.map((m) => m[0]))].slice(0, 25).forEach((u) => console.log(u));

const snippets = [
  ...html.matchAll(
    /.{0,100}(acropolis|Acropolis|conflict|Nueva|Eva|Gabriel|Experiencia).{0,100}/gi,
  ),
];
snippets.slice(0, 15).forEach((s) =>
  console.log("SNIP:", s[0].replace(/\s+/g, " ").slice(0, 180)),
);

const activities = [
  ...html.matchAll(/urn:li:activity:\d+/g),
];
console.log("activities", [...new Set(activities.map((m) => m[0]))].slice(0, 10));

const res = await fetch("https://www.instagram.com/nuevaacropolisdominicana/", {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html",
  },
});
const html = await res.text();
const shared = html.match(/"edge_owner_to_timeline_media":\s*(\{[^}]+\})/);
console.log("status", res.status, "len", html.length);
const imgMatches = [...html.matchAll(/"display_url":"([^"]+)"/g)].slice(0, 8);
imgMatches.forEach((m, i) => console.log(i + 1, m[1].slice(0, 80) + "..."));

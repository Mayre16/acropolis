const USER = "nuevaacropolisdominicana";
const urls = [
  `https://www.picuki.com/profile/${USER}`,
  `https://imginn.com/${USER}`,
  `https://gramhir.com/profile/${USER}`,
];

for (const url of urls) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });
    const t = await res.text();
    const links = [
      ...new Set(
        [...t.matchAll(/instagram\.com\/p\/([A-Za-z0-9_-]+)/g)].map((m) => m[1]),
      ),
    ].slice(0, 8);
    const imgs = [...t.matchAll(/https:\/\/[^"'\s]*cdninstagram[^"'\s]*/g)].slice(
      0,
      3,
    );
    console.log("\n", url, res.status, "links", links, "imgs", imgs.length);
    if (imgs[0]) console.log(" sample", imgs[0][0].slice(0, 100));
  } catch (e) {
    console.log(url, e.message);
  }
}

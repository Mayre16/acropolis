const codes = ["C9vFlxtvJCl", "DTCD1NHjusg", "DBCAWHxN9KE", "DF2xM_5uMgW"];

for (const code of codes) {
  const postUrl = `https://www.instagram.com/p/${code}/`;
  const embed = await fetch(`${postUrl}embed/captioned/`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
  });
  const html = await embed.text();
  const thumb =
    html.match(/src="(https:\/\/[^"]+\.jpg[^"]*)"/)?.[1]?.replace(/&amp;/g, "&") ??
    html.match(/srcset="(https:\/\/[^"\s]+)/)?.[1];
  console.log(code, embed.status, thumb?.slice(0, 90) ?? "no thumb");

  const media = await fetch(`${postUrl}media/?size=l`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "manual",
  });
  console.log("  media redirect", media.status, media.headers.get("location")?.slice(0, 90));
}

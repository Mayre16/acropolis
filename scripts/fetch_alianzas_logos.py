"""Descarga logos de alianzas Esfera desde sitios oficiales."""
import os
import re
import ssl
import urllib.parse
import urllib.request

OUT = r"c:\Users\marth\Cursor Projects\acropolis.org.do\principal\public\brand\alianzas"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, context=CTX, timeout=25) as resp:
        return resp.read()


def save(name: str, data: bytes, ext: str = ".png") -> str:
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name + ext)
    with open(path, "wb") as f:
        f.write(data)
    print(f"saved {path} ({len(data)} bytes)")
    return path


def abs_url(base: str, link: str) -> str:
    return urllib.parse.urljoin(base, link)


def try_urls(pairs: list[tuple[str, str]]) -> bool:
    for name, url in pairs:
        try:
            data = fetch(url)
            if len(data) < 400 or data[:15].lower().startswith(b"<!doctype") or b"<html" in data[:300].lower():
                print(f"skip {name}: not image ({len(data)})")
                continue
            ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or ".png"
            if ext not in {".png", ".jpg", ".jpeg", ".svg", ".webp"}:
                ext = ".png"
            save(name, data, ext)
            return True
        except Exception as e:
            print(f"fail {name} {url}: {e}")
    return False


def scrape_logos(base_url: str, name: str) -> bool:
    try:
        html = fetch(base_url).decode("utf-8", "ignore")
    except Exception as e:
        print(f"scrape fail {base_url}: {e}")
        return False
    patterns = [
        r'(?:src|href)=["\']([^"\']*(?:logo|Logo|brand|escudo|header)[^"\']*)["\']',
        r'url\(["\']?([^"\']*(?:logo|Logo)[^"\']*)["\']?\)',
    ]
    candidates: list[str] = []
    for pat in patterns:
        candidates.extend(re.findall(pat, html, re.I))
    for link in candidates:
        url = abs_url(base_url, link)
        if try_urls([(name, url)]):
            return True
    imgs = re.findall(r'src=["\']([^"\']+\.(?:png|jpg|svg|webp))["\']', html, re.I)
    for link in imgs[:20]:
        if any(k in link.lower() for k in ("logo", "brand", "escudo", "header", "pucmm", "indomet", "cruz")):
            url = abs_url(base_url, link)
            if try_urls([(name, url)]):
                return True
    return False


DIRECT = [
    ("coe", "https://www.coe.gob.do/images/logo.png"),
    (
        "cruz-roja",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Emblem_of_the_Red_Cross.svg/320px-Emblem_of_the_Red_Cross.svg.png",
    ),
    (
        "pucmm",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/PUCMM_logo.svg/320px-PUCMM_logo.svg.png",
    ),
    (
        "indomet",
        "https://www.indomet.gob.do/themes/custom/indomet/logo.svg",
    ),
]

if __name__ == "__main__":
    for name, url in DIRECT:
        if not os.path.exists(os.path.join(OUT, f"{name}.png")) and not os.path.exists(
            os.path.join(OUT, f"{name}.svg")
        ):
            if not try_urls([(name, url)]):
                pass

    scrape_logos("https://www.indomet.gob.do/", "indomet")
    scrape_logos("https://www.pucmm.edu.do/", "pucmm")
    scrape_logos("https://www.cruzroja.org.do/", "cruz-roja")
    scrape_logos("https://cruzroja.org.do/", "cruz-roja")

    print("--- files ---")
    for f in sorted(os.listdir(OUT)):
        print(f, os.path.getsize(os.path.join(OUT, f)))

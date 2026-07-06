"""Descarga logos de clientes Civis."""
import os
import shutil
import ssl
import urllib.parse
import urllib.request

OUT = r"c:\Users\marth\Cursor Projects\acropolis.org.do\civis\public\brand\clientes"
ALIANZAS = r"c:\Users\marth\Cursor Projects\acropolis.org.do\principal\public\brand\alianzas"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, context=CTX, timeout=25) as resp:
        return resp.read()


def save(name: str, data: bytes, ext: str) -> str:
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name + ext)
    with open(path, "wb") as f:
        f.write(data)
    print(f"saved {path} ({len(data)} bytes)")
    return path


def try_urls(pairs: list[tuple[str, str]]) -> bool:
    for name, url in pairs:
        try:
            data = fetch(url)
            if len(data) < 400 or data[:15].lower().startswith(b"<!doctype"):
                print(f"skip {name}: not image")
                continue
            ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or ".png"
            if ext not in {".png", ".jpg", ".jpeg", ".svg", ".webp"}:
                ext = ".png"
            save(name, data, ext)
            return True
        except Exception as e:
            print(f"fail {name} {url}: {e}")
    return False


# Reutilizar alianzas Esfera ya curadas
for src_name in ("cruz-roja", "coe", "pucmm", "indomet"):
    for ext in (".webp", ".png", ".svg"):
        src = os.path.join(ALIANZAS, src_name + ext)
        if os.path.exists(src):
            dst = os.path.join(OUT, src_name + ext)
            os.makedirs(OUT, exist_ok=True)
            shutil.copy2(src, dst)
            print(f"copied {src} -> {dst}")
            break

DIRECT = [
    (
        "policia-nacional",
        [
            "https://upload.wikimedia.org/wikipedia/commons/4/4a/Emblema_Polic%C3%ADa_Nacional.png",
        ],
    ),
    (
        "bonanza",
        [
            "https://www.grupobonanza.com.do/wp-content/uploads/2020/06/logo-bonanza.png",
            "https://www.bonanza.com.do/wp-content/uploads/2020/06/logo-bonanza.png",
        ],
    ),
    (
        "barna",
        [
            "https://barna.edu.do/wp-content/uploads/2020/06/logo-barna.png",
            "https://barna.edu.do/wp-content/uploads/2019/05/logo-barna-management-school.png",
        ],
    ),
]


def scrape_site(base_url: str, name: str) -> bool:
    import re

    try:
        html = fetch(base_url).decode("utf-8", "ignore")
    except Exception as e:
        print(f"scrape fail {base_url}: {e}")
        return False
    imgs = re.findall(r'src=["\']([^"\']+\.(?:png|jpg|svg|webp))["\']', html, re.I)
    for link in imgs:
        if any(k in link.lower() for k in ("logo", "brand", "barna", "bonanza")):
            url = urllib.parse.urljoin(base_url, link)
            if try_urls([(name, url)]):
                return True
    return False

for name, urls in DIRECT:
    dst_base = os.path.join(OUT, name)
    if any(os.path.exists(dst_base + ext) for ext in (".webp", ".png", ".svg", ".jpg")):
        print(f"skip {name}: exists")
        continue
    if not try_urls([(name, url) for url in urls]):
        sites = {
            "barna": "https://barna.edu.do/",
            "bonanza": "https://www.bonanza.com.do/",
        }
        if name in sites:
            scrape_site(sites[name], name)

print("--- files ---")
for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(os.path.join(OUT, f)))

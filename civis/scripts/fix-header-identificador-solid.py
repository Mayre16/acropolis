"""
Regenera el identificador Civis (incluye header) con fondo blanco sólido RGB.
Fuente: JPG oficial con fondo blanco (sin alpha).
Recorta el bloque de marca y lo escala a 954×165.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    ROOT.parent / "CIVIS-IDENTIFICADOR.jpg",
    Path(r"C:\Users\marth\Downloads\CIVIS-IDENTIFICADOR.jpg"),
    ROOT / "public/brand/identificadores/civis-identificador-bg.webp",
]
OUT_DIR = ROOT / "public/brand/identificadores"
OUT_HEADER = OUT_DIR / "civis-identificador-header.webp"
OUT_MAIN = OUT_DIR / "civis-identificador.webp"
OUT_PNG = OUT_DIR / "civis-identificador.png"

BANNER_W, BANNER_H = 954, 165
CROP_TOP, CROP_RIGHT, CROP_BOTTOM, CROP_LEFT = 3, 3, 1, 0
WHITE = (255, 255, 255)


def find_source() -> Path:
    for p in SOURCES:
        if p.exists():
            return p
    raise FileNotFoundError("No se encontró CIVIS-IDENTIFICADOR.jpg")


def flatten_rgb(im: Image.Image, bg=WHITE) -> Image.Image:
    if im.mode == "RGB":
        return im.copy()
    rgba = im.convert("RGBA")
    base = Image.new("RGB", rgba.size, bg)
    base.paste(rgba, mask=rgba.split()[-1])
    return base


def content_bbox(im: Image.Image, threshold: int = 245, pad: int = 4) -> tuple[int, int, int, int]:
    pixels = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if r < threshold or g < threshold or b < threshold:
                found = True
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if not found:
        return 0, 0, w, h
    minx = max(0, minx - pad)
    miny = max(0, miny - pad)
    maxx = min(w, maxx + 1 + pad)
    maxy = min(h, maxy + 1 + pad)
    return minx, miny, maxx, maxy


def fit_banner(src: Image.Image) -> Image.Image:
    box = content_bbox(src)
    cropped = src.crop(box)
    # Escalado a alto del banner; ancho proporcional, luego pad a 954.
    ratio = BANNER_H / cropped.height
    nw = max(1, int(round(cropped.width * ratio)))
    nh = BANNER_H
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (BANNER_W, BANNER_H), WHITE)
    # Si cabe, alinear a la izquierda; si sobra, escalar a ancho.
    if nw > BANNER_W:
        ratio_w = BANNER_W / cropped.width
        nw2 = BANNER_W
        nh2 = max(1, int(round(cropped.height * ratio_w)))
        resized = cropped.resize((nw2, nh2), Image.Resampling.LANCZOS)
        canvas.paste(resized, (0, (BANNER_H - nh2) // 2))
    else:
        canvas.paste(resized, (0, 0))
    return canvas


def main() -> None:
    src_path = find_source()
    print("Fuente:", src_path)
    fitted = fit_banner(flatten_rgb(Image.open(src_path)))

    fitted.save(OUT_PNG, format="PNG", optimize=True)
    fitted.save(OUT_MAIN, format="WEBP", quality=92, method=6)

    w = BANNER_W - CROP_LEFT - CROP_RIGHT
    h = BANNER_H - CROP_TOP - CROP_BOTTOM
    header = fitted.crop((CROP_LEFT, CROP_TOP, CROP_LEFT + w, CROP_TOP + h))
    header.save(OUT_HEADER, format="WEBP", quality=92, method=6)

    for p in (OUT_PNG, OUT_MAIN, OUT_HEADER):
        check = Image.open(p)
        print(p.name, check.mode, check.size, "has_alpha=", "A" in check.getbands())

    preview = OUT_DIR / "_preview-header.png"
    header.save(preview)
    print("Preview:", preview)


if __name__ == "__main__":
    main()

"""Aplica civis-indentificador-new.png como identificador oficial (RGB, sin alpha)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MONOREPO = ROOT.parent
SOURCES = [
    MONOREPO / "civis-indentificador-new.png",
    MONOREPO / "civis-identificador-new.png",
]
OUT_DIR = ROOT / "public/brand/identificadores"
OUT_HEADER = OUT_DIR / "civis-identificador-header.webp"
OUT_MAIN = OUT_DIR / "civis-identificador.webp"
OUT_PNG = OUT_DIR / "civis-identificador.png"

# Proporción del archivo nuevo (~5.9:1). Header usa el mismo asset recortado leve.
CROP_TOP, CROP_RIGHT, CROP_BOTTOM, CROP_LEFT = 2, 2, 1, 0
WHITE = (255, 255, 255)


def find_source() -> Path:
    for p in SOURCES:
        if p.exists():
            return p
    raise FileNotFoundError("No se encontró civis-indentificador-new.png")


def flatten_rgb(im: Image.Image) -> Image.Image:
    if im.mode == "RGB":
        return im.copy()
    rgba = im.convert("RGBA")
    base = Image.new("RGB", rgba.size, WHITE)
    base.paste(rgba, mask=rgba.split()[-1])
    return base


def main() -> None:
    src_path = find_source()
    print("Fuente:", src_path)
    fitted = flatten_rgb(Image.open(src_path))
    print("Origen:", fitted.mode, fitted.size)

    # Guardar a tamaño nativo (mejor calidad en retina); el CSS escala.
    fitted.save(OUT_PNG, format="PNG", optimize=True)
    fitted.save(OUT_MAIN, format="WEBP", quality=95, method=6)

    w = fitted.width - CROP_LEFT - CROP_RIGHT
    h = fitted.height - CROP_TOP - CROP_BOTTOM
    header = fitted.crop((CROP_LEFT, CROP_TOP, CROP_LEFT + w, CROP_TOP + h))
    header.save(OUT_HEADER, format="WEBP", quality=95, method=6)

    for p in (OUT_PNG, OUT_MAIN, OUT_HEADER):
        check = Image.open(p)
        print(p.name, check.mode, check.size, "has_alpha=", "A" in check.getbands())

    # Actualizar dimensiones en site-config si cambian
    print("MAIN_W", fitted.width, "MAIN_H", fitted.height)
    print("HEADER_W", header.width, "HEADER_H", header.height)


if __name__ == "__main__":
    main()

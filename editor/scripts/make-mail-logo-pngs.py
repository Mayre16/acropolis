"""Genera PNG con fondo blanco para firmas de correo (Gmail no soporta WebP transparente)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "editor" / "api" / "mail-assets"


def flatten(src: Path, dest: Path, max_h: int, bg: tuple[int, int, int, int] | None) -> None:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    if h > max_h:
        ratio = max_h / h
        im = im.resize((max(1, int(w * ratio)), max_h), Image.Resampling.LANCZOS)
    fill = bg if bg is not None else (255, 255, 255, 255)
    canvas = Image.new("RGBA", im.size, fill)
    canvas.paste(im, (0, 0), im)
    final = canvas.convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    final.save(dest, format="PNG", optimize=True)
    print(f"OK {dest.name} {final.size[0]}x{final.size[1]} <- {src.name}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = [
        (
            ROOT / "principal/public/brand/logo-oinadom.webp",
            OUT / "logo-oinadom.png",
            96,
            (255, 255, 255, 255),
        ),
        (
            ROOT / "principal/public/brand/logo-nueva-acropolis-stacked.webp",
            OUT / "logo-na.png",
            88,
            (255, 255, 255, 255),
        ),
        (
            ROOT / "principal/public/brand/logo-esfera-punto-focal.webp",
            OUT / "logo-esfera.png",
            96,
            (255, 255, 255, 255),
        ),
        (
            ROOT / "circulodeamigos/public/brand/identificadores/civis-identificador.png",
            OUT / "logo-civis.png",
            104,
            (255, 255, 255, 255),
        ),
        (
            ROOT / "circulodeamigos/public/img/circulo-amigos/logo-header-cropped.png",
            OUT / "logo-circulo.png",
            80,
            None,
        ),
    ]
    for src, dest, max_h, bg in jobs:
        if not src.exists():
            raise SystemExit(f"MISSING {src}")
        flatten(src, dest, max_h, bg)


if __name__ == "__main__":
    main()

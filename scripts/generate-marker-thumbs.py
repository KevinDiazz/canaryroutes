#!/usr/bin/env python3
"""
Genera miniaturas livianas para los iconos circulares del mapa (PoiMarker / MunicipioMarker).

Para cada imagen "hero" referenciada en content/**/*.json (campos "hero" o "heroImage"),
crea una versión recortada a cuadrado y redimensionada a MARKER_SIZE px, guardada junto
al original con el sufijo "-marker" (ej. hero.avif -> hero-marker.avif).

La imagen original NO se modifica (se sigue usando en la card de detalle / hero grande).
Re-ejecutable: si la miniatura ya existe y es más reciente que el original, se omite.
"""
import json
import re
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CONTENT = ROOT / "content"
MARKER_SIZE = 120
QUALITY = 50

HERO_RE = re.compile(r'"(?:hero|heroImage)"\s*:\s*"(/images/[^"]+)"')


def find_hero_paths() -> set[str]:
    paths: set[str] = set()
    for json_file in CONTENT.rglob("*.json"):
        text = json_file.read_text(encoding="utf-8")
        for m in HERO_RE.finditer(text):
            paths.add(m.group(1))
    return paths


def marker_path(rel_path: str) -> str:
    """/images/foo/hero.avif -> /images/foo/hero-marker.avif"""
    p = Path(rel_path)
    return str(p.with_name(f"{p.stem}-marker{p.suffix}"))


def generate(src: Path, dst: Path) -> None:
    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        im = im.crop((left, top, left + side, top + side))
        im = im.resize((MARKER_SIZE, MARKER_SIZE), Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, format="AVIF", quality=QUALITY)


def main() -> int:
    hero_paths = find_hero_paths()
    created = 0
    skipped = 0
    missing = 0
    for rel in sorted(hero_paths):
        src = PUBLIC / rel.lstrip("/")
        if not src.exists():
            print(f"  [missing] {rel}")
            missing += 1
            continue
        dst_rel = marker_path(rel)
        dst = PUBLIC / dst_rel.lstrip("/")
        if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
            skipped += 1
            continue
        generate(src, dst)
        before = src.stat().st_size
        after = dst.stat().st_size
        print(f"  {rel} -> {dst_rel}  ({before/1024:.0f}KB -> {after/1024:.1f}KB)")
        created += 1

    print(f"\nGeneradas: {created}, ya existían: {skipped}, faltantes: {missing}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""
Ajoute les lettres accentuées du français à Boomtown Deco, qui n'en a aucune.

    uv run --no-project --with fonttools python tools/boomtown-accents.py \\
        BoomtownDeco.ttf src/assets/fonts/boomtown-deco-fr.ttf

Boomtown Deco (Chris Skillern, gratuite pour un usage personnel) ne couvre que
l'ASCII : « Écouter » ou « À six » sortiraient avec une lettre d'une autre
police. On dessine donc les accents (aigu, grave, circonflexe, tréma, cédille)
comme des barres à l'épaisseur des fûts de la police, et on compose chaque
lettre accentuée à partir de la lettre de base : la lettre elle-même reste
celle de Boomtown. C'est ce que Mathilde a fait à la main pour le é du logo.
"""

from __future__ import annotations

import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

# lettre accentuée → (base, accent)
COMPOSEES = {
    'é': ('e', 'aigu'), 'è': ('e', 'grave'), 'ê': ('e', 'circ'), 'ë': ('e', 'trema'),
    'à': ('a', 'grave'), 'â': ('a', 'circ'), 'î': ('i', 'circ'), 'ï': ('i', 'trema'),
    'ô': ('o', 'circ'), 'ù': ('u', 'grave'), 'û': ('u', 'circ'), 'ü': ('u', 'trema'),
    'ç': ('c', 'cedille'),
    'É': ('E', 'aigu'), 'È': ('E', 'grave'), 'Ê': ('E', 'circ'), 'Ë': ('E', 'trema'),
    'À': ('A', 'grave'), 'Â': ('A', 'circ'), 'Î': ('I', 'circ'), 'Ï': ('I', 'trema'),
    'Ô': ('O', 'circ'), 'Ù': ('U', 'grave'), 'Û': ('U', 'circ'), 'Ü': ('U', 'trema'),
    'Ç': ('C', 'cedille'),
}


def bornes(font, nom):
    gs = font.getGlyphSet()
    p = BoundsPen(gs)
    gs[nom].draw(p)
    return p.bounds


def poly(pen, pts):
    pen.moveTo(pts[0])
    for p in pts[1:]:
        pen.lineTo(p)
    pen.closePath()


def main(src: str, dst: str) -> int:
    font = TTFont(src)
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    nom = lambda ch: cmap[ord(ch)]
    # Épaisseur d'un fût : la largeur du I capitale.
    x0, _, x1, cap = bornes(font, nom('I'))
    fut = (x1 - x0)
    _, _, _, xh = bornes(font, nom('x'))
    trait = fut * 0.85
    haut = cap * 0.16
    ecart = cap * 0.07

    glyf, hmtx = font['glyf'], font['hmtx']
    for ch, (base, accent) in COMPOSEES.items():
        if ord(ch) in cmap or ord(base) not in cmap:
            continue
        b = nom(base)
        bx0, by0, bx1, by1 = bornes(font, b)
        cx = (bx0 + bx1) / 2
        y = (by1 if base.isupper() else xh) + ecart
        pen = TTGlyphPen(gs)
        # la lettre de base, telle quelle
        gs[b].draw(pen)
        h = haut * (0.85 if base.islower() else 1)
        if accent == 'aigu':
            poly(pen, [(cx - trait, y), (cx, y), (cx + trait * 1.6, y + h), (cx + trait * 0.6, y + h)])
        elif accent == 'grave':
            poly(pen, [(cx, y), (cx + trait, y), (cx - trait * 0.6, y + h), (cx - trait * 1.6, y + h)])
        elif accent == 'circ':
            w = trait * 1.9
            poly(pen, [(cx - w, y), (cx - w + trait, y), (cx, y + h * 0.62), (cx + w - trait, y),
                       (cx + w, y), (cx + trait * 0.5, y + h), (cx - trait * 0.5, y + h)])
        elif accent == 'trema':
            d = trait * 1.3
            for sx in (-1, 1):
                x = cx + sx * d
                poly(pen, [(x - trait / 2, y), (x + trait / 2, y), (x + trait / 2, y + trait), (x - trait / 2, y + trait)])
        elif accent == 'cedille':
            # un L inversé sous la lettre, comme un crochet géométrique
            t = trait * 0.8
            yb = by0
            poly(pen, [(cx - t / 2, yb), (cx + t / 2, yb), (cx + t / 2, yb - h), (cx - t * 1.5, yb - h),
                       (cx - t * 1.5, yb - h + t), (cx - t / 2, yb - h + t)])
        g = pen.glyph()
        n = f'uni{ord(ch):04X}'
        glyf[n] = g
        hmtx[n] = hmtx[b]
        for table in font['cmap'].tables:
            if table.isUnicode():
                table.cmap[ord(ch)] = n
    # glyf[n] = … a déjà ajouté chaque nom à l'ordre des glyphes de la table.
    font.setGlyphOrder(glyf.glyphOrder)
    font['maxp'].numGlyphs = len(glyf.glyphOrder)
    for rec in font['name'].names:
        if rec.nameID in (1, 4, 6):
            rec.string = {1: 'Boomtown Deco FR', 4: 'Boomtown Deco FR', 6: 'BoomtownDecoFR'}[rec.nameID]
    font.save(dst)
    print(f'{dst} : {len(COMPOSEES)} lettres accentuées ajoutées')
    return 0


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1], sys.argv[2]))

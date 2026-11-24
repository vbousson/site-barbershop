"""
Le pictogramme KatréKatr Set (favicon, icône d'écran d'accueil), d'après le
dessin de Mathilde (novembre 2026) : un K en Boomtown Deco, « Set » à la
verticale en Riesling, dans un cercle doré sur fond crème. Le mot « Set »
couvre toute la hauteur du K : le pied du S sur le bas du K, la barre du t
sur le haut du K.

    uv run --no-project --with fonttools python tools/pictogramme.py RIESLING.ttf

Écrit public/favicon.svg (version onglet : cercle épais, lettres agrandies,
lisible à 16 px) et src/assets/pictogramme.svg (version fidèle, trait fin).
Les PNG (apple-touch-icon 180, icon-512) se tirent de la version fidèle.
"""
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ICI = Path(__file__).resolve().parent.parent
SLATE, GOLD, CREAM = '#353C41', '#E5A43B', '#F4F0E6'
T_FUT = 86  # bord du fût du t côté fin de mot, en unités de Riesling


def charge(p):
    f = TTFont(p)
    return f.getGlyphSet(), f.getBestCmap()


def lettre(font, ch, x, y, h):
    gs, cm = font
    g = gs[cm[ord(ch)]]
    b = BoundsPen(gs)
    g.draw(b)
    x0, y0, x1, y1 = b.bounds
    s = h / (y1 - y0)
    p = SVGPathPen(gs)
    g.draw(TransformPen(p, (s, 0, 0, -s, x - x0 * s, y + y1 * s)))
    return p.getCommands(), (x1 - x0) * s


def mot(font, txt, s):
    gs, cm = font
    d, cur, pos = '', 0.0, {}
    for ch in txt:
        g = gs[cm[ord(ch)]]
        pos[ch] = cur
        p = SVGPathPen(gs)
        g.draw(TransformPen(p, (s, 0, 0, -s, cur, 0)))
        d += p.getCommands()
        cur += g.width * s
    return d, pos


def svg(bt, rs, kh, kx, ky, ecart, ring, r_ring, depasse=0.6):
    k, wk = lettre(bt, 'K', kx, ky, kh)
    gs, cm = rs
    # Échelle de « Set » : du début du mot au haut du fût du t = hauteur du K
    # (plus un léger dépassement du S sous le K, comme sur le dessin).
    t = gs[cm[ord('t')]]
    longueur = gs[cm[ord('S')]].width + gs[cm[ord('e')]].width + T_FUT
    s = (kh + depasse) / longueur
    d, pos = mot(rs, 'Set', s)
    b = BoundsPen(gs)
    gs[cm[ord('S')]].draw(b)
    cap = b.bounds[3] * s
    by = ky + kh + depasse
    bx = kx + wk + ecart + cap  # rotate(-90) : les hauts de lettres pointent à gauche
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="KatréKatr Set">
  <!-- Pictogramme d'après le dessin de Mathilde (novembre 2026), tools/pictogramme.py. -->
  <circle cx="32" cy="32" r="31" fill="{CREAM}"/>
  <circle cx="32" cy="32" r="{r_ring}" fill="none" stroke="{GOLD}" stroke-width="{ring}"/>
  <path d="{k}" fill="{SLATE}"/>
  <path transform="translate({bx:.3f} {by:.3f}) rotate(-90)" d="{d}" fill="{GOLD}"/>
</svg>
'''


def main(riesling):
    bt = charge(ICI / 'src/assets/fonts/boomtown-deco-fr.ttf')
    rs = charge(riesling)
    (ICI / 'src/assets/pictogramme.svg').write_text(svg(bt, rs, kh=31, kx=16.5, ky=16.5, ecart=-1.5, ring=0.8, r_ring=28.8))
    (ICI / 'public/favicon.svg').write_text(svg(bt, rs, kh=35, kx=13, ky=14.5, ecart=-1.5, ring=2.4, r_ring=28))
    print('écrit src/assets/pictogramme.svg et public/favicon.svg')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])

#!/usr/bin/env python3
"""Relève la géométrie du logo KatréKatr Set et détoure son logotype.

    uv run --no-project --with numpy --with pillow --with scipy \\
        python tools/releve-logo.py AFFICHE.jpeg PLANCHE.jpeg

AFFICHE  l'affiche avec le disque blanc cerclé de pêche (5 décembre 2026) :
         c'est d'elle que viennent les positions des six têtes.
PLANCHE  la planche des propositions de logo : on y prend la proposition en
         haut à gauche (la colonne de gauche, première rangée), pour le
         logotype et sa place par rapport aux têtes.

Écrit src/assets/marks/katrekatr-set.png et imprime la table GEOM_KKS à
recopier dans src/data/geometry.ts, avec la valeur de K.

Méthode (la même que pour les logos d'origine, cf. geometry.ts) : encre par
seuil, têtes par composantes connexes, recalage par centroïde d'encre, échelle
par égalisation des aires d'encre avec les têtes déjà dans src/assets/heads/.
Quand Mathilde fournira des fichiers sources, relancer ce script dessus : les
coordonnées de recadrage de la planche (CADRE_PLANCHE) seront à revoir.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

RACINE = Path(__file__).resolve().parent.parent
TETES = RACINE / 'src/assets/heads'
SORTIE_LOGOTYPE = RACINE / 'src/assets/marks/katrekatr-set.png'

# Tailles natives (GEOM, affiche du 16 juillet 2026), en % du disque.
NATIF = {'basse': (19.536, 27.815), 'baryton': (20.751, 27.483), 'lead': (19.757, 26.6),
         'tenor': (19.868, 28.366), 'mezzo': (18.874, 18.985), 'soprano': (23.841, 21.854)}
# Repères approximatifs des têtes sur l'affiche (px), pour l'appariement.
REPERES_AFFICHE = {'tenor': (289, 350), 'basse': (446, 295), 'lead': (656, 306),
                   'baryton': (812, 354), 'soprano': (452, 527), 'mezzo': (656, 514)}
CADRE_PLANCHE = (50, 390, 600, 840)  # x0, y0, x1, y1 : la proposition retenue
RESPIRATION = 0.95  # la marge d'origine autour de la composition
RAYON_UTILE = 47.5  # % : la composition doit tenir dans ce rayon


def composantes(encre, dilatation, aire_min):
    lab, n = ndi.label(ndi.binary_dilation(encre, iterations=dilatation))
    out = []
    for i in range(1, n + 1):
        m = (lab == i) & encre
        a = int(m.sum())
        if a < aire_min:
            continue
        ys, xs = np.nonzero(m)
        out.append(dict(a=a, cx=xs.mean(), cy=ys.mean(), y0=ys.min(), y1=ys.max()))
    return out


def releve_affiche(chemin):
    im = np.asarray(Image.open(chemin).convert('RGB')).astype(int)
    H, W, _ = im.shape
    anneau = (abs(im[..., 0] - 251) < 8) & (abs(im[..., 1] - 236) < 9) & (abs(im[..., 2] - 216) < 12)
    yy, xx = np.nonzero(anneau[: int(H * 0.66)])
    A = np.c_[2 * xx, 2 * yy, np.ones_like(xx)]
    cx, cy, c = np.linalg.lstsq(A, xx**2 + yy**2, rcond=None)[0]
    r = np.sqrt(c + cx**2 + cy**2)
    rins = []
    for a in np.linspace(0, 2 * np.pi, 72, endpoint=False):
        for t in np.arange(r * 0.8, r * 1.2, 0.5):
            x, y = int(round(cx + t * np.cos(a))), int(round(cy + t * np.sin(a)))
            if 0 <= x < W and 0 <= y < H and anneau[y, x]:
                rins.append(t)
                break
    rin = float(np.median(rins))
    yy, xx = np.mgrid[0:H, 0:W]
    dedans = (xx - cx) ** 2 + (yy - cy) ** 2 < (rin - 2) ** 2
    comps = composantes((im.max(axis=2) < 110) & dedans, 6, 300)
    comps.sort(key=lambda k: k['cy'])
    tetes = comps[:6]
    pick = lambda x, y: min(tetes, key=lambda k: (k['cx'] - x) ** 2 + (k['cy'] - y) ** 2)
    return dict(cx=cx, cy=cy, rin=rin), {v: pick(*p) for v, p in REPERES_AFFICHE.items()}


def releve_planche(chemin, disque, tetes_affiche):
    img = Image.open(chemin).convert('RGB')
    x0, y0, x1, y1 = CADRE_PLANCHE
    sub = np.asarray(img).astype(int)[y0:y1, x0:x1]
    encre = sub.max(axis=2) < 110
    comps = composantes(encre, 2, 150)
    tetes = sorted([k for k in comps if k['y1'] + y0 < 700 and k['a'] > 800], key=lambda k: -k['a'])[:6]
    for k in tetes:
        k['cx'] += x0
        k['cy'] += y0
        k['y1'] += y0
    pa = np.array([[k['cx'], k['cy']] for k in tetes_affiche.values()])
    qa = np.array([[k['cx'], k['cy']] for k in tetes])
    pm, qm = pa.mean(0), qa.mean(0)
    echelle = np.sqrt(((pa - pm) ** 2).sum(1).mean()) / np.sqrt(((qa - qm) ** 2).sum(1).mean())
    # le logotype : tout ce qui est sous les têtes
    r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
    or_ = (r > 200) & (b < 170) & (r - b > 60)
    hy1 = max(k['y1'] for k in tetes) - y0
    ys, xs = np.nonzero((encre | or_)[hy1 + 3 :, :])
    boite = (xs.min() + x0 - 4, ys.min() + hy1 + 3 + y0 - 4, xs.max() + x0 + 5, ys.max() + hy1 + 3 + y0 + 5)
    return img, boite, (pm, qm, echelle)


def detoure(img, boite, agrandir=4):
    src = img.crop(boite)
    big = src.resize((src.width * agrandir, src.height * agrandir), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(big).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    or_ = (r - b > 55) & (r > 170)
    gs = a[or_ & ((r - b) > np.percentile((r - b)[or_], 70))]
    teinte = np.median(gs, axis=0)

    def ss(e0, e1, x):
        t = np.clip((x - e0) / (e1 - e0), 0, 1)
        return t * t * (3 - 2 * t)

    lum = 0.299 * r + 0.587 * g + 0.114 * b
    a_encre = ss(0.18, 0.75, (255 - lum) / 255)
    a_or = ss(0.15, 0.8, (255 - b) / (255 - teinte[2]))
    est_or = or_ | ((r - b) > 25)
    alpha = np.where(est_or, a_or, a_encre)
    col = np.zeros_like(a)
    col[est_or] = teinte
    out = Image.fromarray(np.dstack([col, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
    bb = out.getbbox()
    marge = 6
    out = out.crop((max(bb[0] - marge, 0), max(bb[1] - marge, 0), bb[2] + marge, bb[3] + marge))
    decalage = (max(bb[0] - marge, 0) / agrandir, max(bb[1] - marge, 0) / agrandir)
    return out, decalage, agrandir


def main(affiche, planche):
    disque, tetes = releve_affiche(affiche)
    D = 2 * disque['rin']
    L, T = disque['cx'] - disque['rin'], disque['cy'] - disque['rin']
    img, boite, (pm, qm, sim) = releve_planche(planche, disque, tetes)

    boites, echelles, points = {}, [], []
    for v, k in tetes.items():
        a = np.asarray(Image.open(TETES / f'{v}.png').convert('RGBA')).astype(int)
        h, w, _ = a.shape
        encre = (a[..., 3] > 128) & (a[..., :3].max(axis=2) < 110)
        ys, xs = np.nonzero(encre)
        fx, fy = xs.mean(), ys.mean()
        s = np.sqrt(k['a'] / encre.sum())
        echelles.append(s)
        boites[v] = ((k['cx'] - fx * s - L) / D * 100, (k['cy'] - fy * s - T) / D * 100, w * s / D * 100, h * s / D * 100)
        ay, ax = np.nonzero(a[..., 3] > 128)
        points.append(np.c_[(k['cx'] + (ax - fx) * s - L) / D * 100, (k['cy'] + (ay - fy) * s - T) / D * 100][::7])
    s = float(np.mean(echelles))
    print(f'échelle des têtes : {s:.4f} (dispersion {np.ptp(echelles) / s:.1%})', file=sys.stderr)

    logo, (dx0, dy0), up = detoure(img, boite)
    logo.save(SORTIE_LOGOTYPE, optimize=True)

    def p2d(x, y):
        return ((pm[0] + (x - qm[0]) * sim - L) / D * 100, (pm[1] + (y - qm[1]) * sim - T) / D * 100)

    ml, mt = p2d(boite[0] + dx0, boite[1] + dy0)
    mr, mb = p2d(boite[0] + dx0 + logo.width / up, boite[1] + dy0 + logo.height / up)
    al = np.asarray(logo)[..., 3] > 128
    ay, ax = np.nonzero(al)
    points.append(np.c_[ml + ax / logo.width * (mr - ml), mt + ay / logo.height * (mb - mt)][::5])
    P = np.vstack(points)

    meilleur = None
    for dx in np.arange(-6, 6.01, 0.25):
        for dy in np.arange(-6, 6.01, 0.25):
            r = np.sqrt((P[:, 0] + dx - 50) ** 2 + (P[:, 1] + dy - 50) ** 2).max()
            if meilleur is None or r < meilleur[0]:
                meilleur = (r, dx, dy)
    r, dx, dy = meilleur
    c = min(RESPIRATION, RAYON_UTILE / r)
    K = c * s
    pre = lambda v: 50 + (v - 50) * c / K
    print(f'décalage ({dx}, {dy}), rayon {r:.1f} % → composition × {c}, K = {K:.4f}', file=sys.stderr)

    print('export const GEOM_KKS: GeomTable = {')
    for v in ['tenor', 'basse', 'lead', 'baryton', 'soprano', 'mezzo']:
        l, t, w, h = boites[v]
        ow, oh = NATIF[v]
        cx, cy = pre(l + dx + w / 2), pre(t + dy + h / 2)
        print(f'  {v}: {{ left: {cx - ow / 2:.3f}, top: {cy - oh / 2:.3f}, w: {ow}, h: {oh} }},')
    print(f'  mark: {{ left: {pre(ml + dx):.3f}, top: {pre(mt + dy):.3f}, w: {(mr - ml) * c / K:.3f} }},')
    print('};')
    print(f'export const K = {K:.3f};')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])

"""
Remplace les têtes du plateau par les dessins originaux de Mathilde, en haute
définition, sans toucher à la géométrie.

    uv run --no-project --with numpy --with pillow --with opencv-python-headless \\
        python tools/hd-tetes.py <dossier Trombinoscope> [--ecrire]

Les têtes de src/assets/heads/ sont des découpes de l'affiche de juillet
(~240 px de haut) ; leurs cadres sont figés dans src/data/geometry.ts. Pour
chaque voix, on recale l'original du trombinoscope (fond blanc, ~1300 px) sur
l'ancienne découpe : échelle par égalisation des aires d'encre, position par
corrélation, puis affinage ECC (similitude). On ré-échantillonne ensuite
l'original dans le cadre exact de l'ancienne découpe, agrandi d'un facteur
entier-ish proche de la résolution native : même cadrage, même ratio, plus de
pixels. Le fond blanc devient transparent comme dans les découpes (« color to
alpha » vers le blanc : l'intérieur des visages reste transparent).

Sans --ecrire, écrit seulement les résultats et une planche de contrôle dans
tmp_data/hd-tetes/ ; avec, remplace aussi src/assets/heads/<voix>.png.
"""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ICI = Path(__file__).resolve().parent.parent
HEADS = ICI / 'src/assets/heads'
SORTIE = ICI / 'tmp_data/hd-tetes'

# Voix → fichier du trombinoscope (noms donnés par Mathilde).
FICHIERS = {
    'basse': 'Valentin.jpg',
    'baryton': 'Amédée_.jpg',
    'lead': 'Adrien.jpg',
    'tenor': 'Maurin.jpg',
    'alto': 'Aurore.jpg',
    'mezzo': 'Mathilde.jpg',
    'soprano': 'Naïs.jpg',
}


def vers_alpha(rgb: np.ndarray) -> np.ndarray:
    """Blanc → transparent ; encre et aquarelle gardent leur couleur exacte."""
    f = rgb.astype(np.float32) / 255.0
    a = np.clip((1.0 - f).max(axis=2), 0, 1)
    # Un léger seuil efface le grain du papier scanné.
    a = np.clip((a - 0.04) / 0.96, 0, 1)
    safe = np.maximum(a, 1e-4)[..., None]
    c = np.clip((f - (1.0 - safe)) / safe, 0, 1)
    out = np.dstack([c, a]) * 255.0
    return out.round().astype(np.uint8)


def recaler(ancien_a: np.ndarray, nouveau_a: np.ndarray) -> tuple[np.ndarray, float]:
    """Matrice 2×3 qui envoie les pixels du nouveau dans le repère de l'ancien."""
    s = np.sqrt(ancien_a.sum() / nouveau_a.sum())
    h, w = ancien_a.shape
    petit = cv2.resize(nouveau_a, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    # Position : corrélation du petit nouveau dans l'ancien entouré de marges.
    m = max(petit.shape) // 2 + 10
    fond = cv2.copyMakeBorder(ancien_a, m, m, m, m, cv2.BORDER_CONSTANT, value=0)
    if petit.shape[0] > fond.shape[0] or petit.shape[1] > fond.shape[1]:
        raise ValueError('original trop grand après mise à l\'échelle')
    res = cv2.matchTemplate(fond, petit, cv2.TM_CCORR_NORMED)
    _, _, _, (x, y) = cv2.minMaxLoc(res)
    M = np.array([[s, 0, x - m], [0, s, y - m]], np.float32)
    # Affinage : similitude (rotation + échelle + translation) par ECC.
    flou = lambda im: cv2.GaussianBlur(im, (0, 0), 1.2)
    cible = flou(ancien_a)
    src = flou(nouveau_a)
    W = M.copy()
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6)
    # ECC estime la transformation de l'image cible vers l'image source :
    # on lui donne le nouveau déjà projeté, puis on compose.
    proj = cv2.warpAffine(src, W, (w, h), flags=cv2.INTER_LINEAR)
    D = np.eye(2, 3, dtype=np.float32)
    try:
        cc, D = cv2.findTransformECC(cible, proj, D, cv2.MOTION_AFFINE, crit, None, 5)
    except cv2.error:
        cc = float('nan')
    # proj ∘ D⁻¹... : D envoie les coordonnées de la cible vers proj.
    D3 = np.vstack([D, [0, 0, 1]])
    W3 = np.vstack([W, [0, 0, 1]])
    total = np.linalg.inv(D3) @ W3
    return total[:2].astype(np.float32), float(cc)


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    ecrire = '--ecrire' in sys.argv
    if len(args) != 1:
        print(__doc__)
        return 2
    trombi = Path(args[0])
    SORTIE.mkdir(parents=True, exist_ok=True)
    vignettes = []
    for voix, nom in FICHIERS.items():
        ancien = np.array(Image.open(HEADS / f'{voix}.png').convert('RGBA'))
        ancien_a = ancien[..., 3].astype(np.float32) / 255
        nouveau = vers_alpha(np.array(Image.open(trombi / nom).convert('RGB')))
        nouveau_a = nouveau[..., 3].astype(np.float32) / 255
        M, cc = recaler(ancien_a, nouveau_a)
        echelle = float(np.sqrt(abs(np.linalg.det(M[:, :2]))))
        F = min(round(1 / echelle, 1), 6.0)  # pas plus fin que l'original
        h, w = ancien_a.shape
        Mf = M * F
        hd = cv2.warpAffine(nouveau, Mf, (round(w * F), round(h * F)),
                            flags=cv2.INTER_LANCZOS4, borderValue=(0, 0, 0, 0))
        Image.fromarray(hd).save(SORTIE / f'{voix}.png', optimize=True)
        # Contrôle : ancien en rouge, nouveau réduit en bleu.
        retour = cv2.resize(hd[..., 3], (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        ctl = np.dstack([ancien_a, np.zeros_like(ancien_a), retour])
        ctl = (1 - ctl.clip(0, 1)) * 255
        vignettes.append(cv2.resize(ctl.astype(np.uint8), (w * 2, h * 2)))
        recouvrement = float((np.minimum(ancien_a, retour)).sum() / max(ancien_a.sum(), 1e-6))
        print(f'{voix:8s} {nom:14s} échelle {echelle:.4f} → ×{F:<4} {hd.shape[1]}×{hd.shape[0]} '
              f'ECC {cc:.3f}  recouvrement {recouvrement:.0%}')
        if ecrire:
            Image.fromarray(hd).save(HEADS / f'{voix}.png', optimize=True)
    H = max(v.shape[0] for v in vignettes)
    planche = np.hstack([cv2.copyMakeBorder(v, 0, H - v.shape[0], 4, 4, cv2.BORDER_CONSTANT, value=(255, 255, 255)) for v in vignettes])
    Image.fromarray(planche).save(SORTIE / 'controle.png')
    print(f'Planche de contrôle : {SORTIE / "controle.png"} (ancien en rouge, nouveau en bleu, accord en noir)')
    return 0


if __name__ == '__main__':
    sys.exit(main())

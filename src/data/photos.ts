/**
 * Les photos du concert du 16 juillet 2026, Cour du 10 rue Chenoise.
 *
 * Indexées par clé pour que le YAML de contenu puisse en désigner une sans
 * connaître le chemin du fichier. Ajouter une photo = la déposer dans
 * `src/assets/photos/`, l'importer ici, puis citer sa clé dans le YAML.
 *
 * `cadrage` est la valeur `object-position` du recadrage : les photos de
 * groupe ont les chanteurs dans le bas de l'image, un recadrage centré leur
 * couperait la tête.
 */

import katrTet from '../assets/photos/katr-tet-chenoise-2026.jpg';
import sept from '../assets/photos/4plus4-chenoise-2026.jpg';
import publicChenoise from '../assets/photos/public-chenoise-2026.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
  /** Lieu et date, affichés en légende quand la photo est montrée en grand. */
  credit: string;
  cadrage: string;
  /**
   * Ancrage du recadrage 1200×630 de l'image de partage, au vocabulaire de
   * sharp. Le recadrage automatique (`attention`) a été essayé : sur ces
   * photos il choisit le mur de la cour et coupe les chanteurs.
   */
  cadrageOg: 'top' | 'bottom' | 'center' | 'left' | 'right';
}

export const PHOTOS = {
  'katr-tet-chenoise': {
    src: katrTet,
    alt: "Les quatre chanteurs de Katr Tet, partitions à la main, dans une cour à arcades",
    credit: 'Cour du 10 rue Chenoise, Grenoble, 16 juillet 2026',
    cadrage: 'center 72%',
    cadrageOg: 'bottom',
  },
  '4plus4-chenoise': {
    src: sept,
    alt: 'Les sept chanteurs de 4+4=7 en ligne, partitions à la main, dans une cour à arcades',
    credit: 'Cour du 10 rue Chenoise, Grenoble, 16 juillet 2026',
    cadrage: 'center 78%',
    cadrageOg: 'bottom',
  },
  'public-chenoise': {
    src: publicChenoise,
    alt: "Le public assis dans la cour, en noir et blanc, pendant le concert",
    credit: 'Cour du 10 rue Chenoise, Grenoble, 16 juillet 2026',
    cadrage: 'center 55%',
    cadrageOg: 'center',
  },
} as const satisfies Record<string, Photo>;

export type PhotoId = keyof typeof PHOTOS;
export const PHOTO_IDS = Object.keys(PHOTOS) as [PhotoId, ...PhotoId[]];

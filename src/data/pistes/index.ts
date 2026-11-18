/**
 * Le catalogue des boucles jouables sur le plateau.
 *
 * ⚠ AUDIO ENTIÈREMENT SYNTHÉTIQUE : aucun enregistrement réel.
 * Chaque ligne est rendue hors-ligne en une boucle par le navigateur : deux
 * oscillateurs dents-de-scie désaccordés, filtre passe-bas, vibrato, réverbe
 * à réponse impulsionnelle générée. C'est une maquette sonore, pas le groupe.
 * Le remplacement par de vraies prises est mécanique (cf. BRIEF §8) : sept
 * fichiers audio au lieu des sept lignes, le reste du widget ne bouge pas.
 *
 * L'ordre de ce tableau est l'ordre d'affichage, et la première est celle
 * chargée au premier clic. Ajouter une boucle = un fichier à côté + une ligne
 * ici. Rien d'autre à toucher : cf. README.md du dossier.
 */

import evening from './evening-rise';
import tag from './tag-barbershop';
import suspendu from './tag-suspendu';
import sacre from './cadence-sacree';

export { type Piste, type Step, ligne, definirPiste } from './types';

export const PISTES = [evening, tag, suspendu, sacre];

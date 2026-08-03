/**
 * ⚠ AUDIO ENTIÈREMENT SYNTHÉTIQUE — aucun enregistrement réel.
 *
 * Chaque ligne est rendue hors-ligne en une boucle par le navigateur, à partir
 * de notes écrites à la main : deux oscillateurs dents-de-scie désaccordés,
 * filtre passe-bas, vibrato, réverbe à réponse impulsionnelle générée.
 * C'est une maquette sonore, pas le groupe.
 *
 * Le remplacement par de vraies prises est mécanique (cf. BRIEF §8) : sept
 * fichiers audio au lieu de ces sept lignes, le reste du widget ne bouge pas.
 *
 * Format d'une ligne : [note | null, durée en temps].
 * Total 16 temps = 4 mesures à 4/4.
 */

import type { VoiceId } from './voices';

export type Step = [string | null, number];

export interface Piste {
  id: string;
  nom: string;
  meta: string;
  bpm: number;
  /** Origine et statut de la pièce, pour la mention de droits. */
  origine: string;
  lines: Record<VoiceId, Step[]>;
}

export const PISTES: Piste[] = [
  {
    id: 'evening',
    nom: 'Evening Rise',
    meta: 'trad. · 76 bpm',
    bpm: 76,
    origine:
      'Traditionnel, compositeur inconnu, généralement traité comme domaine public. ' +
      "Reconstruction plausible en la mineur, pas l'arrangement du groupe.",
    lines: {
      basse: [['A2', 2], ['E3', 2], ['D3', 2], ['A2', 2], ['C3', 2], ['G2', 2], ['A2', 3], ['E3', 1]],
      baryton: [['A3', 2], ['C4', 2], ['A3', 2], ['F3', 2], ['G3', 2], ['E3', 2], ['A3', 4]],
      lead: [['E4', 1], ['E4', 1], ['C4', 2], ['D4', 1], ['F4', 1], ['A4', 2], ['G4', 1], ['E4', 1], ['C4', 1], ['D4', 1], ['E4', 2], ['A3', 2]],
      tenor: [['A4', 2], ['E4', 2], ['F4', 2], ['A4', 2], ['G4', 2], ['C5', 2], ['A4', 4]],
      alto: [['C5', 3], ['A4', 1], ['A4', 3], ['F4', 1], ['G4', 3], ['E4', 1], ['A4', 4]],
      mezzo: [['E5', 4], ['D5', 4], ['C5', 4], ['E5', 2], ['C5', 2]],
      soprano: [['A5', 2], ['E5', 2], ['F5', 2], ['D5', 2], ['E5', 2], ['G5', 2], ['A5', 4]],
    },
  },
  {
    id: 'tag',
    nom: 'Tag barbershop',
    meta: 'accord tenu · 60 bpm',
    bpm: 60,
    origine: 'Écrit pour la démonstration.',
    lines: {
      basse: [['F2', 4], ['D3', 4], ['G2', 4], ['C3', 4]],
      baryton: [['A3', 4], ['F#3', 4], ['B3', 4], ['E3', 4]],
      lead: [['C4', 4], ['A3', 4], ['D4', 4], ['G3', 4]],
      tenor: [['F4', 4], ['A4', 4], ['F4', 4], ['Bb4', 4]],
      alto: [['A4', 4], ['F#4', 4], ['B4', 4], ['E4', 4]],
      mezzo: [['C5', 4], ['A4', 4], ['D5', 4], ['G4', 4]],
      soprano: [['F5', 4], ['C5', 4], ['F5', 4], ['E5', 4]],
    },
  },
  {
    id: 'sacre',
    nom: 'Cadence sacrée',
    meta: 'plagal · 54 bpm',
    bpm: 54,
    origine: 'Écrite pour la démonstration.',
    lines: {
      basse: [['F2', 4], ['D3', 4], ['Bb2', 4], ['C3', 4]],
      baryton: [['A3', 4], ['A3', 4], ['F3', 4], ['G3', 4]],
      lead: [['C4', 4], ['D4', 4], ['D4', 4], ['C4', 4]],
      tenor: [['F4', 4], ['F4', 4], ['Bb4', 4], ['G4', 4]],
      alto: [['A4', 4], ['A4', 4], ['F4', 4], ['E4', 4]],
      mezzo: [['C5', 4], ['D5', 4], ['D5', 4], ['C5', 4]],
      soprano: [['F5', 4], ['F5', 4], ['Bb5', 4], ['G5', 4]],
    },
  },
];

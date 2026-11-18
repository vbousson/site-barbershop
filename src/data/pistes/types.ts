/**
 * Le contrat entre les boucles et le moteur audio, et rien d'autre.
 *
 * Ce fichier ne contient aucune note. Il définit la forme d'une boucle, la
 * notation dans laquelle on l'écrit, et les vérifications qui empêchent une
 * boucle bancale d'arriver jusqu'au navigateur. Les notes vivent une par
 * fichier à côté ; cf. le README du dossier pour en écrire une.
 */

import { VOICES, type VoiceId } from '../voices';

/** Un évènement joué : [note, durée en temps]. `null` = silence. */
export type Step = [string | null, number];

/** Ce que le moteur consomme. */
export interface Piste {
  id: string;
  nom: string;
  /** Mention courte affichée à droite du nom, dans la liste des boucles. */
  meta: string;
  bpm: number;
  /** Origine et statut de la pièce, pour la mention de droits. */
  origine: string;
  /** Lequel des quatre nœuds papillon de Mathilde marque cette boucle (0–3). */
  tie: number;
  lines: Record<VoiceId, Step[]>;
}

/** Ce qu'on écrit à la main : les sept lignes en notation compacte. */
export interface PisteSource extends Omit<Piste, 'lines'> {
  lines: Record<VoiceId, string>;
}

/** Sans durée explicite, un token vaut un temps. */
const DUREE_DEFAUT = 1;

/**
 * L'octave suit la convention scientifique : A4 = 440 Hz. La grammaire est
 * volontairement la même que celle du moteur (`hz()` dans plateau.ts), pour
 * qu'une note acceptée ici soit jouable là-bas.
 */
const TOKEN = /^(_|[A-G][b#]?-?\d)(?::(\d+(?:\.\d+)?))?$/;

/**
 * Lit une ligne écrite en notation compacte.
 *
 *   ligne('C4 E4 | G4:2 _ C5:1.5')
 *
 * Les tokens sont séparés par des espaces. `|` sépare les mesures et n'est là
 * que pour l'œil : il ne compte pas. `_` est un silence. `:n` donne la durée
 * en temps, entière ou fractionnaire ; sans elle, le token vaut un temps.
 */
export function ligne(partition: string): Step[] {
  const steps: Step[] = [];
  for (const tok of partition.trim().split(/\s+/)) {
    if (tok === '' || tok === '|') continue;
    const m = TOKEN.exec(tok);
    if (!m) throw new Error(`token illisible : « ${tok} » dans « ${partition} »`);
    const duree = m[2] === undefined ? DUREE_DEFAUT : Number(m[2]);
    if (!(duree > 0)) throw new Error(`durée nulle ou négative : « ${tok} »`);
    steps.push([m[1] === '_' ? null : m[1]!, duree]);
  }
  if (steps.length === 0) throw new Error(`ligne vide : « ${partition} »`);
  return steps;
}

const temps = (l: Step[]): number => l.reduce((s, x) => s + x[1], 0);

/**
 * Convertit une boucle écrite à la main et refuse ce que le moteur ne saurait
 * pas jouer juste.
 *
 * La vérification qui compte est l'égalité des longueurs : les sept boucles
 * sont lancées au même instant et rebouclent chacune sur sa propre durée. Une
 * ligne plus courte que les autres ne provoque aucune erreur audible tout de
 * suite : elle décale progressivement, et le morceau se délite au bout de
 * quelques tours. Autant le voir au build.
 */
export function definirPiste(src: PisteSource): Piste {
  const lines = {} as Record<VoiceId, Step[]>;
  for (const v of VOICES) {
    const brut = src.lines[v.id];
    if (brut === undefined) throw new Error(`${src.id} : la ligne de ${v.id} manque`);
    try {
      lines[v.id] = ligne(brut);
    } catch (e) {
      throw new Error(`${src.id} / ${v.id} : ${(e as Error).message}`);
    }
  }

  const ref = temps(lines[VOICES[0]!.id]);
  for (const v of VOICES) {
    const n = temps(lines[v.id]);
    if (n !== ref) {
      throw new Error(
        `${src.id} : les lignes n'ont pas la même longueur, ` +
          `${v.id} fait ${n} temps, ${VOICES[0]!.id} en fait ${ref}. ` +
          `Les sept boucles doivent tomber ensemble.`,
      );
    }
  }

  if (!(src.bpm > 0)) throw new Error(`${src.id} : bpm invalide (${src.bpm})`);

  return { ...src, lines };
}

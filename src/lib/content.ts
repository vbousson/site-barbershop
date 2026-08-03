/**
 * Accès au contenu : tri, filtrage par formation, et la table des noms de
 * formation utilisée par les étiquettes.
 *
 * Le tri des concerts se fait sur la date ISO, jamais sur l'ordre du fichier :
 * une date ajoutée au mauvais endroit du YAML se range quand même toute seule.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import type { FormationId } from '../data/formations';
import { href } from './url';

export type FormationEntry = CollectionEntry<'formations'>;
export type ConcertEntry = CollectionEntry<'concerts'>;
export type EnregistrementEntry = CollectionEntry<'enregistrements'>;

export async function getFormations(): Promise<FormationEntry[]> {
  const all = await getCollection('formations');
  return all.sort((a, b) => a.data.ordre - b.data.ordre);
}

export async function getRepertoire() {
  const all = await getCollection('repertoire');
  return all.sort((a, b) => a.data.ordre - b.data.ordre);
}

export async function getFrise() {
  const all = await getCollection('frise');
  return all.sort((a, b) => a.data.annee - b.data.annee);
}

export async function getEnregistrements(): Promise<EnregistrementEntry[]> {
  const all = await getCollection('enregistrements');
  return all.sort((a, b) => a.data.ordre - b.data.ordre);
}

/**
 * Les concerts, partagés en « à venir » et « déjà joué ».
 * Une date absente est traitée comme du passé : ce sont les vieilles dates
 * qu'on n'a pas encore retrouvées, pas des projets.
 */
export async function getConcerts(today = new Date()) {
  const all = await getCollection('concerts');
  const jour = today.toISOString().slice(0, 10);

  const avenir = all
    .filter((c) => c.data.date !== null && c.data.date >= jour)
    .sort((a, b) => a.data.date!.localeCompare(b.data.date!));

  const passe = all
    .filter((c) => c.data.date === null || c.data.date < jour)
    .sort((a, b) => (b.data.date ?? '').localeCompare(a.data.date ?? ''));

  return { avenir, passe };
}

/** Nom lisible et lien de chaque formation, pour les étiquettes. */
export async function getFormationIndex(): Promise<Record<FormationId, { nom: string; url: string }>> {
  const all = await getFormations();
  return Object.fromEntries(
    all.map((f) => [f.id, { nom: f.data.nom, url: href(`formations/${f.id}`) }]),
  ) as Record<FormationId, { nom: string; url: string }>;
}

/** Date longue en français, sans dépendance : « 16 juillet 2026 ». */
const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export function dateLongue(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return `${d === 1 ? '1er' : d} ${MOIS[m - 1]} ${y}`;
}

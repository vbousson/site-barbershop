/**
 * Le contenu éditorial du site.
 *
 * Tout ce qui date — les concerts, le répertoire, les enregistrements — vit
 * dans des fichiers YAML éditables sans toucher au code, et validé au build :
 * une faute de frappe sur un nom de formation casse le build au lieu de
 * passer inaperçue en ligne.
 *
 * `brouillon: true` marque une entrée dont le contenu reste à fournir. Elle
 * s'affiche en gris, signalée comme telle. C'est plus honnête qu'un « [titre] »
 * et ça évite d'oublier de la remplir.
 */

import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { FORMATION_IDS } from './data/formations';
import { PHOTO_IDS } from './data/photos';

const formationRef = z.enum(FORMATION_IDS);
const photoRef = z.enum(PHOTO_IDS);

const formations = defineCollection({
  loader: file('src/content/formations.yaml'),
  schema: z.object({
    id: formationRef,
    ordre: z.number(),
    nom: z.string(),
    /** Le seul axe vrai dans les trois cas : le registre. */
    registre: z.string(),
    /**
     * Notation pour les programmateurs musiciens : TTBB, SSAA. Vide quand elle
     * n'a pas de sens : sept parties ne sont pas un SATB.
     */
    notation: z.string().nullable().default(null),
    effectif: z.number(),
    /** Une phrase, sur les onglets et les métadonnées de partage. */
    accroche: z.string(),
    /** Le paragraphe de la carte. Même longueur pour les trois : l'égalité
     *  entre les formations ne se décrète pas, elle s'impose par le gabarit. */
    resume: z.string(),
    /** Deux puces. Deux pour les trois. */
    puces: z.array(z.string()).length(2),
    /** Le développé de la page dédiée. */
    detail: z.array(z.string()),
    /** Clé d'une photo de `src/data/photos.ts`. null = pas encore de photo. */
    photo: photoRef.nullable().default(null),
    /** Texte affiché dans le cadre tant qu'aucune photo n'existe. */
    photoAttendue: z.string(),
  }),
});

const repertoire = defineCollection({
  loader: file('src/content/repertoire.yaml'),
  schema: z.object({
    id: z.string(),
    ordre: z.number(),
    famille: z.string(),
    titres: z.array(
      z.object({
        titre: z.string(),
        formation: formationRef,
        brouillon: z.boolean().default(false),
      }),
    ),
  }),
});

const concerts = defineCollection({
  loader: file('src/content/concerts.yaml'),
  schema: z.object({
    id: z.string(),
    /**
     * `2026-07-16` quand on connaît le jour, `2025-01` quand on ne se souvient
     * que du mois, `null` tant qu'on ne sait rien. Les trois se trient
     * correctement par comparaison de chaînes, et l'affichage s'adapte : on
     * n'invente pas un jour pour faire joli.
     *
     * YAML transforme une date complète non guillemetée en objet Date, d'où la
     * renormalisation. Un `2025-01` reste une chaîne, lui.
     */
    date: z
      .union([z.date(), z.iso.date(), z.string().regex(/^\d{4}-\d{2}$/, 'attendu AAAA-MM')])
      .nullable()
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
    lieu: z.string(),
    /** Ce qui s'est passé, quand on a mieux à dire que le nom du lieu. */
    description: z.string().nullable().default(null),
    formation: formationRef,
    /** id d'une entrée de `enregistrements`, si une captation existe. */
    enregistrement: z.string().nullable().default(null),
    brouillon: z.boolean().default(false),
  }),
});

const enregistrements = defineCollection({
  loader: file('src/content/enregistrements.yaml'),
  schema: z.object({
    id: z.string(),
    ordre: z.number(),
    titre: z.string(),
    lieu: z.string(),
    quand: z.string(),
    formation: formationRef,
    /** mm:ss */
    duree: z.string(),
    /** Fichier ou lien externe. null tant que la captation n'est pas montée. */
    url: z.string().nullable().default(null),
    brouillon: z.boolean().default(false),
  }),
});

const frise = defineCollection({
  loader: file('src/content/frise.yaml'),
  schema: z.object({
    id: z.string(),
    annee: z.number(),
    titre: z.string(),
    texte: z.string(),
    /** Le jalon de naissance du second quatuor : nœud papillon au lieu du point. */
    cle: z.boolean().default(false),
    /** ⚠ millésime reconstruit à partir du récit oral, à confirmer. */
    aConfirmer: z.boolean().default(false),
  }),
});

export const collections = { formations, repertoire, concerts, enregistrements, frise };

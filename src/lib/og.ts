/**
 * Image de partage (Open Graph) : ce que voient les gens quand un lien du
 * site est collé dans un message. C'est souvent la première image du groupe
 * qu'un programmateur verra, avant même d'ouvrir la page.
 *
 * Recadrage 1200×630, le format attendu par les réseaux et les messageries.
 */

import { getImage } from 'astro:assets';
import { PHOTOS, type PhotoId } from '../data/photos';

export async function ogImage(id: PhotoId): Promise<string> {
  const img = await getImage({
    src: PHOTOS[id].src,
    width: 1200,
    height: 630,
    fit: 'cover',
    position: PHOTOS[id].cadrageOg,
    format: 'jpeg',
  });
  return img.src;
}

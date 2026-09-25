import { getPublishedPosts } from '../content/blog-utils';
import { defaultLang, showDefaultLang } from './ui';
import type { Lang } from './ui';

/** Le site est bilingue : « l'autre langue » est sans ambiguïté. */
export function otherLang(lang: Lang): Lang {
  return lang === 'fr' ? 'en' : 'fr';
}

/**
 * Chemin équivalent d'une page dans la langue cible, obtenu en échangeant le
 * préfixe de langue. Valable pour toute page dont le chemin est symétrique
 * entre les deux langues — donc tout sauf les articles, dont les slugs sont
 * eux-mêmes traduits (voir `articleAlternatePath`).
 */
export function alternatePath(pathname: string, target: Lang): string {
  const bare = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return !showDefaultLang && target === defaultLang
    ? bare
    : `/${target}${bare}`;
}

/**
 * Chemin de la traduction d'un article, retrouvée par sa `translationKey`.
 *
 * Renvoie `undefined` si la traduction n'existe pas ou n'est pas publiée :
 * mieux vaut aucun hreflang qu'un hreflang pointant vers un 404. La recherche
 * passe par `getPublishedPosts`, donc une traduction restée en brouillon est
 * invisible en production mais visible en développement, comme le reste.
 */
export async function articleAlternatePath(
  translationKey: string,
  target: Lang,
): Promise<string | undefined> {
  const posts = await getPublishedPosts(target === 'fr' ? 'blogFr' : 'blogEn');
  const match = posts.find(
    (post) => post.data.translationKey === translationKey,
  );
  if (!match) return undefined;
  return target === 'fr' ? `/blog/${match.id}/` : `/en/blog/${match.id}/`;
}

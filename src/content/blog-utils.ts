import { getCollection } from 'astro:content';
import {
  validerArticles,
  formaterErreurs,
  type ArticleÀValider,
} from './article-validation';

type Collection = 'blogFr' | 'blogEn';

const showDrafts =
  import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === 'true';

// getPublishedPosts est appelée huit fois par build. Sans mémoïsation, la
// validation tournerait huit fois et afficherait huit fois les mêmes erreurs.
const dejaValide = new Set<Collection>();

export async function getPublishedPosts(collection: Collection) {
  const posts = await getCollection(collection);

  // Le filtrage précède la validation, indépendamment de showDrafts : un
  // brouillon en chantier contient légitimement de la syntaxe Obsidian et ne
  // doit casser ni le build ni le serveur de développement.
  const publies = posts.filter((post) => !post.data.draft);

  if (!dejaValide.has(collection)) {
    const erreurs = validerArticles(
      publies.map((post): ArticleÀValider => ({
        filePath: post.filePath ?? `${collection}/${post.id}.md`,
        id: post.id,
        translationKey: post.data.translationKey,
        body: post.body ?? '',
      })),
    );
    if (erreurs.length > 0) {
      throw new Error(formaterErreurs(erreurs));
    }
    dejaValide.add(collection);
  }

  return showDrafts ? posts : publies;
}

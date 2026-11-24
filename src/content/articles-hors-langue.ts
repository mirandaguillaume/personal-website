import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Sous-dossiers de `src/content/blog/` lus par une collection. */
const LANGUES = ['fr', 'en'];

/**
 * Chemins des articles `.md` rangés sous `racine` ailleurs que dans `fr/` ou
 * `en/`. Aucune collection ne les charge : sans ce contrôle, un article
 * déposé avec une `lang` mal écrite passerait le build sans être publié.
 */
export function findArticlesHorsLangue(racine: string): string[] {
  return readdirSync(racine, { recursive: true, withFileTypes: true })
    .filter((entree) => entree.isFile() && entree.name.endsWith('.md'))
    .map((entree) => relative(racine, join(entree.parentPath, entree.name)))
    .filter((chemin) => !LANGUES.includes(chemin.split(/[/\\]/)[0]))
    .map((chemin) => join(racine, chemin))
    .sort();
}

export interface ArticleÀValider {
  /** Chemin du fichier, affiché dans le message d'erreur. */
  filePath: string;
  /** Segment d'URL, dérivé du nom de fichier. */
  id: string;
  translationKey: string;
  /** Corps Markdown, frontmatter déjà retiré. */
  body: string;
}

/**
 * Retire les blocs de code clôturés et le code en ligne.
 *
 * Indispensable avant toute détection de résidu : les articles contiennent des
 * blocs bash, où `[[ -f fichier ]]` est la syntaxe de test standard. Sans ce
 * retrait, un article sur le shell serait rejeté pour un wikilink inexistant.
 *
 * Un bloc jamais refermé n'est pas retiré : le reste du fichier continue d'être
 * inspecté plutôt que d'être avalé silencieusement.
 */
export function retirerCode(body: string): string {
  return body.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

export function validerArticles(articles: ArticleÀValider[]): string[] {
  const erreurs: string[] = [];

  for (const article of articles) {
    const texte = retirerCode(article.body);

    // L'embed est testé avant le wikilink, et le wikilink exclut le « ! » qui
    // le précède, pour que le message désigne la bonne syntaxe.
    if (texte.includes('![[')) {
      erreurs.push(`${article.filePath} : embed Obsidian (![[) dans le corps`);
    }
    if (/(^|[^!])\[\[/.test(texte)) {
      erreurs.push(
        `${article.filePath} : wikilink Obsidian ([[) dans le corps`,
      );
    }
    if (texte.includes('%%')) {
      erreurs.push(
        `${article.filePath} : commentaire Obsidian (%%) dans le corps`,
      );
    }
    if (texte.includes('> [!')) {
      erreurs.push(
        `${article.filePath} : callout Obsidian (> [!) dans le corps`,
      );
    }
  }

  return erreurs;
}

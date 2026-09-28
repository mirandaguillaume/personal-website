/**
 * Kebab ASCII minuscule : segments alphanumériques séparés par un tiret.
 * Exporté pour que `content.config.ts` applique la même règle aux tags et à
 * translationKey — une seule définition, qui ne peut pas diverger.
 */
export const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
    if (!KEBAB.test(article.id)) {
      erreurs.push(
        `${article.filePath} : id « ${article.id} » n'est pas en kebab ASCII minuscule`,
      );
    }

    // Le H1 se juge sur le corps BRUT : retirer les blocs de code ferait
    // remonter une ligne située plus bas en « première ligne ».
    const premiereLigne =
      article.body.split('\n').find((ligne) => ligne.trim() !== '') ?? '';
    if (/^#\s/.test(premiereLigne)) {
      erreurs.push(`${article.filePath} : titre de niveau 1 en tête du corps`);
    }

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

  // Unicité au sein de la langue : la liste reçue ne contient qu'une langue.
  const premierDetenteur = new Map<string, string>();
  for (const article of articles) {
    const deja = premierDetenteur.get(article.translationKey);
    if (deja === undefined) {
      premierDetenteur.set(article.translationKey, article.id);
    } else {
      erreurs.push(
        `${article.filePath} : translationKey « ${article.translationKey} » déjà utilisée par ${deja}`,
      );
    }
  }

  return erreurs;
}

/**
 * Rassemble toutes les erreurs dans un seul message : un auteur qui corrige
 * depuis son téléphone doit les voir d'un coup. Le décompte porte sur les
 * erreurs, pas sur les fichiers — un même fichier peut en cumuler plusieurs.
 */
export function formaterErreurs(erreurs: string[]): string {
  const entete = `Validation des articles : ${erreurs.length} erreur${
    erreurs.length > 1 ? 's' : ''
  }`;
  return [entete, ...erreurs.map((erreur) => `  ${erreur}`)].join('\n');
}

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

export interface AnalyseCorps {
  /** Le corps privé de ses blocs de code clôturés et de son code en ligne. */
  prose: string;
  /** Ligne (1-indexée) ouvrant un bloc jamais refermé, sinon null. */
  ligneOuvertureNonFermee: number | null;
}

/** Ouverture de bloc : 3+ accents graves ou tildes, en début de ligne. */
const OUVERTURE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/**
 * Suit l'état des blocs de code ligne par ligne, comme le fait Markdown.
 *
 * Indispensable avant toute détection de résidu : les articles contiennent des
 * blocs bash, où `[[ -f fichier ]]` est la syntaxe de test standard. Sans ce
 * retrait, un article sur le shell serait rejeté pour un wikilink inexistant.
 *
 * Le balayage est à état, et non un appariement de délimiteurs par position :
 * une clôture n'existe qu'en début de ligne. Un appariement positionnel
 * laisserait une mention du délimiteur en prose s'apparier avec l'ouverture du
 * bloc suivant, et la prose entre les deux — résidus compris — disparaîtrait
 * silencieusement.
 */
export function analyserCorps(body: string): AnalyseCorps {
  const prose: string[] = [];
  let delimiteur: string | null = null;
  let ligneOuverture = 0;

  body.split('\n').forEach((ligne, index) => {
    if (delimiteur === null) {
      const ouverture = OUVERTURE.exec(ligne);
      // Une chaîne d'information ne peut pas contenir d'accent grave : sans
      // cette règle, « ``` » suivi de texte sur la même ligne ouvrirait un bloc.
      if (
        ouverture &&
        !(ouverture[1][0] === '`' && ouverture[2].includes('`'))
      ) {
        delimiteur = ouverture[1];
        ligneOuverture = index + 1;
        return;
      }
      prose.push(ligne);
      return;
    }
    // La clôture reprend le même caractère, au moins aussi longue, seule sur sa
    // ligne. Tout le reste appartient au bloc.
    const fermeture = new RegExp(
      `^ {0,3}\\${delimiteur[0]}{${delimiteur.length},}\\s*$`,
    );
    if (fermeture.test(ligne)) {
      delimiteur = null;
    }
  });

  return {
    prose: prose.join('\n').replace(/`[^`\n]*`/g, ''),
    ligneOuvertureNonFermee: delimiteur === null ? null : ligneOuverture,
  };
}

/** Le corps privé de son code. Raccourci sur `analyserCorps`. */
export function retirerCode(body: string): string {
  return analyserCorps(body).prose;
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

    const { prose: texte, ligneOuvertureNonFermee } = analyserCorps(
      article.body,
    );
    if (ligneOuvertureNonFermee !== null) {
      erreurs.push(
        `${article.filePath} : bloc de code jamais refermé, ouvert ligne ${ligneOuvertureNonFermee} du corps`,
      );
    }

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

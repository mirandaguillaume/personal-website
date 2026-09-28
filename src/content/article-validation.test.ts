import { describe, it, expect } from 'vitest';
import {
  retirerCode,
  analyserCorps,
  validerArticles,
  formaterErreurs,
  type ArticleÀValider,
} from './article-validation';

/** Triple accent grave, construit pour ne pas casser les fences du plan. */
const F = '`'.repeat(3);

function article(partiel: Partial<ArticleÀValider> = {}): ArticleÀValider {
  return {
    filePath: 'src/content/blog/fr/exemple.md',
    id: 'exemple',
    translationKey: 'exemple',
    body: 'Un corps banal.',
    ...partiel,
  };
}

describe('retirerCode', () => {
  it('retire les blocs de code clôturés', () => {
    const texte = `avant\n${F}bash\n[[ -f x ]]\n${F}\naprès`;
    expect(retirerCode(texte)).not.toContain('[[');
    expect(retirerCode(texte)).toContain('avant');
    expect(retirerCode(texte)).toContain('après');
  });

  it('retire le code en ligne', () => {
    expect(retirerCode('utilisez `[[ -f x ]]` ici')).not.toContain('[[');
  });

  it('signale un bloc jamais refermé et en traite la suite comme du code', () => {
    const texte = `avant\n${F}bash\npas de fermeture\nsuite du fichier`;
    const analyse = analyserCorps(texte);
    expect(analyse.ligneOuvertureNonFermee).toBe(2);
    expect(analyse.prose).toContain('avant');
    expect(analyse.prose).not.toContain('suite du fichier');
  });

  it('ne prend pas une mention du délimiteur en prose pour une ouverture', () => {
    expect(
      analyserCorps(`Le délimiteur est ${F} .`).ligneOuvertureNonFermee,
    ).toBe(null);
  });

  it('ne ferme pas un bloc de quatre accents graves avec trois', () => {
    const texte = [`${F}\``, F, 'encore du code', `${F}\``].join('\n');
    expect(analyserCorps(texte).ligneOuvertureNonFermee).toBe(null);
    expect(analyserCorps(texte).prose).toBe('');
  });
});

describe('validerArticles — résidus Obsidian', () => {
  it('accepte un article propre', () => {
    expect(validerArticles([article()])).toEqual([]);
  });

  it('refuse un wikilink', () => {
    const erreurs = validerArticles([article({ body: 'voir [[autre note]]' })]);
    expect(erreurs).toHaveLength(1);
    expect(erreurs[0]).toContain('src/content/blog/fr/exemple.md');
    expect(erreurs[0]).toContain('wikilink');
  });

  it('refuse un embed et le distingue du wikilink', () => {
    const erreurs = validerArticles([article({ body: 'voir ![[une note]]' })]);
    expect(erreurs.some((e) => e.includes('embed'))).toBe(true);
    expect(erreurs.some((e) => e.includes('wikilink'))).toBe(false);
  });

  it('refuse un commentaire Obsidian', () => {
    const erreurs = validerArticles([article({ body: 'texte %%note%% fin' })]);
    expect(erreurs[0]).toContain('commentaire');
  });

  it('refuse un callout', () => {
    const erreurs = validerArticles([article({ body: '> [!info] Attention' })]);
    expect(erreurs[0]).toContain('callout');
  });

  it('ignore les résidus situés dans un bloc de code', () => {
    const body = `texte\n${F}bash\nif [[ -f x ]]; then echo %%; fi\n${F}\nfin`;
    expect(validerArticles([article({ body })])).toEqual([]);
  });

  it('ignore les résidus situés dans du code en ligne', () => {
    const body = 'en bash, `[[ -f x ]]` teste un fichier';
    expect(validerArticles([article({ body })])).toEqual([]);
  });
});

describe('validerArticles — identifiant', () => {
  it('accepte un id en kebab ASCII', () => {
    expect(validerArticles([article({ id: 'mon-article-2' })])).toEqual([]);
  });

  it('refuse un id accentué', () => {
    const erreurs = validerArticles([article({ id: 'mon-article-éclair' })]);
    expect(erreurs[0]).toContain('id');
  });

  it('refuse un id en majuscules', () => {
    expect(validerArticles([article({ id: 'MonArticle' })])).toHaveLength(1);
  });
});

describe('validerArticles — unicité de translationKey', () => {
  it('accepte deux clés différentes', () => {
    const erreurs = validerArticles([
      article({ id: 'a', filePath: 'a.md', translationKey: 'un' }),
      article({ id: 'b', filePath: 'b.md', translationKey: 'deux' }),
    ]);
    expect(erreurs).toEqual([]);
  });

  it('signale un doublon en nommant le premier détenteur', () => {
    const erreurs = validerArticles([
      article({ id: 'a', filePath: 'a.md', translationKey: 'partagee' }),
      article({ id: 'b', filePath: 'b.md', translationKey: 'partagee' }),
    ]);
    expect(erreurs).toHaveLength(1);
    expect(erreurs[0]).toContain('b.md');
    expect(erreurs[0]).toContain('a');
  });

  it('produit deux erreurs pour trois articles partageant une clé', () => {
    const erreurs = validerArticles([
      article({ id: 'a', filePath: 'a.md', translationKey: 'partagee' }),
      article({ id: 'b', filePath: 'b.md', translationKey: 'partagee' }),
      article({ id: 'c', filePath: 'c.md', translationKey: 'partagee' }),
    ]);
    expect(erreurs).toHaveLength(2);
    expect(erreurs.every((e) => e.includes('a'))).toBe(true);
  });
});

describe('validerArticles — titre de niveau 1', () => {
  it('refuse un H1 en première ligne', () => {
    const erreurs = validerArticles([article({ body: '# Titre\n\nsuite' })]);
    expect(erreurs[0]).toContain('niveau 1');
  });

  it('accepte un H2 en première ligne', () => {
    expect(validerArticles([article({ body: '## Titre\n\nsuite' })])).toEqual(
      [],
    );
  });

  it('accepte un H1 situé plus bas', () => {
    expect(
      validerArticles([article({ body: 'intro\n\n# Plus bas' })]),
    ).toHaveLength(0);
  });

  it('accepte un article commençant par un bloc de code', () => {
    const body = `${F}bash\n# commentaire shell\n${F}\n\nsuite`;
    expect(validerArticles([article({ body })])).toEqual([]);
  });

  it('ne lève pas sur un corps vide', () => {
    expect(validerArticles([article({ body: '' })])).toEqual([]);
    expect(validerArticles([article({ body: '   \n\n  ' })])).toEqual([]);
  });
});

describe('validerArticles — liste vide', () => {
  it('accepte une liste sans article', () => {
    expect(validerArticles([])).toEqual([]);
  });
});

describe('formaterErreurs', () => {
  it('compte les erreurs, pas les fichiers', () => {
    const message = formaterErreurs(['a.md : une', 'a.md : deux']);
    expect(message).toContain('2 erreurs');
    expect(message).toContain('a.md : une');
    expect(message).toContain('a.md : deux');
  });

  it('accorde le singulier', () => {
    expect(formaterErreurs(['a.md : seule'])).toContain('1 erreur');
  });
});

describe('validerArticles — délimiteurs de bloc non appariés', () => {
  it('voit un wikilink séparé du vrai bloc par une mention du délimiteur en prose', () => {
    const body = [
      `Le délimiteur est ${F} .`,
      '',
      'Voir [[ma autre note]] pour la suite.',
      '',
      `${F}php`,
      'echo 1;',
      F,
    ].join('\n');
    const erreurs = validerArticles([article({ body })]);
    expect(erreurs.some((e) => e.includes('wikilink'))).toBe(true);
  });
});

describe('validerArticles — bloc non refermé', () => {
  it('signale le bloc et nomme la ligne', () => {
    const body = `intro\n${F}bash\necho 1;`;
    const erreurs = validerArticles([article({ body })]);
    expect(erreurs.some((e) => e.includes('jamais refermé'))).toBe(true);
    expect(erreurs.some((e) => e.includes('ligne 2'))).toBe(true);
  });
});

describe('validerArticles — formes de code légitimes', () => {
  it('accepte un bloc indenté de quatre espaces', () => {
    const body = ['texte', '', '    if [[ -f x ]]; then :; fi', '', 'fin'].join(
      '\n',
    );
    expect(validerArticles([article({ body })])).toEqual([]);
  });

  it('accepte un span à double accent grave', () => {
    const body = 'voir ``[[ -f x ]]`` ici';
    expect(validerArticles([article({ body })])).toEqual([]);
  });

  it('accepte un span de code sur deux lignes', () => {
    const body = 'voir `[[ -f x\ny ]]` ici';
    expect(validerArticles([article({ body })])).toEqual([]);
  });
});

describe('validerArticles — ancrages', () => {
  it('accepte un badge dans une citation', () => {
    const body = '> [![Build](i.svg)](ci.example)';
    expect(validerArticles([article({ body })])).toEqual([]);
  });

  it('refuse un callout sans espace après le chevron', () => {
    const erreurs = validerArticles([article({ body: '>[!info] Attention' })]);
    expect(erreurs.some((e) => e.includes('callout'))).toBe(true);
  });

  it('refuse un H1 indenté de trois espaces', () => {
    const erreurs = validerArticles([article({ body: '   # Titre\n\nsuite' })]);
    expect(erreurs.some((e) => e.includes('niveau 1'))).toBe(true);
  });
});

describe('validerArticles — clôture oubliée entre deux blocs', () => {
  it('signale une ouverture de bloc rencontrée à l’intérieur d’un bloc', () => {
    const body = [
      'intro',
      `${F}bash`,
      'oubli de fermeture',
      '',
      'prose avec %%commentaire%% réel',
      '',
      `${F}bash`,
      'if [[ -f x ]]; then :; fi',
      F,
      'fin',
    ].join('\n');
    const erreurs = validerArticles([article({ body })]);
    expect(erreurs.some((e) => e.includes('non refermé'))).toBe(true);
    expect(erreurs.some((e) => e.includes('ligne 2'))).toBe(true);
  });

  it('accepte une fence courte démontrée dans une fence plus longue', () => {
    const body = [`${F}\``, `${F}bash`, 'echo 1;', F, `${F}\``].join('\n');
    expect(validerArticles([article({ body })])).toEqual([]);
  });
});

describe('validerArticles — commentaire Obsidian', () => {
  it('accepte un %% littéral isolé en prose', () => {
    const body = 'un printf affiche %% littéral ici';
    expect(validerArticles([article({ body })])).toEqual([]);
  });

  it('refuse un commentaire Obsidian apparié', () => {
    const erreurs = validerArticles([
      article({ body: 'texte %%note privée%% fin' }),
    ]);
    expect(erreurs.some((e) => e.includes('commentaire'))).toBe(true);
  });
});

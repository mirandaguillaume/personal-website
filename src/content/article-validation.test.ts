import { describe, it, expect } from 'vitest';
import {
  retirerCode,
  validerArticles,
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

  it('laisse le texte intact quand un bloc n’est jamais refermé', () => {
    const texte = `avant\n${F}bash\npas de fermeture\nsuite du fichier`;
    expect(retirerCode(texte)).toContain('suite du fichier');
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

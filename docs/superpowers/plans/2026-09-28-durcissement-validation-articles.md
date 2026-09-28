# Durcissement de la validation des articles — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** faire échouer `astro build` sur tout article publié dont le frontmatter ou le corps est invalide, pour qu'une publication sans relecture depuis Obsidian ne puisse pas atteindre la production.

**Architecture :** deux niveaux. Zod couvre la forme du frontmatter, article par article. Une fonction pure sans dépendance Astro couvre ce que Zod ne voit pas — le corps du fichier et les contraintes entre articles — et `getPublishedPosts()` l'appelle une fois par collection, après filtrage des brouillons.

**Tech Stack :** Astro 7.2.3, Zod 4.4.3 (embarqué par Astro), Vitest 5, Vite 8.2.1, TypeScript 6, Bash pour le test de bout en bout.

**Spec :** `docs/superpowers/specs/2026-09-28-durcissement-validation-articles-design.md`

## Global Constraints

- Node ≥ 22.12.0 (`engines` de `package.json`).
- Messages de commit **en français**, sans trailer `Co-Authored-By`, sans aucune mention d'IA.
- Identité git **locale** au dépôt : `mirandaguillaume <guillaume11miranda@gmail.com>`. Vérifier avec `git config --local user.email` avant le premier commit.
- `npm run lint`, `npm run format:check` et `npm run check` doivent passer après chaque tâche.
- Les deux articles existants passent sans modification, à chaque tâche.
- Zod est importé depuis `astro/zod`, jamais depuis un paquet `zod` installé séparément.
- Commentaires et messages d'erreur en français, comme le reste du dépôt.

## Écarts assumés par rapport à la spec

1. **Le contrôle du H1 porte sur le corps brut, pas sur le corps privé de ses blocs de code.** La spec §4 range les contrôles 3 et 4 ensemble sous le retrait des blocs de code. C'est juste pour les résidus (contrôle 3), faux pour le H1 (contrôle 4) : si un article commence par un bloc de code, le retrait ferait remonter une ligne située plus bas en « première ligne », et un `# Titre` légitime au milieu de l'article serait signalé à tort. Sur le corps brut, un bloc de code ouvrant donne ` ```bash ` comme première ligne non vide — aucun faux positif.
2. **Le fichier de test de bout en bout n'est pas nommé avec un préfixe `_`.** Les fichiers préfixés par `_` sont exclus du routage Astro ; pour éviter toute ambiguïté avec le chargeur de collections, l'article temporaire s'appelle `zz-article-invalide-temporaire.md`.

## Review Focus

- **`[[` dans du code en ligne** (entre simples accents graves) et non dans un bloc clôturé : le retrait doit couvrir les deux formes, sinon `` `[[ -f x ]]` `` en prose déclenche un faux positif. → testé en Task 2.
- **Liste d'articles vide** (toutes les publications en brouillon) : `validerArticles([])` doit renvoyer `[]` sans lever. → testé en Task 3.
- **Corps vide ou fait uniquement d'espaces** : la recherche de la première ligne non vide ne doit pas lever sur `undefined`. → testé en Task 3.
- **Bloc de code non refermé** : le retrait ne doit pas avaler le reste du fichier et masquer des erreurs réelles. → testé en Task 2.
- **Même `translationKey` sur trois articles** : deux erreurs attendues, chacune désignant le premier détenteur — pas une erreur par paire. → testé en Task 3.

---

### Task 1 : Mettre Vitest en place

**Files :**

- Create : `vitest.config.ts`
- Create : `src/content/article-validation.test.ts`
- Modify : `package.json` (devDependency `vitest`, script `test`)

**Interfaces :**

- Consumes : rien.
- Produces : la commande `npm run test`, utilisée par toutes les tâches suivantes. Les tests vivent à côté du code, sous `src/**/*.test.ts`.

- [ ] **Step 1 : installer Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2 : écrire la configuration**

`vitest.config.ts` :

```typescript
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig réutilise la chaîne Vite d'Astro : TypeScript, ESM et alias
// fonctionnent sans configuration supplémentaire.
export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3 : ajouter le script npm**

Dans `package.json`, section `scripts`, après `"astro": "astro"` :

```json
    "test": "vitest run",
```

- [ ] **Step 4 : écrire un test témoin**

`src/content/article-validation.test.ts` :

```typescript
import { describe, it, expect } from 'vitest';

describe('mise en place', () => {
  it('exécute les tests', () => {
    expect(true).toBe(true);
  });
});
```

Les fonctions de test sont importées explicitement : pas de `globals: true`, donc rien à déclarer pour ESLint ni pour TypeScript.

- [ ] **Step 5 : lancer les tests**

Run : `npm run test`
Expected : 1 fichier, 1 test, PASS.

- [ ] **Step 6 : vérifier que rien d'autre ne casse**

Run : `npm run lint && npm run format:check && npm run check && npm run build`
Expected : tout passe, build à 22 pages.

Si `format:check` échoue, lancer `npm run format` puis reprendre.

- [ ] **Step 7 : commit**

```bash
git add package.json package-lock.json vitest.config.ts src/content/article-validation.test.ts
git commit -m "Mise en place de Vitest"
```

---

### Task 2 : Retrait du code et détection des résidus Obsidian

**Files :**

- Create : `src/content/article-validation.ts`
- Modify : `src/content/article-validation.test.ts`

**Interfaces :**

- Consumes : `npm run test` (Task 1).
- Produces :
  - `export interface ArticleÀValider { filePath: string; id: string; translationKey: string; body: string }`
  - `export function retirerCode(body: string): string`
  - `export function validerArticles(articles: ArticleÀValider[]): string[]` — à ce stade, ne contrôle que les résidus Obsidian. Task 3 y ajoute les autres contrôles.

- [ ] **Step 1 : écrire les tests qui échouent**

Remplacer entièrement `src/content/article-validation.test.ts` :

```typescript
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
```

- [ ] **Step 2 : lancer les tests pour vérifier qu'ils échouent**

Run : `npm run test`
Expected : échec à la résolution du module — `Failed to resolve import "./article-validation"`.

- [ ] **Step 3 : écrire le module**

`src/content/article-validation.ts` :

````typescript
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
 * blocs `bash`, où `[[ -f fichier ]]` est la syntaxe de test standard. Sans ce
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
````

- [ ] **Step 4 : lancer les tests**

Run : `npm run test`
Expected : 10 tests, tous PASS.

- [ ] **Step 5 : vérifier le reste**

Run : `npm run lint && npm run format:check && npm run check`
Expected : tout passe.

- [ ] **Step 6 : commit**

```bash
git add src/content/article-validation.ts src/content/article-validation.test.ts
git commit -m "Détection des résidus Obsidian, hors blocs de code"
```

---

### Task 3 : Identifiant, unicité de translationKey, H1 et format des erreurs

**Files :**

- Modify : `src/content/article-validation.ts`
- Modify : `src/content/article-validation.test.ts`

**Interfaces :**

- Consumes : `validerArticles`, `ArticleÀValider` (Task 2).
- Produces : `export function formaterErreurs(erreurs: string[]): string`, utilisée par Task 5. `validerArticles` couvre désormais les quatre contrôles de la spec §4.

- [ ] **Step 1 : écrire les tests qui échouent**

Ajouter à la fin de `src/content/article-validation.test.ts` (l'import en tête devient `import { retirerCode, validerArticles, formaterErreurs, type ArticleÀValider } from './article-validation';`) :

```typescript
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
```

- [ ] **Step 2 : lancer les tests pour vérifier qu'ils échouent**

Run : `npm run test`
Expected : échec de l'import de `formaterErreurs`, et échecs des contrôles non encore écrits.

- [ ] **Step 3 : compléter le module**

Dans `src/content/article-validation.ts`, ajouter en tête après les imports :

```typescript
/** Kebab ASCII minuscule : segments alphanumériques séparés par un tiret. */
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
```

Dans la boucle de `validerArticles`, avant les contrôles de résidus :

```typescript
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
```

Après la boucle, avant le `return` :

```typescript
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
```

Et en fin de fichier :

```typescript
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
```

- [ ] **Step 4 : lancer les tests**

Run : `npm run test`
Expected : 24 tests, tous PASS.

- [ ] **Step 5 : vérifier le reste**

Run : `npm run lint && npm run format:check && npm run check`
Expected : tout passe.

- [ ] **Step 6 : commit**

```bash
git add src/content/article-validation.ts src/content/article-validation.test.ts
git commit -m "Contrôles d'identifiant, d'unicité et de titre, et format des erreurs"
```

---

### Task 4 : Durcir le schéma Zod

**Files :**

- Modify : `src/content.config.ts`

**Interfaces :**

- Consumes : rien.
- Produces : `blogSchema` refuse un `title` ou une `description` vides, une `pubDate` antérieure au 2000-01-01, et tout `tag` ou `translationKey` hors kebab minuscule.

- [ ] **Step 1 : modifier le schéma**

Dans `src/content.config.ts`, ajouter après les imports :

```typescript
/** Kebab ASCII minuscule. Exclut d'un seul motif majuscules, espaces, / et #. */
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Un `pubDate:` vide vaut null en YAML, que z.coerce.date() rend 1970. */
const DATE_MINIMALE = new Date('2000-01-01');
```

Remplacer `blogSchema` par :

```typescript
const blogSchema = z.object({
  title: z.string().min(1, 'title ne doit pas être vide'),
  description: z.string().min(1, 'description ne doit pas être vide'),
  pubDate: z.coerce.date().min(DATE_MINIMALE, {
    message:
      'pubDate doit être postérieure au 2000-01-01 (un champ vide vaut 1970)',
  }),
  tags: z.array(
    z
      .string()
      .regex(KEBAB, 'chaque tag doit être en kebab minuscule, sans / ni #'),
  ),
  // Relie un article à sa traduction. Obligatoire : un article sans clé
  // casse le build plutôt que de perdre son hreflang en silence.
  translationKey: z
    .string()
    .regex(KEBAB, 'translationKey doit être en kebab minuscule'),
  draft: z.boolean().optional().default(false),
});
```

- [ ] **Step 2 : vérifier que `.min()` s'enchaîne bien après `z.coerce.date()`**

Run : `npm run check`
Expected : 0 erreur. Si TypeScript refuse l'enchaînement, remplacer par un `superRefine` :

```typescript
  pubDate: z.coerce.date().superRefine((valeur, ctx) => {
    if (valeur < DATE_MINIMALE) {
      ctx.addIssue({
        code: 'custom',
        message:
          'pubDate doit être postérieure au 2000-01-01 (un champ vide vaut 1970)',
      });
    }
  }),
```

- [ ] **Step 3 : vérifier que les articles existants passent**

Run : `npm run build`
Expected : 22 pages, aucune erreur.

- [ ] **Step 4 : vérifier qu'un frontmatter fautif est refusé**

```bash
sed -i "s/^tags: \['testing', 'php', 'mutation-testing'\]$/tags: ['Testing']/" \
  src/content/blog/fr/mutation-testing-vos-tests-testent-ils-vraiment-quelque-chose.md
npm run build; echo "code de sortie : $?"
```

Expected : échec, message mentionnant `tags` et le kebab, code de sortie non nul.

Rétablir :

```bash
git checkout -- src/content/blog/fr/mutation-testing-vos-tests-testent-ils-vraiment-quelque-chose.md
npm run build
```

Expected : 22 pages.

- [ ] **Step 5 : vérifier le reste**

Run : `npm run lint && npm run format:check && npm run test`
Expected : tout passe.

- [ ] **Step 6 : commit**

```bash
git add src/content.config.ts
git commit -m "Contraintes de forme sur le frontmatter des articles"
```

---

### Task 5 : Raccorder la validation à getPublishedPosts

**Files :**

- Modify : `src/content/blog-utils.ts`

**Interfaces :**

- Consumes : `validerArticles`, `formaterErreurs`, `ArticleÀValider` (Tasks 2 et 3).
- Produces : `getPublishedPosts()` lève une `Error` dont le message est celui de `formaterErreurs` dès qu'un article publié est invalide. Signature inchangée pour les 8 pages appelantes.

- [ ] **Step 1 : réécrire le module**

`src/content/blog-utils.ts` :

```typescript
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
```

- [ ] **Step 2 : vérifier que le build passe toujours**

Run : `npm run check && npm run build`
Expected : 0 erreur, 22 pages.

- [ ] **Step 3 : vérifier qu'un brouillon fautif ne casse rien**

```bash
cat > src/content/blog/fr/zz-brouillon-temporaire.md <<'MD'
---
title: 'Brouillon en chantier'
description: 'Contient de la syntaxe Obsidian, volontairement.'
pubDate: 2026-01-01
tags: ['testing']
translationKey: 'brouillon-temporaire'
draft: true
---

Une note à moi-même %%pense-bête%% et un [[lien vers une autre note]].
MD
npm run build; echo "code de sortie : $?"
rm -f src/content/blog/fr/zz-brouillon-temporaire.md
```

Expected : build réussi, 22 pages, code de sortie 0. C'est le critère 5 de la spec.

- [ ] **Step 4 : vérifier le reste**

Run : `npm run lint && npm run format:check && npm run test`
Expected : tout passe.

- [ ] **Step 5 : commit**

```bash
git add src/content/blog-utils.ts
git commit -m "Validation des articles publiés au chargement des collections"
```

---

### Task 6 : Test de bout en bout

**Files :**

- Create : `scripts/verifier-build-refuse-article-invalide.sh`
- Modify : `package.json` (script `test:e2e`)

**Interfaces :**

- Consumes : le raccordement de la Task 5.
- Produces : `npm run test:e2e`, qui protège le raccordement lui-même — ce que les tests unitaires, portant sur une fonction pure, ne touchent pas.

- [ ] **Step 1 : écrire le script**

`scripts/verifier-build-refuse-article-invalide.sh` :

```bash
#!/usr/bin/env bash
# Vérifie qu'un article publié invalide fait échouer le build, et que le
# message nomme le fichier fautif. Les tests unitaires portent sur une fonction
# pure : seul ce test couvre le raccordement à getPublishedPosts.
set -uo pipefail

cd "$(dirname "$0")/.."
ARTICLE="src/content/blog/fr/zz-article-invalide-temporaire.md"
JOURNAL="$(mktemp)"
nettoyer() { rm -f "$ARTICLE" "$JOURNAL"; }
trap nettoyer EXIT

cat > "$ARTICLE" <<'MD'
---
title: 'Article volontairement invalide'
description: 'Doit faire échouer le build.'
pubDate: 2026-01-01
tags: ['testing']
translationKey: 'article-invalide-temporaire'
---

Un [[wikilink Obsidian]] ne doit jamais atteindre la production.
MD

if npm run build > "$JOURNAL" 2>&1; then
  echo "FAIL - le build a réussi alors qu'un article publié est invalide"
  exit 1
fi

if ! grep -q "zz-article-invalide-temporaire" "$JOURNAL"; then
  echo "FAIL - le build a échoué mais son message ne nomme pas le fichier fautif"
  sed -n '1,40p' "$JOURNAL"
  exit 1
fi

echo "ok   - le build refuse un article invalide et nomme le fichier"
```

Rendre exécutable : `chmod +x scripts/verifier-build-refuse-article-invalide.sh`

- [ ] **Step 2 : lancer le script**

Run : `./scripts/verifier-build-refuse-article-invalide.sh`
Expected : `ok   - le build refuse un article invalide et nomme le fichier`, code de sortie 0.

- [ ] **Step 3 : vérifier que le script nettoie derrière lui**

Run : `git status --porcelain --untracked-files=all | grep zz-article || echo "aucun résidu"`
Expected : `aucun résidu`.

- [ ] **Step 4 : ajouter le script npm**

Dans `package.json`, après `"test": "vitest run",` :

```json
    "test:e2e": "./scripts/verifier-build-refuse-article-invalide.sh",
```

- [ ] **Step 5 : lancer par npm**

Run : `npm run test:e2e`
Expected : même sortie, code 0.

- [ ] **Step 6 : vérifier que le build normal repasse**

Run : `npm run build`
Expected : 22 pages.

- [ ] **Step 7 : commit**

```bash
git add scripts/verifier-build-refuse-article-invalide.sh package.json
git commit -m "Test de bout en bout du refus d'un article invalide"
```

---

### Task 7 : Images adaptatives et documentation

**Files :**

- Modify : `src/styles/global.css`
- Modify : `README.md`

**Interfaces :**

- Consumes : rien.
- Produces : la règle CSS de la spec §7 et la documentation des nouvelles contraintes.

- [ ] **Step 1 : ajouter la règle CSS**

Dans `src/styles/global.css`, après le bloc `* { box-sizing: border-box; }` :

```css
/* Les images arriveront d'Obsidian à leur taille d'origine. */
img {
  max-width: 100%;
  height: auto;
}
```

- [ ] **Step 2 : vérifier le rendu**

Run : `npm run build && grep -c "max-width:100%" dist/_astro/*.css`
Expected : au moins 1.

- [ ] **Step 3 : documenter les contraintes dans le README**

Dans `README.md`, à la fin de la section `### translationKey`, ajouter :

```markdown
### Contraintes vérifiées au build

Le build refuse un article publié qui enfreint l'une de ces règles, et nomme le
fichier fautif :

| Règle                                           | Portée                    |
| ----------------------------------------------- | ------------------------- |
| `title` et `description` non vides              | frontmatter               |
| `pubDate` postérieure au 2000-01-01             | frontmatter               |
| `tags` et `translationKey` en kebab minuscule   | frontmatter               |
| `translationKey` unique au sein d'une langue    | entre articles            |
| Nom de fichier en kebab ASCII minuscule         | fichier                   |
| Aucun `[[`, `![[`, `%%` ni `> [!` dans le corps | corps, hors blocs de code |
| Pas de titre de niveau 1 en tête du corps       | corps                     |

Les brouillons (`draft: true`) échappent à ces contrôles : une note en cours de
rédaction contient légitimement de la syntaxe Obsidian.

Lancer les contrôles : `npm run test` (unitaires) et `npm run test:e2e`
(le build refuse-t-il bien un article invalide).
```

- [ ] **Step 4 : vérifier**

Run : `npm run format:check && npm run lint && npm run test && npm run build`
Expected : tout passe.

Si `format:check` échoue sur le README, lancer `npm run format` puis reprendre.

- [ ] **Step 5 : commit**

```bash
git add src/styles/global.css README.md
git commit -m "Images adaptatives et documentation des contraintes de validation"
```

---

### Task 8 : Protection de la branche main

**Files :** aucun fichier du dépôt.

**Interfaces :**

- Consumes : tout ce qui précède.
- Produces : le critère 4 de la spec — une PR au check rouge ne peut pas être fusionnée.

Cette tâche modifie les réglages GitHub du dépôt. **Demander confirmation à l'utilisateur avant de lancer le step 3.**

- [ ] **Step 1 : relever le nom exact du check Vercel**

Run :

```bash
gh pr checks 25 2>&1 | head -5
```

Expected : une ou plusieurs lignes nommant les checks. Noter le nom exact du check Vercel — il sert au step 3.

Si la PR 25 n'a plus ses checks, utiliser la PR ouverte de ce chantier.

- [ ] **Step 2 : vérifier l'état actuel**

Run : `gh api repos/mirandaguillaume/personal-website/branches/main/protection 2>&1 | head -3`
Expected : `Branch not protected`.

- [ ] **Step 3 : activer la protection**

Remplacer `<NOM_DU_CHECK>` par le nom relevé au step 1 :

```bash
gh api -X PUT repos/mirandaguillaume/personal-website/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f 'required_status_checks[strict]=true' \
  -f 'required_status_checks[contexts][]=<NOM_DU_CHECK>' \
  -f 'enforce_admins=false' \
  -f 'required_pull_request_reviews=null' \
  -f 'restrictions=null'
```

`enforce_admins=false` laisse à l'utilisateur la possibilité de forcer une fusion s'il le décide : il est seul sur ce dépôt, une protection qui l'enfermerait dehors serait un piège.

- [ ] **Step 4 : vérifier**

Run :

```bash
gh api repos/mirandaguillaume/personal-website/branches/main/protection \
  --jq '{checks: .required_status_checks.contexts, strict: .required_status_checks.strict}'
```

Expected : le nom du check et `"strict": true`.

- [ ] **Step 5 : vérifier la recette complète**

Run : `npm run test && npm run test:e2e && npm run check && npm run lint && npm run format:check && npm run build`
Expected : tout passe, 22 pages.

(Aucun commit : seuls les réglages GitHub changent.)

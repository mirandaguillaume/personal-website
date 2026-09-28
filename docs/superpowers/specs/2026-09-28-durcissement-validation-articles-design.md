# Durcissement de la validation des articles — design

> Périmètre : le dépôt du blog uniquement. Ce document détaille la §5.5 du design
> du vault (`~/Notes/_meta/specs/2026-09-23-vault-et-publication-design.md`),
> qui en fixe les exigences fonctionnelles.

## 1. Contexte et objectif

Les articles seront bientôt rédigés dans Obsidian, souvent depuis un téléphone, et
publiés par le plugin Enveloppe, qui ouvre une pull request automatiquement.
**L'auteur ne relit jamais le fichier produit.** Une syntaxe propre à Obsidian
(`[[lien]]`, `%%note%%`, callout) ou une métadonnée malformée arriverait donc en
production sans que rien ne l'arrête.

Le build devient le garde-barrière : un article invalide fait échouer
`astro build`, donc le check de la PR, donc la fusion.

Ce document ne traite que le dépôt du blog. La configuration d'Enveloppe, le
vault et la synchro relèvent du design du vault.

## 2. Décisions

| Décision                          | Retenu                    | Pourquoi                                                                                                        |
| --------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Point d'accroche                  | `getPublishedPosts()`     | Point de passage unique de toutes les pages du blog (8 appels). Imposé par la §5.5.                             |
| Brouillons                        | **non validés**           | Un brouillon en chantier contient légitimement de la syntaxe Obsidian. Le contrôle ne mord qu'à la publication. |
| Mode développement                | **échoue comme au build** | Un seul comportement, donc aucune surprise au moment de la PR et rien à tester en double.                       |
| Framework de test                 | **Vitest**                | Le projet est sous Vite ; Vitest réutilise sa chaîne et gère TypeScript sans configuration supplémentaire.      |
| Forme de la validation d'ensemble | **fonction pure**         | Testable sans Astro : les tests fabriquent des objets littéraux.                                                |

### Alternatives écartées

- **Tout mettre dans Zod** (`superRefine`) : impossible. Zod valide article par
  article, or l'unicité de `translationKey` est une contrainte _entre_ articles.
  Zod ne voit pas non plus le corps du fichier.
- **Une intégration Astro** (`astro:build:done`) : ne s'exécute pas en
  `astro dev`, que la décision ci-dessus impose de couvrir.

## 3. Niveau 1 — schéma Zod (`src/content.config.ts`)

Contraintes ajoutées à `blogSchema` :

| Champ            | Contrainte                                           | Ce que ça attrape                                                                                       |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `title`          | non vide                                             | Le template initialise `title: ""`. Un envoi sans le remplir produirait un article au titre vide.       |
| `description`    | non vide                                             | Idem, et la valeur alimente la balise `meta description`.                                               |
| `pubDate`        | date ≥ `2000-01-01`                                  | Un `pubDate:` laissé vide vaut `null` en YAML, que `z.coerce.date()` convertit en 1970 **sans erreur**. |
| `tags`           | chaque tag correspond à `^[a-z0-9]+(?:-[a-z0-9]+)*$` | Majuscules, espaces, `/` et `#` d'un seul motif. Les tags deviennent des segments d'URL.                |
| `translationKey` | même motif                                           | Idem : la clé est comparée entre langues, toute variation de casse casserait l'appariement.             |

`title` et `description` non vides dépassent la lettre de la §5.5. Ils y sont
ajoutés parce que le template du vault les initialise à chaîne vide : c'est
précisément le scénario de publication sans relecture que ce chantier vise.

## 4. Niveau 2 — validation d'ensemble (`src/content/article-validation.ts`)

Fichier nouveau. Aucun import d'Astro.

```ts
export interface ArticleÀValider {
  filePath: string; // nomme le fichier fautif dans le message
  id: string; // segment d'URL, dérivé du nom de fichier
  translationKey: string;
  body: string; // corps Markdown, frontmatter déjà retiré
}

export function validerArticles(articles: ArticleÀValider[]): string[];
```

La fonction reçoit les articles **d'une seule langue** et renvoie la liste des
erreurs. Liste vide : tout va bien.

### Contrôles

1. **`id` en kebab ASCII** — `^[a-z0-9]+(?:-[a-z0-9]+)*$`. L'`id` devient l'URL
   de l'article ; un accent ou une majuscule y produirait une adresse fragile.
2. **`translationKey` unique au sein de la langue** — deux articles français
   partageant une clé rendraient l'appariement avec l'anglais ambigu, et le
   `hreflang` choisirait arbitrairement.
3. **Résidus Obsidian dans le corps** — `![[`, `[[`, `%%`, `> [!`. Le test de
   `![[` précède celui de `[[` pour que le message distingue un embed d'un
   wikilink.
4. **Pas de titre de niveau 1 en tête** — la première ligne non vide du corps ne
   doit pas commencer par `# `. Le `<h1>` de la page vient déjà du `title` du
   frontmatter ; un second casserait la hiérarchie des titres.

### Les blocs de code sont retirés avant les contrôles 3 et 4

Les contrôles portant sur le corps s'appliquent au texte **privé de ses blocs de
code clôturés (` ``` `) et de son code en ligne (`` ` ``)**.

C'est indispensable, pas une précaution : les articles existants contiennent des
blocs `bash`, où `[[ -f fichier ]]` est la syntaxe de test standard. Sans ce
retrait, un article traitant du shell serait rejeté pour un wikilink inexistant —
un faux positif bloquant, sur un article parfaitement valide.

### Format des erreurs

Toutes les erreurs sont rassemblées dans **un seul message**, une ligne par
erreur, chacune nommant le fichier :

```
Validation des articles : 3 erreurs
  src/content/blog/fr/mon-article.md : wikilink Obsidian ([[) dans le corps
  src/content/blog/fr/mon-article.md : titre de niveau 1 en tête du corps
  src/content/blog/fr/autre.md : translationKey « mutation-testing » déjà utilisée par mon-article
```

Le décompte porte sur les **erreurs**, pas sur les articles : un même fichier
peut en cumuler plusieurs, et il apparaît alors sur autant de lignes.

Un auteur corrigeant depuis son téléphone doit tout voir d'un coup ; faire
échouer le build sur la première erreur imposerait autant d'allers-retours que
d'erreurs.

## 5. Raccordement (`src/content/blog-utils.ts`)

```ts
const posts = await getCollection(collection);
const publies = posts.filter((p) => !p.data.draft);

if (!dejaValide.has(collection)) {
  const erreurs = validerArticles(publies.map(versArticleÀValider));
  if (erreurs.length > 0) throw new Error(formaterErreurs(erreurs));
  dejaValide.add(collection);
}

return showDrafts ? posts : publies;
```

Deux points portent tout le comportement :

- **Le filtrage des brouillons précède la validation, indépendamment de
  `showDrafts`.** C'est ce qui rend compatibles les deux décisions de la section
  2 : en développement `getPublishedPosts()` renvoie bien les brouillons, mais
  ne les valide pas. Valider ce que la fonction retourne aurait produit
  l'inverse de l'intention — brouillons contrôlés en dev, ignorés en production.
- **La mémoïsation par collection.** `getPublishedPosts()` est appelée huit fois
  par build. Sans elle, la validation tournerait huit fois et afficherait huit
  fois les mêmes erreurs.

## 6. Tests

**Unitaires (Vitest)** — sur `validerArticles`, en entrées littérales : un cas
passant, un par contrôle en échec, un cas à erreurs multiples vérifiant qu'elles
sont toutes rendues, et un cas de non-régression prouvant qu'un `[[` à
l'intérieur d'un bloc de code **ne** déclenche **pas** d'erreur.

**Bout en bout** — un article volontairement cassé est déposé dans la
collection, `npm run build` doit sortir en code non nul et son message doit
nommer le fichier ; l'article est retiré ensuite. Ce test protège le raccordement
lui-même, que les tests unitaires ne touchent pas.

**Non-régression** — les deux articles existants passent sans modification. Ils
ont été vérifiés : aucun résidu, aucun H1 en tête.

## 7. Compléments

- `src/styles/global.css` : `img { max-width: 100%; height: auto }`. Les images
  arriveront d'Obsidian à leur taille d'origine.
- **Protection de `main`** exigeant le check Vercel. `main` n'est pas protégée
  aujourd'hui (`Branch not protected`). Sans cette protection, le critère 4
  ci-dessous n'est pas atteint : le check passerait au rouge, mais rien
  n'empêcherait de fusionner.

## 8. Critères d'acceptation

1. Un article publié dont le frontmatter viole une contrainte de la section 3
   fait échouer `npm run build`.
2. Un article publié dont le corps viole un contrôle de la section 4 fait
   échouer `npm run build`, et le message nomme le fichier.
3. Plusieurs articles fautifs produisent **un seul** message listant toutes les
   erreurs.
4. Une PR contenant un article invalide a un check rouge et **ne peut pas** être
   fusionnée.
5. Un brouillon contenant de la syntaxe Obsidian ne fait échouer ni
   `npm run build` ni `astro dev`.
6. Un `[[` ou un `%%` situé dans un bloc de code ne déclenche aucune erreur.
7. Les deux articles existants passent sans modification.
8. `npm run test` passe.

## 9. Points ouverts et hors périmètre

- **`==surlignage==` non contrôlé.** La §5.4 du design du vault l'interdit dans
  les règles d'écriture, et annonce que « le build fait respecter ces règles »,
  mais la liste des contrôles de la §5.5 ne le mentionne pas. Ce document suit
  la liste de la §5.5. À trancher : l'ajouter, ou retirer la mention de la §5.4.
- **Aucune intégration continue.** Les checks des PR sont ceux de Vercel, dont
  le déploiement échoue si `astro build` échoue — le garde-barrière fonctionne
  donc sans CI. Ajouter un workflow GitHub Actions qui lance `lint`, `check` et
  `test` sortirait du périmètre de ce document.
- **Le champ `slug`** du template du vault est consommé par Enveloppe pour
  nommer le fichier publié ; il n'apparaît pas dans le frontmatter reçu par le
  blog et ne fait donc l'objet d'aucune contrainte ici.

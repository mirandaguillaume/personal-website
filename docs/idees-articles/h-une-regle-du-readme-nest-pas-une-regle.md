# H. Une règle dans le README n'est pas une règle

**Statut :** idée, non rédigée. **Effort :** faible à moyen. **Priorité recommandée : 1.**

**Thèse.** Une consigne écrite en prose est une demande, pas une garantie. C'est la situation du parallélisme dans le skill de code review, mais sans LLM : le défaut vient de la prose, pas de l'IA.

## La trouvaille (vérifiée dans le dépôt)

- Le README impose que toute page listant des articles passe par `getPublishedPosts()` et non par `getCollection()`, « sinon les brouillons fuiteraient en production ».
- `eslint.config.mjs` n'active que `tseslint.configs.recommended` et `eslintPluginAstro.configs.recommended` : aucune règle n'applique cette convention.
- Les seuls `getCollection` hors de `src/content/blog-utils.ts` portent sur `projects` et `experience` (`src/pages/projects.astro`, `src/pages/cv.astro` et leurs versions `en/`). Rien ne fuit aujourd'hui.
- Une nouvelle page qui appellerait `getCollection('blogFr')` publierait les brouillons **et** contournerait la validation (`validerArticles`), sans que rien ne la bloque.

## Plan

1. La règle telle qu'elle est écrite, et pourquoi elle existe (ce que le filtrage et la validation protègent).
2. Le constat : rien ne l'applique. Pas de panique, ce n'est pas un bug aujourd'hui.
3. Le test grandeur nature : écrire une page qui viole la règle. Le build passe, le brouillon fuite.
4. La correction : une règle ESLint qui interdit `getCollection` sur les collections de blog hors de `blog-utils.ts`. À tester, forme exacte non vérifiée.
5. La généralisation : ce qui doit toujours être vrai va dans un contrôle, pas dans un README.

## Matière

- **Réelle :** l'expérience est faisable en quelques minutes dans ce dépôt.
- **À faire :** la règle ESLint n'est pas écrite. Ne pas la présenter comme existante.

## Liens

Même mécanisme que la scène d'ouverture de l'article en cours. Voir A, J et K.

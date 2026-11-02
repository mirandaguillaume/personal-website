# Reprise — personal-website

## À quoi sert le projet

Blog et vitrine professionnelle bilingue (FR par défaut sans préfixe, EN sous `/en/`),
construits avec Astro 7, sortie statique, déployés sur Vercel. Les articles sont des fichiers
Markdown en content collections ; un build strict refuse tout article publié invalide.

## État au 2026-11-02

- Branche principale : `main` (suit `origin/main`). Dernier commit : « Durcir la validation des
  articles publiés (#26) ». Une PR par fonctionnalité, branches distantes déjà fusionnées
  (SEO, brouillons, bio, mutation testing, refonte visuelle, etc.).
- Premier article publié : mutation testing (FR et EN). Deux articles **en brouillon**
  (`draft: true`, non publiés) sont présents mais non suivis par Git :
  `src/content/blog/fr/llm-probabiliste-process-deterministe.md` et
  `src/content/blog/en/llm-is-probabilistic-your-process-shouldnt-be.md` (clé de traduction
  `workflows-deterministes`).
- Travail local non commité, sauvegardé le 2026-11-02 sur la branche `wip/sauvegarde-2026-11-02`
  (locale et poussée sur `origin`, commit `2ee945c`, 74 fichiers) : ces deux brouillons plus
  `docs/idees-articles/` (environ 70 fiches d'idées d'articles, dont `llm-supplementaires/`
  et deux plans détaillés dans `plans-detailles/`). Aucun stash.

## Installer et lancer

Prérequis : Node >= 22.12.

```bash
npm install
npm run dev            # serveur de développement (les brouillons sont visibles)
npm run check          # types + validation des content collections
npm run lint && npm run format:check
npm run test           # vitest (règles de validation des articles)
npm run test:e2e       # le build refuse-t-il bien un article invalide ?
npm run build          # production, sortie dans dist/
```

Après un `git clone`, poser l'identité git **locale** avant tout commit (elle n'est pas versionnée,
voir `README.md`) : `git config --local user.name` / `user.email` aux valeurs du compte
personnel, puis vérifier avec `git config --local user.email`.

## Où j'en étais et prochaines étapes

1. Décider du sort de `wip/sauvegarde-2026-11-02` : intégrer les deux brouillons et le dossier
   `docs/idees-articles/` à `main` (via une PR, `main` est protégée), ou les garder hors du dépôt public.
   Les fiches d'idées sont des plans « à rédiger » (statut « idée, non rédigée ») ; à relire
   avant publication car le dépôt est public.
2. Terminer puis publier les deux brouillons sur le déterminisme des workflows autour d'un LLM
   (passer `draft` à `false`, vérifier `translationKey` identique en FR/EN).
3. Pour prévisualiser des brouillons sur Vercel : déclarer `SHOW_DRAFTS=true` limité à
   l'environnement Preview (Project Settings -> Environment Variables).
4. Publication depuis Obsidian : le plugin Enveloppe (PR vers ce dépôt, `lang` du frontmatter
   décide de la destination) était prévu mais pas encore en service ; la spec qui le décrit vit
   dans le vault de notes local, pas dans ce dépôt.
5. Idées d'articles priorisées dans `docs/idees-articles/` (plans 1 et 5 détaillés dans
   `plans-detailles/`).

## À fournir hors dépôt

- Variable d'environnement : `SHOW_DRAFTS` (optionnelle, `true` pour afficher les brouillons
  d'un build).
- Projet Vercel lié au dépôt (domaine : `https://personal-website-kappa-two-36.vercel.app`,
  déclaré dans `astro.config.mjs`) ; `.vercel/` est ignoré, à relier avec `vercel link` si besoin.
- Identité git locale du dépôt (voir ci-dessus) ; clé SSH GitHub du compte personnel.

## Pièges connus

- Un article publié sans `translationKey` (kebab minuscule, identique FR/EN, unique par langue)
  fait **échouer le build**, volontairement ; une traduction restée en brouillon ne déclare pas
  de `hreflang`.
- Toute page listant des articles doit passer par `getPublishedPosts()`
  (`src/content/blog-utils.ts`), jamais par `getCollection()`, sinon les brouillons fuitent.
- Le corps d'un article publié ne doit contenir ni syntaxe Obsidian (`[[`, `![[`, `%%`, `> [!`)
  ni titre de niveau 1 ; seuls les brouillons y échappent.
- Les noms de fichier d'article sont en kebab ASCII minuscule ; slugs différents entre FR et EN.
- Deux commits avaient été poussés avec une adresse professionnelle faute d'identité locale
  (corrigé le 2026-09-25) : toujours vérifier `git config --local user.email`.
- Si un push échoue sur « droits d'accès » alors que le compte est bon : vérifier le bloc
  `Host github.com` de `~/.ssh/config` (une deploy key limitée à un autre dépôt peut masquer
  la clé personnelle).

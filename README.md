# Site personnel

Blog et vitrine professionnelle bilingue (FR/EN), construit avec [Astro](https://astro.build).
Sortie statique, déployé sur Vercel.

## Développement local

```bash
npm install
npm run dev
```

## Vérifications

```bash
npm run check          # types + validation des content collections
npm run lint           # ESLint
npm run format:check   # Prettier
npm run build          # build de production dans dist/
```

## Structure

| Chemin                                               | Rôle                                      |
| ---------------------------------------------------- | ----------------------------------------- |
| `src/pages/`                                         | Pages FR (racine) et EN (`src/pages/en/`) |
| `src/content/blog/fr/`, `src/content/blog/en/`       | Articles, un fichier Markdown par langue  |
| `src/content.config.ts`                              | Schémas des content collections           |
| `src/data/projects.json`, `src/data/experience.json` | Projets et expérience                     |
| `src/i18n/ui.ts`                                     | Dictionnaire de traduction de l'interface |

Le FR est la langue par défaut et n'est pas préfixée (`/blog/`) ; l'EN l'est (`/en/blog/`).

## Ajouter un article

Créer un fichier Markdown dans `src/content/blog/fr/` et sa traduction dans
`src/content/blog/en/`. Le nom du fichier devient l'URL de l'article.

```yaml
---
title: "Titre de l'article"
description: 'Résumé affiché dans les listes et la balise meta description.'
pubDate: 2026-09-21
tags: ['testing', 'php']
draft: false # optionnel, false par défaut
---
```

Les tags génèrent automatiquement leurs pages de filtrage (`/blog/tags/<tag>/`).

## Brouillons

Un article avec `draft: true` est masqué du site publié (listes, pages de tag,
articles récents et page de l'article). Il reste visible :

- en développement (`npm run dev`), où la variable `DEV` est active ;
- sur un build où `SHOW_DRAFTS=true` est défini.

Le filtrage est centralisé dans `src/content/blog-utils.ts` — toute nouvelle page
listant des articles doit passer par `getPublishedPosts()` et non par
`getCollection()`, sinon les brouillons fuiteraient en production. Un badge
« Brouillon » / « Draft » s'affiche sur les articles concernés.

Pour relire des brouillons sur une preview Vercel, `SHOW_DRAFTS=true` doit être
déclaré dans les variables d'environnement du projet, limité à l'environnement
Preview (Vercel → Project Settings → Environment Variables).

## Déploiement (Vercel)

Vercel détecte Astro automatiquement, aucune configuration nécessaire.

- chaque push sur `main` déploie en production ;
- chaque branche ou pull request obtient une preview automatique ;
- domaine personnalisé : Vercel → Project Settings → Domains.

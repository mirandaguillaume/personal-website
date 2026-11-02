# J. Déployer n'est pas publier : brouillons et previews

**Statut :** idée, non rédigée. **Effort :** faible.

**Thèse.** Séparer le déploiement de la publication coûte quelques lignes de config.

## Plan

1. Le besoin : relire un brouillon sans le montrer au monde.
2. Le mécanisme : `draft: true`, visible en développement (`DEV`) ou avec `SHOW_DRAFTS=true`.
3. La subtilité Vercel : `SHOW_DRAFTS=true` limité à l'environnement Preview.
4. Le piège : où le filtrage doit vivre (`getPublishedPosts()`), d'où le lien avec H.
5. Ce que le badge « Brouillon » évite.

## Matière

- **Réelle :** entièrement dans le README et dans `src/content/blog-utils.ts`.
- **Détail de conception à raconter :** le filtrage des brouillons précède la validation, parce qu'un brouillon en chantier contient légitimement de la syntaxe Obsidian.

## Remarque

Si H est écrit, J devient plutôt une section de H qu'un article autonome.

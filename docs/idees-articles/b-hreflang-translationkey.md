# B. hreflang et `translationKey` sur un site statique bilingue

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Quand les slugs sont traduits, seule une clé explicite peut relier les deux versions d'un article.

## Plan

1. Le problème : FR `/blog/mutation-testing-vos-tests-testent-ils-vraiment-quelque-chose/` contre EN `/en/blog/mutation-testing-do-your-tests-actually-test-anything/`.
2. Pourquoi on ne peut pas déduire la traduction du nom de fichier.
3. Le choix de faire échouer le build plutôt que de deviner.
4. Le cas des brouillons : « mieux vaut aucun `hreflang` qu'un `hreflang` pointant vers une page absente du site publié » (README).
5. Canonical, Open Graph, sitemap : le reste du socle SEO.

## Matière

- **Réelle :** PR #24 (socle SEO) et #25 (documentation de `translationKey`), `src/i18n/alternates.ts`.
- **À recouper :** les règles de Google sur `hreflang` (réciprocité, canonical) avant toute affirmation SEO.

## Liens

Voir A (le build qui refuse) pour la validation, et J (brouillons).

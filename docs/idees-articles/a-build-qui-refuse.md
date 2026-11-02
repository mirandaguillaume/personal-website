# A. Un build qui refuse : valider son contenu comme du code

**Statut :** idée, non rédigée. **Effort :** faible.

**Thèse.** Une erreur qui ne se remarque pas doit casser le build, pas attendre d'être découverte.

## Plan

1. L'erreur silencieuse : un `hreflang` manquant ne se voit nulle part (le README le dit presque mot pour mot).
2. Le tableau des règles vérifiées au build : `translationKey` unique, nom de fichier en kebab ASCII, aucune syntaxe Obsidian dans le corps.
3. Les brouillons y échappent exprès, et pourquoi.
4. Tester le test : `test:e2e` vérifie que le build refuse bien un article invalide.
5. Ouverture : un contrôle qui peut dire non.

## Matière

- **Réelle :** dans le dépôt (README, PR #26, `src/content/article-validation.test.ts`, `blog-utils.ts`).
- **À vous :** la première fois qu'un contenu invalide vous a échappé.

## Liens

C'est l'exemple du besoin n° 3 de l'article en cours (critères de sortie vérifiés par du code), développé. Voir aussi H et J.

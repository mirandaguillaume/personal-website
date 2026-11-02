# I. Passer du mutation testing sur la validation de mon propre blog

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Celui qui prêche le mutation testing devrait le passer sur son propre code.

## Plan

1. Le contexte : `validerArticles` est une fonction pure, couverte par `src/content/article-validation.test.ts`.
2. Le coverage affiché, puis le mutation score réel.
3. Les mutants survivants : ce que les tests ne vérifient pas.
4. Les tests ajoutés pour les tuer, avec le score avant et après.
5. Le retour d'expérience sur l'outil appliqué à du TypeScript.

## Matière

- **À produire :** les mesures. Je peux lancer l'expérience si vous le demandez.
- **À recouper :** le choix de l'outil (Stryker semble le candidat naturel avec Vitest) et sa compatibilité avec la version de Vitest du dépôt (`^5.0.2`).

## Liens

Voir E (tests générés par IA) et l'article « Mutation testing : vos tests testent-ils vraiment quelque chose ? ».

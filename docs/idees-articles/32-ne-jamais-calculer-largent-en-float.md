# 32. Ne jamais calculer l'argent en float

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** L'incident des 8 000 € de l'article sur le mutation testing venait d'un arrondi supprimé. Mieux vaut un type qui rend l'erreur impossible.

## Plan

1. Rappel : `round($price * $quantity * (1 + $taxRate), 2)` est devenu la même expression sans `round()` après un « petit refacto » (vérifié dans l'article).
2. Pourquoi les flottants posent problème pour l'argent.
3. Représenter en unités mineures (entiers) ou avec une bibliothèque décimale : les choix possibles en PHP.
4. Un value object `Money` : où l'arrondi est décidé, une seule fois.
5. Le test qui aurait détecté le problème : des valeurs réalistes, comme `19.99 × 3 × 1.055` (déjà dans l'article).

## Matière

- **Vérifiée :** l'incident et les valeurs de test, dans l'article existant.
- **À recouper :** la norme IEEE 754 et la documentation PHP sur la précision des flottants, avant d'expliquer le mécanisme.

## Liens

Suite de l'article sur le mutation testing. Voir 31.

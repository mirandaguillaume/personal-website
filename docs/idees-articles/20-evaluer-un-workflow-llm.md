# 20. Évaluer un workflow LLM : tester ce qui varie

**Statut :** idée, non rédigée. **Effort :** élevé.

**Thèse.** On ne peut pas tester l'égalité d'une sortie qui varie, mais on peut tester ses propriétés.

## Plan

1. Pourquoi `assertEquals` ne marche plus sur une sortie de LLM.
2. Tester des propriétés : format valide, champs présents, bornes. Tout cela est déterministe.
3. Répéter N fois et mesurer un taux plutôt qu'un oui/non.
4. LLM-as-judge : quand l'utiliser, et ses limites. Un juge peut se tromper lui aussi.
5. Un jeu d'évaluation versionné dans le dépôt, comme du code.

## Matière

- **À produire :** une petite expérience sur un vrai workflow à vous.
- **À recouper :** la littérature sur LLM-as-judge et la documentation d'évaluation d'un fournisseur, avant de citer un chiffre.

## Liens

Développe le besoin n° 3 de l'article en cours. Voir E.

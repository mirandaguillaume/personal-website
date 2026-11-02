# 62. Pourquoi mon agent a ignoré ma consigne

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Une consigne ignorée a presque toujours une cause identifiable : on peut la diagnostiquer plutôt que de la répéter plus fort.

## Plan

1. Le cas : une règle claire, non respectée (à vous : un exemple précis).
2. Les causes plausibles : consigne noyée parmi d'autres, contradiction entre deux couches (voir 27), formulation ambiguë, tâche qui l'emporte sur la règle.
3. Méthode de diagnostic : isoler la consigne, la tester seule, ajouter une couche à la fois.
4. Les remèdes : raccourcir, dédupliquer, reformuler, ou sortir la règle de la prose vers un hook (voir K).
5. Mesurer : estimer ce qui est « probablement ignoré », comme le fait Reify (voir D).

## Matière

- **Connue :** Reify annonce « analyser ce qui est présent, ce qui manque, et ce qui est probablement ignoré » (description du projet).
- **À vous :** des cas réels et ce qui a marché.
- **À recouper :** toute affirmation sur la façon dont un modèle pondère les consignes, qui doit venir d'une source ou d'une mesure à vous.

## Liens

Voir D, K et 27.

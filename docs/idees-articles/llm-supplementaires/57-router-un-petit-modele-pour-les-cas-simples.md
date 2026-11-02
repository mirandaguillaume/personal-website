# 57. Router : un petit modèle pour les cas simples

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Tous les appels n'ont pas besoin du plus gros modèle. Classer d'abord, puis envoyer chaque cas au bon endroit.

## Plan

1. Le pattern, tel qu'Anthropic le décrit : « Routing classifies an input and directs it to a specialized followup task » (vérifié).
2. Son exemple : envoyer les questions simples vers un modèle plus petit et moins coûteux, les difficiles vers un modèle plus capable (vérifié).
3. Ce qui rend le routage fiable : une classification qu'on peut évaluer, ou un classifieur plus classique.
4. Les risques : un mauvais routage dégrade le résultat sans alerte.
5. Mesurer le gain réel en coût et en qualité.

## Matière

- **Vérifiée :** les deux phrases d'Anthropic.
- **À produire :** une expérience avec vos propres cas.

## Liens

Voir 56, 20 et l'article en cours (le routage est un workflow, pas un agent).

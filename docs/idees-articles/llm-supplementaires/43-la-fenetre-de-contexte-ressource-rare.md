# 43. La fenêtre de contexte : la ressource rare

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Tout ce qui entre dans le contexte a un coût (tokens, attention, argent), et la plupart des gains pratiques viennent de ce qu'on n'y met pas.

## Plan

1. Le constat : une session longue se dégrade ou se résume.
2. Ce qui remplit le contexte : sorties d'outils volumineuses, fichiers entiers, consignes empilées (voir 27).
3. Des remèdes concrets : traiter les données dans un bac à sable et n'en remonter que le résultat, indexer puis interroger plutôt que lire. C'est le principe des outils d'indexation de contexte utilisés dans cette session.
4. Ce que ça coûte : angles morts, résultats tronqués.
5. Comment mesurer : voir L.

## Matière

- **Observée :** des outils de ce type étaient actifs dans la session.
- **À vous :** vos propres cas.
- **À recouper :** le fonctionnement de la compaction et les limites de contexte du modèle utilisé, dans sa documentation.

## Liens

Voir L, 27 et 54.

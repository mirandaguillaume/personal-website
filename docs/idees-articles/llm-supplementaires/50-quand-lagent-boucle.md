# 50. Quand l'agent boucle : le détecter et l'arrêter

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Un agent qui répète la même action sans progresser coûte cher et ne le dit pas. Il faut des garde-fous écrits en code.

## Plan

1. Une boucle vécue (à vous).
2. Les signes : mêmes appels d'outil répétés, mêmes erreurs, contexte qui gonfle.
3. Les garde-fous : budget d'étapes, budget de tokens, détection de répétition.
4. Que faire à l'arrêt : abandonner, escalader à un humain, repartir d'un état propre.
5. Pourquoi ces garde-fous ne doivent pas dépendre du modèle lui-même.

## Matière

- **À vous :** le cas vécu et les paramètres que vous avez choisis.

## Liens

Voir 22, 23 et 56.

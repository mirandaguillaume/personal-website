# 69. Réécrire son README : ce qu'on y met quand on revient dans six mois

**Statut :** idée, non rédigée. **Effort :** faible.

**Thèse.** Un README sert d'abord à son futur auteur. Le réécrire montre ce qui manque.

## Faits vérifiés

- La PR #23 a retouché le README (66 lignes modifiées dans le stat du commit).
- Le README actuel contient : développement local, prérequis sur un nouveau poste (identité Git), vérifications (`check`, `lint`, `format:check`, `build`), structure du dépôt sous forme de tableau, ajout d'un article, `translationKey`, contraintes vérifiées au build, brouillons, déploiement Vercel.
- Il explique le **pourquoi** de plusieurs règles (par exemple pourquoi un article sans `translationKey` fait échouer le build), pas seulement le comment.

## Plan

1. Le README qu'on écrit au début, et celui dont on a besoin six mois plus tard.
2. Ce qui manque dans un README de départ : les règles non évidentes, les pièges, les décisions.
3. Documenter le pourquoi : un exemple tiré de `translationKey`.
4. Le risque : une règle écrite dans le README n'est pas appliquée (voir H).
5. Comment le garder à jour : le relire à chaque tâche qui change une règle.

## Matière

- **Réelle :** le README du dépôt, avant et après la PR #23 (`git show 22441d1 -- README.md`).
- **À vous :** ce que vous y avez cherché sans le trouver.

## Liens

Voir H et B.

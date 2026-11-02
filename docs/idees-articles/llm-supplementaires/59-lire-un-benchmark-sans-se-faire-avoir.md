# 59. Lire un benchmark sans se faire avoir : ULT et TestEval

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Un score de benchmark ne dit pas grand-chose sans savoir ce que le benchmark mesure, et ce qu'il laisse de côté.

## Plan

1. Le point de départ : un chiffre cité partout (« 40 % de mutation score »).
2. Ce que dit le paper (vérifié) : les benchmarks existants souffrent de deux défauts, la contamination des données et des fonctions structurellement simples. ULT a été conçu pour les corriger.
3. Lire les chiffres ensemble, pas isolément : ULT donne 41,32 % (précision), 45,10 % (statement coverage), 30,22 % (branch coverage) et 40,21 % (mutation score). TestEval, sur les mêmes métriques, donne 91,79 %, 92,18 %, 82,04 % et 49,69 %. L'écart est très marqué sur la précision et la couverture, bien moins sur le mutation score.
4. Les questions à se poser : qu'est-ce qui est mesuré, avec quelles données, avec quelle métrique, et quel écart avec mon cas.
5. La limite d'un benchmark public pour décider de son propre usage : voir 20.

## Matière

- **Vérifiée :** tous les chiffres, dans le résumé de arXiv:2508.00408.
- **À recouper :** les tableaux détaillés du paper, que je n'ai pas lus.

## Liens

Voir E, F et 46.

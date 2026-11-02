# P. Les tests flaky sont un problème de déterminisme

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Un test flaky n'est pas un test capricieux, c'est un test qui dépend de quelque chose qu'il ne contrôle pas.

## Plan

1. Le test qui échoue une fois sur dix (à vous : un cas vécu).
2. Les sources d'indéterminisme : le temps, l'ordre d'exécution, l'état partagé, le réseau, la concurrence.
3. Comment les débusquer : ordre aléatoire avec graine, exécution en boucle.
4. Les remèdes : horloge injectée, isolation des tests, doubles de test.
5. La parallélisation, qui révèle l'état partagé caché (lien avec PHPUnit Rust).

## Matière

- **À vous :** le cas vécu.
- **À recouper :** les options exactes de PHPUnit pour l'ordre aléatoire et la graine. Ne citer aucun chiffre de fréquence de tests flaky sans source primaire.

## Liens

Même thème que l'article en cours, sans l'IA. Voir C et Q.

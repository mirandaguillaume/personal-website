# 37. Couverture statique contre couverture dynamique

**Statut :** idée, non rédigée. **Effort :** élevé.

**Thèse.** À préciser avec votre implémentation : savoir quels tests touchent quel code sans les exécuter change ce qu'on peut automatiser.

## Plan

1. La couverture dynamique : exécuter les tests avec un pilote de couverture et mesurer. Son coût.
2. La couverture statique : déduire l'association tests/code sans exécution (à vous : comment fait PHPUnit Rust).
3. Ce que ça permet : ne relancer que les tests concernés.
4. Les limites : code dynamique, réflexion, autoloading.
5. Lien avec le mutation testing : quel test lancer pour quel mutant.

## Matière

- **À vous :** presque tout, c'est le cœur de votre projet.
- **À recouper :** les pilotes de couverture PHP et leur coût, et la manière dont Infection associe tests et mutants, avant d'affirmer quoi que ce soit.

## Liens

Voir C, 29 et 36.

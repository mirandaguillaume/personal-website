# Q. Le temps est une dépendance : injecter l'horloge

**Statut :** idée, non rédigée. **Effort :** faible.

**Thèse.** `new DateTime()` dans le code métier est une dépendance cachée qui rend les tests non déterministes.

## Plan

1. Un test qui passe le matin et échoue le soir, ou le dernier jour du mois.
2. Le coupable : l'heure lue directement.
3. La solution : une horloge injectée, avec une implémentation figée pour les tests.
4. Les cas tordus : fuseaux horaires, passage à l'heure d'été, minuit.
5. Ce que ça change dans la conception.

## Matière

- **À vous :** le code d'exemple, écrit et testé par vous.
- **À recouper :** l'existence et le contrat de l'interface d'horloge standardisée côté PHP (PSR-20) avant de la citer.

## Liens

Voir P (tests flaky).

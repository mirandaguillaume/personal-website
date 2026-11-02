# O. RabbitMQ en production

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Un message peut arriver deux fois, jamais, ou dans le désordre. Le code doit le supposer.

## Plan

1. Une panne ou un bug réel (à vous), puis la cause.
2. L'idempotence : rendre un consommateur rejouable sans effet de bord.
3. Retries et dead-letter queues : où mettre le message qui échoue sans cesse.
4. Les acquittements : ce qui se passe si le consommateur plante avant d'accuser réception.
5. Les pièges qu'on ne voit qu'en production.

## Matière

- **Connue :** vos postes chez Worldia et Singulart mentionnent RabbitMQ (`src/data/experience.json`).
- **À vous :** les anecdotes et les chiffres.
- **À recouper :** le vocabulaire et les garanties de RabbitMQ dans sa documentation officielle, avant toute affirmation technique.

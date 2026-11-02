# 58. Un appel LLM est un appel réseau non fiable : le mettre derrière une file

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM, back-end.

**Thèse.** Un appel à un LLM est lent, coûteux, parfois en erreur et non déterministe. On le traite comme n'importe quel appel externe fragile : file de messages, retries, idempotence.

## Plan

1. Le cas : un appel LLM dans le chemin d'une requête web, qui bloque ou échoue.
2. Le sortir du chemin critique : le déposer dans une file et le traiter en tâche de fond.
3. L'idempotence : rejouer un appel LLM sans doubler ses effets de bord, en enregistrant le résultat.
4. Retries, délais, dead-letter queue pour les échecs répétés (voir O).
5. Le même raisonnement que les moteurs de workflows durables : Temporal range les « LLM/AI invocations » dans des Activities retentées automatiquement (vérifié).

## Matière

- **Vérifiée :** la phrase de la doc Temporal.
- **À vous :** votre expérience de RabbitMQ (Worldia, Singulart) et un cas réel.
- **À recouper :** la documentation de RabbitMQ avant toute affirmation de garantie.

## Liens

Voir O, 22 et 56.

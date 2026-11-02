# 22. Tracer un agent : journaux, rejeu, observabilité

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Sans trace, on ne peut ni expliquer ni rejouer ce que l'agent a fait.

## Plan

1. L'incident qu'on ne peut pas reconstituer (à vous).
2. Ce qu'il faut garder : entrées, sorties, outils appelés, version du prompt, modèle utilisé.
3. Le rejeu. Modèle à étudier : l'Event History de Temporal, « un enregistrement complet et ordonné de tout ce qui s'est passé dans une exécution de workflow », rejoué pour reconstruire l'état.
4. Le coût de stockage et les données sensibles dans les traces.
5. Les outils existants (à recouper, sans les comparer).

## Matière

- **Vérifiée :** la description de l'Event History dans la doc Temporal (`docs.temporal.io/evaluate/understanding-temporal`).
- **À vous :** l'incident de départ.

## Liens

Développe le besoin n° 4 de l'article en cours. Voir 20.

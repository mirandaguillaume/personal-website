# 47. Le test d'abord, même avec un agent

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Écrire le test avant de demander l'implémentation donne à l'agent un critère de sortie vérifiable par du code.

## Plan

1. Le piège : demander le code puis les tests, que l'agent écrit pour faire passer son propre code.
2. Inverser : un test qui échoue d'abord, écrit par vous, puis l'implémentation par l'agent.
3. Vérifier que le test échoue pour la bonne raison.
4. Le mutation testing pour juger si le test protège vraiment.
5. Ce que ça change dans la vitesse et la confiance.

## Matière

- **À vous :** une expérience comparée (avec et sans test d'abord), avec des mesures.

## Liens

Applique le besoin n° 3 de l'article en cours. Voir E, 46 et 30.

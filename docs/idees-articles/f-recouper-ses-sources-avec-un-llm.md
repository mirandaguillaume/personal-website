# F. J'ai fait recouper mes sources par un LLM

**Statut :** idée, non rédigée. **Effort :** faible.

**Thèse.** Un LLM accélère le recoupement, mais ce qui compte, c'est de lire la source primaire.

## Plan

1. Le contexte : un article avec des chiffres cités.
2. Ce que les sources secondaires disaient : un « 34 % de surcoût » pour le déterminisme, alors que le billet original donne 26 s → 42 s.
3. Ce qui a tenu : le 40,21 %, les définitions d'Anthropic, la phrase de la doc Claude sur `temperature=0`.
4. Ce qui était flou : la formulation sur la contamination dans l'article sur le mutation testing.
5. L'historique : le commit #21 avait déjà corrigé « 40 %, pas 20 % ». Une erreur de citation, ça arrive à tout le monde.
6. La méthode reproductible : primaire d'abord, secondaire pour croiser, un chiffre non retrouvé n'est pas écrit.

## Faits vérifiés pendant la session

- **Thinking Machines** (Horace He, 10 septembre 2025) : 80 complétions uniques sur 1 000 à température 0 (Qwen3-235B-A22B-Instruct-2507), divergence au 103e token. Surcoût mesuré : 26 s (vLLM par défaut) → 55 s (déterministe, non optimisé) → 42 s (noyau d'attention amélioré), Qwen3-8B sur un GPU. Le « 34 % » vu dans une source secondaire n'est pas dans le billet.
- **arXiv:2508.00408** : le résumé donne 40,21 % de mutation score moyen. ULT est construit par une curation en plusieurs étapes qui garantit une forte complexité cyclomatique **et** limite la contamination des tests, deux critères distincts. Le texte de l'article sur le mutation testing (« fonctions suffisamment complexes pour éviter la contamination ») les confond légèrement.
- **LangGraph** reprend presque mot pour mot la définition workflow / agent d'Anthropic : ce n'est pas une confirmation indépendante.
- **Non recoupé :** le lien entre le lancement séquentiel d'agents et l'émission des appels dans des messages séparés (vient de la description d'un outil, pas d'une doc publique).

## Matière

- **Réelle :** déjà vérifiée dans la session.
- **À vous :** ce que ça change dans votre façon d'écrire.

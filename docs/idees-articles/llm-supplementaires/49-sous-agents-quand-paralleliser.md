# 49. Sous-agents : quand paralléliser, quand ne pas le faire

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Lancer plusieurs agents ne rend pas toujours plus rapide ni meilleur. Il faut savoir quand le découpage paie.

## Plan

1. Les deux formes de découpage : des sous-tâches connues d'avance (une lentille chacune) et des sous-tâches décidées en cours de route.
2. Anthropic distingue ce second cas : dans l'orchestrator-workers, « a central LLM dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes their results », et les sous-tâches « aren't pre-defined, but determined by the orchestrator » (vérifié).
3. Ce que coûte la parallélisation : tokens, contexte dupliqué, synthèse à faire.
4. Les tâches indépendantes qui s'y prêtent, et celles qui dépendent les unes des autres.
5. Qui décide du découpage : le modèle ou le code (lien avec l'anecdote d'ouverture de l'article en cours).

## Matière

- **Vérifiée :** les deux citations d'Anthropic.
- **À vous :** une mesure de temps et de coût, avec et sans parallélisation.
- **À recouper :** le pattern de parallélisation d'Anthropic, que je n'ai pas relu dans le détail.

## Liens

Voir G, 48 et l'article en cours.

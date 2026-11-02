# 41. Reproduire une réponse de LLM : ce que je peux régler, ce que je ne peux pas

**Statut :** idée, non rédigée. **Effort :** faible. **Thème :** LLM.

**Thèse.** Un guide pratique des paramètres de reproductibilité : ce qui aide, ce qui ne garantit rien.

## Plan

1. Le cas d'usage : relancer une exécution et obtenir la même chose (débogage, tests, audit).
2. Ce que les fournisseurs disent eux-mêmes (vérifié) :
   - Claude : « Note that even with temperature of 0.0, the results will not be fully deterministic » (doc de l'API Messages).
   - OpenAI : les API sont « non-deterministic by default », avec un paramètre `seed` qui donne une sortie « mostly deterministic » et un échantillonnage « best effort », complété par `system_fingerprint` (cookbook).
3. Ce qu'on peut faire : figer ce qui est sous notre contrôle (version du modèle, prompt, température, `seed`), journaliser le reste.
4. Ce qu'on ne peut pas faire : contrôler les kernels et la charge du serveur (voir 42).
5. La stratégie de repli : valider la sortie plutôt que la reproduire.

## Matière

- **Vérifiée :** les deux sources ci-dessus.
- **À recouper :** les paramètres disponibles chez chaque fournisseur au moment d'écrire (ils changent).

## Liens

Prolonge la première partie de l'article en cours. Voir 42 et 45.

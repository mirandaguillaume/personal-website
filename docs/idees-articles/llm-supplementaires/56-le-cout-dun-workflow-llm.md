# 56. Le coût d'un workflow LLM : tokens, cache, choix du modèle

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Le coût d'un workflow se calcule étape par étape. Sans cela, on découvre la facture après.

## Plan

1. Pourquoi une estimation par étape plutôt qu'un coût moyen.
2. Ce qui entre dans le coût : tokens en entrée, en sortie, relances, étapes parallèles.
3. Les leviers : un modèle plus petit pour les étapes simples (voir 57), la mise en cache de prompts, la réduction du contexte (voir 43).
4. Mesurer plutôt qu'estimer : instrumenter chaque étape (voir 22).
5. Fixer un budget par exécution, appliqué en code (voir 50).

## Matière

- **À produire :** un workflow réel avec ses coûts mesurés par étape.
- **À recouper :** les tarifs et le fonctionnement du cache de prompts dans la documentation du fournisseur, au moment d'écrire. Ne citer aucun prix de mémoire.

## Liens

Voir 22, 43, 50 et 57.

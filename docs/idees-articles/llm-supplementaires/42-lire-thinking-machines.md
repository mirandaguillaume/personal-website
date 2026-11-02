# 42. Lire « Defeating Nondeterminism in LLM Inference » : ce qu'un dev back-end peut en retenir

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Un billet de recherche dense devient utile à un développeur back-end une fois traduit en conséquences pratiques.

## Plan

1. Le contexte : Horace He et Thinking Machines, 10 septembre 2025.
2. Le résultat : 1 000 complétions à température 0 sur Qwen3-235B-A22B-Instruct-2507 donnent 80 réponses distinctes, identiques sur 102 tokens puis divergentes au 103ᵉ.
3. L'explication : l'hypothèse « concurrence + virgule flottante » est écartée. La cause est que les noyaux ne sont pas invariants à la taille du batch, laquelle varie avec la charge du serveur.
4. La conséquence pour vous : la non-reproductibilité vient du **service**, pas du modèle. Un autre fournisseur ne la corrigera pas.
5. Le prix de la correction : sur leur benchmark (Qwen3-8B, un GPU), 26 s → 55 s non optimisé → 42 s avec un meilleur noyau d'attention.

## Matière

- **Vérifiée :** tous les chiffres ci-dessus, dans le billet original.
- **À éviter :** le « 34 % de surcoût » vu dans une source secondaire, absent du billet.

## Liens

Voir 41 et F.

# 54. Chercher sans embeddings : FTS5, trigrammes et fusion de rangs

**Statut :** idée, non rédigée. **Effort :** élevé. **Thème :** LLM (RAG).

**Thèse.** Beaucoup de cas de recherche pour un LLM se règlent sans base vectorielle : de la recherche textuelle bien choisie suffit.

## Plan

1. Le besoin : retrouver le bon passage dans de la documentation ou des notes, pour le donner à un modèle.
2. Deux recherches complémentaires : lexicale avec racinisation, et par sous-chaînes (trigrammes).
3. Les fusionner par Reciprocal Rank Fusion : un document bien classé dans les deux listes remonte.
4. Corriger les fautes de frappe, reclasser selon la proximité des termes.
5. Où cette approche s'arrête et où les embeddings reprennent la main.

## Matière

- **Observée :** la description de l'outil d'indexation utilisé dans cette session décrit précisément cette architecture (SQLite FTS5, deux recherches fusionnées par RRF, correction de typos par distance de Levenshtein, reclassement par proximité).
- **À recouper :** la documentation de SQLite FTS5 et la définition de Reciprocal Rank Fusion dans sa source d'origine, avant d'expliquer.
- **À produire :** une expérience comparée sur un corpus à vous.

## Liens

Voir 43 et 60.

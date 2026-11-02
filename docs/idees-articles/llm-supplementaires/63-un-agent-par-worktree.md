# 63. Un agent par worktree : isoler le travail en parallèle

**Statut :** idée, non rédigée. **Effort :** faible. **Thème :** LLM, Git.

**Thèse.** Plusieurs agents sur le même dépôt s'écrasent mutuellement. Un worktree par agent règle le problème sans cloner.

## Plan

1. Le problème : deux agents qui modifient les mêmes fichiers dans le même répertoire.
2. Le worktree Git : plusieurs répertoires de travail partageant un même dépôt.
3. Un agent, une branche, un worktree : comment on lance et comment on fusionne.
4. Les pièges : dépendances à réinstaller, ports et bases de données partagés, nettoyage.
5. Quand ça ne vaut pas le coup.

## Matière

- **À vous :** votre usage réel et les pièges que vous avez rencontrés.
- **À recouper :** la documentation de `git worktree`, avant d'écrire les commandes.

## Liens

Voir 49 et G.

# 67. Protéger la branche `main` quand on est seul sur le projet

**Statut :** idée, non rédigée. **Effort :** faible.

**Thèse.** Une protection de branche a du sens même sans équipe, si elle est réglée pour ne pas vous enfermer dehors.

## Faits vérifiés dans le plan « durcissement de la validation » (Task 8)

- Objectif : « une PR au check rouge ne peut pas être fusionnée ».
- Réglages prévus via `gh api` : check de statut Vercel obligatoire, `strict` à vrai, **pas de relecture obligatoire** (`required_pull_request_reviews=null`), `enforce_admins=false`.
- Raison donnée dans le plan : `enforce_admins=false` laisse à l'utilisateur la possibilité de forcer une fusion s'il le décide, car il est seul sur le dépôt.
- La tâche demande explicitement une confirmation avant d'appliquer le réglage, car il modifie les paramètres GitHub.
- **Non vérifié :** si la protection a effectivement été activée. Le plan ne l'indique pas, et je n'ai pas interrogé GitHub.

## Plan

1. Pourquoi protéger une branche quand on est seul : se protéger de soi-même un jour de fatigue.
2. Ce qu'on protège réellement : un check rouge ne doit pas passer.
3. Les compromis : pas de relecture obligatoire (personne à qui la demander), administrateur non bloqué.
4. L'ordre des opérations : relever le nom exact du check, vérifier l'état, activer, vérifier.
5. Ce que ça donne au quotidien, et le piège du nom de check qui change.

## Matière

- **Réelle :** le plan et la spec.
- **À vous :** l'avez-vous activée, et qu'est-ce que ça a changé ?
- **À recouper :** la documentation GitHub sur la protection de branche avant d'expliquer chaque option.

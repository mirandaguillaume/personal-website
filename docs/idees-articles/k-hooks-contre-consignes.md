# K. Hooks contre consignes : ce que l'agent exécute et ce qu'il interprète

**Statut :** idée, non rédigée. **Effort :** moyen. **Priorité recommandée : 2.**

**Thèse.** Ce qui doit se produire à chaque fois va dans un hook, pas dans une consigne.

## Plan

1. Rappel de l'anecdote du parallélisme (ou renvoi vers l'article en cours).
2. Les deux couches : les consignes (CLAUDE.md, skills), que le modèle lit et interprète, et les hooks, que le harnais exécute.
3. Vos exemples réels : le hook RTK qui réécrit `git status` en `rtk git status` de façon transparente (`RTK.md`). Pendant la session, un hook a aussi redirigé une lecture web vers un autre outil.
4. Les limites : un hook ne fait que ce qu'on lui a écrit, et il peut surprendre.
5. Comment choisir : toujours → hook, souvent → consigne.

## Matière

- **Connue :** la description du skill de configuration indique que les comportements automatiques nécessitent des hooks, « le harnais les exécute, pas Claude ».
- **À recouper :** la documentation publique des hooks de Claude Code (événements disponibles, garanties d'exécution) avant toute affirmation.
- **À vous :** décider ce que vous montrez de votre configuration.

## Liens

Suite naturelle de l'article en cours. Voir D, G et H.

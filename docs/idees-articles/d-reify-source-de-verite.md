# D. Une seule source de vérité pour ses agents IA (Reify)

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Les consignes d'un agent dérivent dès qu'on les maintient à la main dans plusieurs formats.

## Plan

1. Le symptôme : la même consigne dans trois fichiers (Claude Code, Copilot, Cursor), trois versions.
2. Un YAML source compilé vers chaque outil.
3. « Ce qui est probablement ignoré » : comment Reify l'estime.
4. Les limites : ce qu'un outil ne sait pas exprimer.
5. Lien avec la reproductibilité d'un workflow.

## Matière

- **Connue :** la description du projet (`src/data/projects.json`) : « Compile le contexte de tes agents IA à travers plusieurs outils (Claude Code, Copilot, Cursor) depuis une seule source de vérité YAML. Analyse ce qui est présent, ce qui manque, et ce qui est probablement ignoré. »
- **À vous :** le retour d'expérience sur Reify.
- **À recouper :** les noms de fichiers et les formats de chaque outil, qui changent vite.

## Liens

Prolonge l'article en cours (déterminisme, workflows). Voir K (hooks contre consignes).

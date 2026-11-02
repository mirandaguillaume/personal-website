# 60. llms.txt et Markdown brut : une documentation lisible par un agent

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Une partie de vos lecteurs sont des agents. Les documentations qui s'y adaptent se lisent mieux, et votre site peut faire de même.

## Plan

1. Le constat, vérifié sur deux documentations consultées pendant cette session :
   - la documentation de LangGraph indique en tête de page où récupérer « the complete documentation index » (`/llms.txt`) ;
   - celle de Temporal propose le même index et précise que chaque page est aussi disponible en Markdown brut (en ajoutant `.md` à l'URL).
2. Ce que ça change pour un agent : moins de bruit HTML, un index pour s'orienter.
3. Appliquer l'idée à ce site : exposer ses articles en Markdown, fournir un `llms.txt`.
4. Ce que ça implique : routes Astro supplémentaires, `translationKey` pour relier les langues, brouillons à ne pas exposer (voir H).
5. Ce qu'on y gagne, et ce qu'on y perd (contrôle sur la présentation).

## Matière

- **Vérifiée :** les deux observations ci-dessus.
- **À recouper :** l'origine et le statut du format `llms.txt` avant d'écrire une ligne dessus.

## Liens

Voir H, B et 54.

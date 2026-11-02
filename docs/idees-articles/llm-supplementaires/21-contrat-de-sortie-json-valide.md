# 21. Le contrat de sortie : faire répondre un LLM en JSON valide

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Une sortie « du texte » ne se vérifie pas ; une sortie qui valide un schéma, si.

## Plan

1. L'échec typique : le JSON presque valide.
2. Valider côté code avec un schéma. Ce site le fait déjà pour ses articles avec Zod (`src/content.config.ts`) : même idée, autre source.
3. Que faire en cas d'échec : retry borné, réparation, abandon explicite.
4. Les sorties structurées natives des API : ce qu'elles garantissent et ne garantissent pas.
5. Un contrat entre chaque étape d'un workflow.

## Matière

- **Réelle :** le schéma Zod du site comme exemple de contrat déterministe.
- **À recouper :** la documentation des sorties structurées du fournisseur utilisé, avant toute affirmation sur ses garanties.

## Liens

Développe le besoin n° 2 de l'article en cours. Voir 39.

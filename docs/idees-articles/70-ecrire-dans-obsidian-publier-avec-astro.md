# 70. Écrire dans Obsidian, publier avec Astro : ce qui ne passe pas

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Un éditeur de notes et un site statique ne parlent pas la même version de Markdown. La différence se règle à la frontière, avec des contrôles.

## Faits vérifiés dans le dépôt

- Le build refuse un article publié qui contient `[[`, `![[`, `%%` ou `> [!` dans le corps (hors blocs de code). Ce sont les syntaxes d'Obsidian : liens internes, intégrations, commentaires, encarts.
- Les brouillons échappent à ce contrôle, car « une note en cours de rédaction contient légitimement de la syntaxe Obsidian ».
- Le plan « durcissement de la validation » prévoit « le retrait du code et la détection des résidus Obsidian » : les blocs de code sont retirés avant les contrôles, pour qu'un exemple de syntaxe dans un bloc de code ne déclenche pas de faux positif.
- Une règle CSS (`img { max-width: 100%; height: auto; }`) existe parce que, selon le plan, « les images arriveront d'Obsidian à leur taille d'origine ».
- Un titre de niveau 1 en tête du corps est refusé (le titre vient du frontmatter).

## Plan

1. Le flux de travail : on rédige dans Obsidian, on copie dans le dépôt (à vous : comment, exactement).
2. Ce qui ne passe pas : les quatre syntaxes ci-dessus, les images, le titre de niveau 1.
3. La solution : le build comme douane, et les brouillons comme zone franche.
4. Le piège des blocs de code : pourquoi on les retire avant de chercher les résidus.
5. Ce qu'un script de conversion pourrait automatiser, et ce qu'il vaut mieux laisser échouer bruyamment.

## Matière

- **Réelle :** README, plan 2, `src/content/article-validation.ts`.
- **À vous :** votre flux réel entre Obsidian et le dépôt.

## Liens

Voir A et 39.

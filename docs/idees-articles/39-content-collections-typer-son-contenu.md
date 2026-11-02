# 39. Les content collections d'Astro : typer son contenu

**Statut :** idée, non rédigée. **Effort :** faible à moyen.

**Thèse.** Du Markdown n'a pas à rester du texte libre : un schéma attrape les erreurs avant le navigateur.

## Faits vérifiés dans `src/content.config.ts`

- Quatre collections : `blogFr`, `blogEn`, `projects`, `experience`.
- Le schéma d'un article valide `title` et `description` (non vides), `pubDate`, `tags`, `translationKey` et `draft` (faux par défaut).
- `pubDate` doit être postérieure au 2000-01-01. Le commentaire du code explique pourquoi : un `pubDate:` vide vaut `null` en YAML, que `z.coerce.date()` transforme en 1970.
- `tags` et `translationKey` doivent être en kebab minuscule.
- La spec distingue deux niveaux : le schéma Zod (par article) et une validation d'ensemble (`src/content/article-validation.ts`) pour ce qui se joue entre articles, comme l'unicité de `translationKey`.

## Plan

1. Pourquoi typer du Markdown.
2. Le schéma d'un article, champ par champ.
3. Le piège de la date vide qui devient 1970.
4. Deux niveaux : schéma par article, validation d'ensemble.
5. Ce qu'un schéma ne peut pas vérifier.

## À recouper

La documentation Astro des content collections et le comportement de `z.coerce.date()` face à `null`, avant d'expliquer le mécanisme.

## Liens

Voir A et B.

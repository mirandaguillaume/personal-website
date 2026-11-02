# 66. Traiter les dépréciations tant que ce ne sont que des hints

**Statut :** idée, non rédigée. **Effort :** faible.

**Thèse.** Un avertissement de dépréciation coûte quelques minutes aujourd'hui et peut coûter une migration entière le jour où l'API disparaît.

## Faits vérifiés dans le dépôt (PR #23, « Migration des APIs dépréciées et réécriture du README »)

- Le message du commit parle de « trois hints de dépréciation supprimés ».
- Dans `eslint.config.mjs` : `tseslint.config(...)` avec `{ ignores: [...] }` est devenu `defineConfig([...])` importé de `eslint/config`, avec `globalIgnores([...])`.
- Dans `src/content.config.ts` : `z.string().url().optional()` est devenu `z.url().optional()` pour `url` et `repoUrl`.
- Le dépôt tourne sur des versions récentes : Astro `^7.2.3`, ESLint `^10.8.1`, TypeScript `^6.0.3`, Vitest `^5.0.2`, Node `>=22.12.0`.

## Plan

1. Le contexte : un projet neuf sur des versions toutes récentes, et déjà des dépréciations.
2. Où elles apparaissent : l'éditeur (hints), pas la CI. Ce qui explique pourquoi on les ignore.
3. Les trois cas du dépôt, avant et après.
4. Une méthode : traiter chaque hint le jour où il apparaît, ou le noter avec une échéance.
5. Ce qu'on rendrait visible en CI, si on voulait que ça casse plus tôt.

## Matière

- **Réelle :** le diff de la PR #23.
- **À recouper :** les notes de version de chaque outil pour expliquer pourquoi l'ancienne forme est dépréciée. Je n'ai lu que le diff.

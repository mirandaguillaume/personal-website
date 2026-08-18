# Site personnel

Blog et vitrine professionnelle bilingue (FR/EN), construit avec [Astro](https://astro.build).

## Développement local

```bash
npm install
npm run dev
```

## Vérifications

```bash
npm run check         # types + validation des content collections
npm run lint           # ESLint
npm run format:check   # Prettier
npm run build           # build de production dans dist/
```

## Déploiement (Vercel)

1. Pousser ce dépôt sur GitHub (ou GitLab/Bitbucket).
2. Sur [vercel.com](https://vercel.com), importer le dépôt — Vercel détecte automatiquement Astro (aucune configuration nécessaire, sortie statique).
3. Chaque push sur `main` déploie en production ; chaque branche/pull request obtient une preview automatique.
4. Pour un domaine personnalisé : Vercel → Project Settings → Domains.

## Contenu à personnaliser

- `src/pages/index.astro` et `src/pages/en/index.astro` : remplacer `[Ton Nom]` / `[Your Name]` et le texte de présentation.
- `src/pages/about.astro` et `src/pages/en/about.astro` : bio réelle.
- `src/pages/contact.astro` et `src/pages/en/contact.astro` : vrais liens de contact.
- `src/data/projects.json`, `src/data/experience.json` : projets et expérience réels.
- `src/content/blog/fr/`, `src/content/blog/en/` : articles réels (les fichiers d'exemple peuvent être supprimés).

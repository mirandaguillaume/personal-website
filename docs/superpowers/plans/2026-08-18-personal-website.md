# Site personnel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire un site personnel bilingue (FR/EN) avec Astro : blog en Markdown, portfolio de projets, CV, page à propos et contact, déployable gratuitement et automatiquement sur Vercel.

**Architecture:** Site 100% statique généré par Astro (aucun backend, aucune base de données). Le contenu du blog vit dans des content collections Markdown séparées par langue (`blogFr`, `blogEn`) ; les projets et l'expérience professionnelle vivent dans des content collections de type données (JSON) avec des champs texte dupliqués par langue à l'intérieur d'une même entrée. Le routing i18n natif d'Astro sert le français à la racine (`/`) et l'anglais sous `/en/`.

**Tech Stack:** Astro 7, TypeScript strict, content collections (loaders `glob`/`file`), i18n natif d'Astro (`astro:i18n`), ESLint (`eslint-plugin-astro` + `typescript-eslint`), Prettier (`prettier-plugin-astro`), déploiement Vercel (zero-config, sortie statique).

**Spec:** `docs/superpowers/specs/2026-08-18-personal-website-design.md`

## Global Constraints

- Node.js >= 22.12.0 (requis par Astro 7 — voir `package.json` généré par le scaffold).
- TypeScript strict via `astro/tsconfigs/strict` (défaut du scaffold Astro, ne pas relâcher).
- Locale par défaut : français, non préfixé (`/...`). Anglais préfixé (`/en/...`). Configuré via `i18n.routing.prefixDefaultLocale: false` dans `astro.config.mjs`.
- Site 100% statique — pas de serveur, pas d'adaptateur SSR, pas de base de données. Toute fonctionnalité qui nécessiterait un backend (formulaire de contact avec envoi serveur, recherche côté serveur) est hors scope.
- Chaque page existe en deux fichiers distincts (un sous `src/pages/`, un sous `src/pages/en/`) — Astro ne duplique pas automatiquement les pages entre locales, c'est une contrainte du routing fichier d'Astro, pas un choix de conception à remettre en cause.
- Les tags (articles de blog) doivent être des slugs URL-safe (minuscules, sans espace ni accent) car ils deviennent des segments d'URL (`/blog/tags/<tag>/`).
- Pas de suite de tests de composants dédiée (décision de la spec, YAGNI). La validation se fait via : schémas Zod des content collections (erreurs de contenu détectées au build), `astro check` (erreurs de types), `eslint .` (qualité de code), et inspection du HTML généré dans `dist/`.
- Le sélecteur de langue renvoie vers la page d'accueil de l'autre langue (et non vers l'équivalent exact de la page courante) — décision assumée pour rester simple, car un article de blog n'a pas toujours d'équivalent traduit (voir spec, section "Erreurs et cas limites").
- Le contenu réel (bio, CV, description des projets, articles) est hors scope de ce plan. Chaque tâche qui crée une page de contenu inclut un texte d'exemple explicitement identifié comme à remplacer — ce n'est pas un espace réservé de code, c'est du contenu à éditer après implémentation.

---

### Task 1: Scaffold du projet Astro

**Files:**

- Create: tout le projet Astro à la racine (`package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `public/favicon.svg`, `src/pages/index.astro`) via le CLI officiel — pas de code à écrire à la main dans cette tâche.

**Interfaces:**

- Produces: un projet Astro fonctionnel (`npm run dev`, `npm run build`) avec TypeScript strict (`tsconfig.json` → `"extends": "astro/tsconfigs/strict"`), consommé par toutes les tâches suivantes.

- [ ] **Step 1: Scaffolder le projet dans le dossier courant**

Le dépôt git existe déjà (spec commitée en amont) — ne pas laisser le CLI ré-initialiser git.

Run: `npm create astro@latest . -- --template minimal --install --no-git --skip-houston --no-ai --yes`

- [ ] **Step 2: Vérifier la structure générée**

Run: `ls -la && cat package.json && cat tsconfig.json`
Expected: `package.json` contient `"engines": { "node": ">=22.12.0" }` et `"astro"` en dépendance ; `tsconfig.json` contient `"extends": "astro/tsconfigs/strict"`.

- [ ] **Step 3: Vérifier que le build fonctionne**

Run: `npm run build`
Expected: `dist/index.html` généré, message `1 page(s) built` (ou plus), aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Scaffold du projet Astro"
```

---

### Task 2: Outillage qualité — ESLint + Prettier

**Files:**

- Create: `eslint.config.mjs`
- Create: `.prettierrc.mjs`
- Create: `.prettierignore`
- Modify: `package.json` (scripts + devDependencies)

**Interfaces:**

- Consumes: le projet scaffoldé par la Task 1.
- Produces: scripts npm `check`, `lint`, `format`, `format:check` utilisés dans le processus de vérification de toutes les tâches suivantes.

- [ ] **Step 1: Installer les dépendances de dev**

Run: `npm install --save-dev eslint eslint-plugin-astro typescript-eslint prettier prettier-plugin-astro @astrojs/check typescript`

- [ ] **Step 2: Écrire la configuration ESLint**

Créer `eslint.config.mjs` :

```js
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', '.astro/'] },
  tseslint.configs.recommended,
  eslintPluginAstro.configs.recommended,
);
```

- [ ] **Step 3: Écrire la configuration Prettier**

Créer `.prettierrc.mjs` :

```js
export default {
  plugins: ['prettier-plugin-astro'],
  singleQuote: true,
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
```

Créer `.prettierignore` :

```
dist/
.astro/
```

- [ ] **Step 4: Ajouter les scripts npm**

Modifier `package.json`, section `scripts` :

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- [ ] **Step 5: Vérifier que le lint et le format tournent sans erreur**

Run: `npm run lint`
Expected: aucune sortie, code de sortie 0.

Run: `npm run format`
Expected: fichiers reformatés sans erreur (peut modifier `src/pages/index.astro` généré par le scaffold — c'est attendu).

Run: `npm run check`
Expected: `Result (N files): 0 errors, 0 warnings`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Ajout de l'outillage ESLint et Prettier"
```

---

### Task 3: i18n, dictionnaire de traduction et layout de base

**Files:**

- Modify: `astro.config.mjs`
- Create: `src/i18n/ui.ts`
- Create: `src/i18n/utils.ts`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/LanguageSwitcher.astro`
- Modify: `src/pages/index.astro` (remplace le contenu du scaffold par un placeholder minimal — sera remplacé par la vraie page d'accueil en Task 12)
- Create: `src/pages/en/index.astro` (placeholder minimal, même raison)

**Interfaces:**

- Produces:
  - `Lang` type (`'fr' | 'en'`), exporté depuis `src/i18n/ui.ts` — utilisé par tous les composants et pages des tâches suivantes.
  - `useTranslations(lang: Lang): (key) => string` et `useTranslatedPath(lang: Lang): (path: string) => string`, exportés depuis `src/i18n/utils.ts`.
  - `BaseLayout` avec props `{ lang: Lang; title: string; description: string }` et un `<slot />` — layout de base pour toutes les pages des tâches suivantes.

- [ ] **Step 1: Configurer le routing i18n**

Modifier `astro.config.mjs` :

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

- [ ] **Step 2: Écrire le dictionnaire de traduction**

Créer `src/i18n/ui.ts` :

```ts
export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export const defaultLang = 'fr';
export const showDefaultLang = false;

export type Lang = keyof typeof languages;

export const ui = {
  fr: {
    'nav.home': 'Accueil',
    'nav.blog': 'Articles',
    'nav.about': 'À propos',
    'nav.projects': 'Projets',
    'nav.cv': 'CV',
    'nav.contact': 'Contact',
    'footer.rights': 'Tous droits réservés.',
  },
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.cv': 'Resume',
    'nav.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
  },
} as const;
```

- [ ] **Step 3: Écrire les fonctions utilitaires de traduction**

Créer `src/i18n/utils.ts` :

```ts
import { ui, defaultLang, showDefaultLang } from './ui';
import type { Lang } from './ui';

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string) {
    return !showDefaultLang && lang === defaultLang ? path : `/${lang}${path}`;
  };
}
```

- [ ] **Step 4: Écrire la feuille de style globale**

Créer `src/styles/global.css` :

```css
:root {
  color-scheme: light;
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-muted: #5f5f5f;
  --color-accent: #2148c0;
  --color-border: #e2e2e2;
  --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --content-width: 42rem;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}

.site-header {
  border-bottom: 1px solid var(--color-border);
}

.site-nav {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.site-nav__brand {
  font-weight: 700;
  text-decoration: none;
  color: var(--color-text);
}

.site-nav__links {
  list-style: none;
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
  flex: 1;
}

.site-nav__links a {
  color: var(--color-text);
  text-decoration: none;
}

.site-nav__links a:hover {
  color: var(--color-accent);
}

.language-switcher {
  list-style: none;
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.language-switcher a[aria-current='true'] {
  font-weight: 700;
  color: var(--color-accent);
}

.site-main {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 2rem 1rem;
}

.site-footer {
  border-top: 1px solid var(--color-border);
  margin-top: 3rem;
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--color-muted);
}

.article-card,
.project-card {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.article-card__date {
  color: var(--color-muted);
  font-size: 0.85rem;
  margin: 0 0 0.25rem;
}

.tag-pill {
  display: inline-block;
  font-size: 0.8rem;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: #eef1fb;
  color: var(--color-accent);
  text-decoration: none;
  margin-right: 0.4rem;
}

.timeline-item {
  border-left: 2px solid var(--color-border);
  padding-left: 1rem;
  margin-bottom: 1.5rem;
}
```

Note : direction visuelle fonctionnelle de base uniquement. Un passage de design plus poussé (skill `frontend-design`) est prévu après l'implémentation structurelle, conformément à la spec.

- [ ] **Step 5: Écrire le composant LanguageSwitcher**

Créer `src/components/LanguageSwitcher.astro` :

```astro
---
import { languages, defaultLang, showDefaultLang } from '../i18n/ui';
import type { Lang } from '../i18n/ui';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;

function homeUrlFor(target: Lang) {
  return !showDefaultLang && target === defaultLang ? '/' : `/${target}/`;
}
---

<ul class="language-switcher">
  {
    Object.entries(languages).map(([code, label]) => (
      <li>
        <a
          href={homeUrlFor(code as Lang)}
          aria-current={code === lang ? 'true' : undefined}
        >
          {label}
        </a>
      </li>
    ))
  }
</ul>
```

- [ ] **Step 6: Écrire les composants Header et Footer**

Créer `src/components/Header.astro` :

```astro
---
import { useTranslations, useTranslatedPath } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
import LanguageSwitcher from './LanguageSwitcher.astro';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const t = useTranslations(lang);
const translatePath = useTranslatedPath(lang);
---

<header class="site-header">
  <nav class="site-nav">
    <a class="site-nav__brand" href={translatePath('/')}>{t('nav.home')}</a>
    <ul class="site-nav__links">
      <li><a href={translatePath('/blog')}>{t('nav.blog')}</a></li>
      <li><a href={translatePath('/about')}>{t('nav.about')}</a></li>
      <li><a href={translatePath('/projects')}>{t('nav.projects')}</a></li>
      <li><a href={translatePath('/cv')}>{t('nav.cv')}</a></li>
      <li><a href={translatePath('/contact')}>{t('nav.contact')}</a></li>
    </ul>
    <LanguageSwitcher lang={lang} />
  </nav>
</header>
```

Créer `src/components/Footer.astro` :

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const t = useTranslations(lang);
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <p>&copy; {year} — {t('footer.rights')}</p>
</footer>
```

- [ ] **Step 7: Écrire le layout de base**

Créer `src/layouts/BaseLayout.astro` :

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import type { Lang } from '../i18n/ui';
import '../styles/global.css';

interface Props {
  lang: Lang;
  title: string;
  description: string;
}

const { lang, title, description } = Astro.props;
---

<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <Header lang={lang} />
    <main class="site-main">
      <slot />
    </main>
    <Footer lang={lang} />
  </body>
</html>
```

- [ ] **Step 8: Remplacer les pages d'accueil par un placeholder utilisant le layout**

Remplacer le contenu de `src/pages/index.astro` :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout lang="fr" title="Accueil" description="Site personnel.">
  <h1>Accueil (FR)</h1>
</BaseLayout>
```

Créer `src/pages/en/index.astro` :

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout lang="en" title="Home" description="Personal website.">
  <h1>Home (EN)</h1>
</BaseLayout>
```

- [ ] **Step 9: Vérifier le build et le contenu généré**

Run: `npm run check && npm run build`
Expected : 0 erreur ; `dist/index.html` et `dist/en/index.html` générés.

Run: `grep -o 'Accueil' dist/index.html && grep -o 'Home' dist/en/index.html`
Expected : chaque commande affiche une correspondance (le lien de nav "Accueil"/"Home" est bien présent dans la bonne langue).

Run: `grep -o 'href="/en/"' dist/index.html && grep -o 'href="/"' dist/en/index.html`
Expected : chaque commande affiche une correspondance (le sélecteur de langue pointe bien vers l'autre locale).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Ajout du routing i18n, du dictionnaire de traduction et du layout de base"
```

---

### Task 4: Content collections — blog, projets, expérience

**Files:**

- Create: `src/content.config.ts`
- Create: `src/content/blog/fr/bienvenue-sur-mon-blog.md`
- Create: `src/content/blog/fr/pourquoi-astro.md`
- Create: `src/content/blog/en/hello-world.md`
- Create: `src/data/projects.json`
- Create: `src/data/experience.json`

**Interfaces:**

- Produces: collections `blogFr`, `blogEn` (schéma : `title: string`, `description: string`, `pubDate: Date`, `tags: string[]`), `projects` (schéma : `title: { fr, en }`, `description: { fr, en }`, `tags: string[]`, `url?: string`, `repoUrl?: string`), `experience` (schéma : `role: { fr, en }`, `organization: string`, `startDate: Date`, `endDate?: Date`, `description: { fr, en }`). Consommées via `getCollection('blogFr' | 'blogEn' | 'projects' | 'experience')` dans toutes les pages des tâches suivantes.

- [ ] **Step 1: Définir les collections avec leurs schémas Zod**

Créer `src/content.config.ts` :

```ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()),
});

const blogFr = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog/fr' }),
  schema: blogSchema,
});

const blogEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog/en' }),
  schema: blogSchema,
});

const localizedText = z.object({ fr: z.string(), en: z.string() });

const projects = defineCollection({
  loader: file('src/data/projects.json'),
  schema: z.object({
    title: localizedText,
    description: localizedText,
    tags: z.array(z.string()),
    url: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
  }),
});

const experience = defineCollection({
  loader: file('src/data/experience.json'),
  schema: z.object({
    role: localizedText,
    organization: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    description: localizedText,
  }),
});

export const collections = { blogFr, blogEn, projects, experience };
```

- [ ] **Step 2: Ajouter des articles de blog d'exemple**

Créer `src/content/blog/fr/bienvenue-sur-mon-blog.md` :

```md
---
title: 'Bienvenue sur mon blog'
description: "Pourquoi j'ai créé ce site et ce que vous y trouverez."
pubDate: 2026-08-01
tags: ['carriere']
---

Ceci est un article d'exemple. Remplace ce contenu par ton premier vrai article.
```

Créer `src/content/blog/fr/pourquoi-astro.md` :

```md
---
title: "Pourquoi j'ai choisi Astro pour ce site"
description: "Retour d'expérience sur le choix technique de ce blog."
pubDate: 2026-08-10
tags: ['astro', 'typescript']
---

Ceci est un article d'exemple. Remplace ce contenu par ton propre retour d'expérience.
```

Créer `src/content/blog/en/hello-world.md` (volontairement un seul article en anglais, pour vérifier qu'un article sans équivalent traduit ne casse rien — voir spec) :

```md
---
title: 'Hello, world'
description: "Why I built this site and what you'll find here."
pubDate: 2026-08-01
tags: ['career']
---

This is a sample post. Replace this content with your first real article.
```

- [ ] **Step 3: Vérifier que le schéma rejette un contenu invalide (test de la validation)**

Créer temporairement un fichier invalide pour vérifier que la validation Zod fonctionne :

Run: `printf -- '---\ntitle: "Invalide"\n---\n\nManque description, pubDate et tags.\n' > src/content/blog/fr/invalide.md`

Run: `npm run build`
Expected: le build échoue avec une erreur `[InvalidContentEntryDataError]` mentionnant les champs manquants (`pubDate`, `tags`, `description`).

- [ ] **Step 4: Supprimer le fichier invalide**

Run: `rm src/content/blog/fr/invalide.md`

- [ ] **Step 5: Ajouter les données de projets**

Créer `src/data/projects.json` :

```json
[
  {
    "id": "site-personnel",
    "title": { "fr": "Site personnel", "en": "Personal website" },
    "description": {
      "fr": "Ce site : blog et vitrine professionnelle construits avec Astro.",
      "en": "This site: a blog and professional showcase built with Astro."
    },
    "tags": ["astro", "typescript"],
    "repoUrl": "https://github.com/exemple/site-personnel"
  },
  {
    "id": "projet-exemple",
    "title": { "fr": "Projet exemple", "en": "Example project" },
    "description": {
      "fr": "Décris ici un projet marquant de ton parcours.",
      "en": "Describe a notable project from your background here."
    },
    "tags": ["react", "node"],
    "repoUrl": "https://github.com/exemple/projet-exemple"
  }
]
```

- [ ] **Step 6: Ajouter les données d'expérience**

Créer `src/data/experience.json` :

```json
[
  {
    "id": "poste-actuel",
    "role": { "fr": "Développeur full-stack", "en": "Full-stack developer" },
    "organization": "Entreprise Exemple",
    "startDate": "2024-01-01",
    "description": {
      "fr": "Décris ici tes responsabilités et réalisations principales.",
      "en": "Describe your main responsibilities and achievements here."
    }
  },
  {
    "id": "poste-precedent",
    "role": { "fr": "Développeur web", "en": "Web developer" },
    "organization": "Ancienne Entreprise",
    "startDate": "2021-06-01",
    "endDate": "2023-12-31",
    "description": {
      "fr": "Décris ici tes responsabilités et réalisations principales.",
      "en": "Describe your main responsibilities and achievements here."
    }
  }
]
```

- [ ] **Step 7: Vérifier que le build passe avec les données valides**

Run: `npm run check && npm run build`
Expected: 0 erreur.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Ajout des content collections (blog, projets, expérience) et données d'exemple"
```

---

### Task 5: Composants TagPill et ArticleCard

**Files:**

- Create: `src/components/TagPill.astro`
- Create: `src/components/ArticleCard.astro`

**Interfaces:**

- Consumes: `Lang` (Task 3).
- Produces: `TagPill` (props `{ tag: string; href: string }`) et `ArticleCard` (props `{ title: string; description: string; pubDate: Date; tags: string[]; href: string; lang: Lang }`) — utilisés par les pages de blog (Task 6), les pages de tags (Task 7) et la page d'accueil (Task 12).

- [ ] **Step 1: Écrire le composant TagPill**

Créer `src/components/TagPill.astro` :

```astro
---
interface Props {
  tag: string;
  href: string;
}

const { tag, href } = Astro.props;
---

<a class="tag-pill" href={href}>{tag}</a>
```

- [ ] **Step 2: Écrire le composant ArticleCard**

Créer `src/components/ArticleCard.astro` :

```astro
---
import TagPill from './TagPill.astro';
import type { Lang } from '../i18n/ui';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
  href: string;
  lang: Lang;
}

const { title, description, pubDate, tags, href, lang } = Astro.props;
const formattedDate = pubDate.toLocaleDateString(
  lang === 'fr' ? 'fr-FR' : 'en-US',
  {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
);
const tagsBase = lang === 'fr' ? '/blog/tags' : '/en/blog/tags';
---

<article class="article-card">
  <p class="article-card__date">{formattedDate}</p>
  <h2 class="article-card__title"><a href={href}>{title}</a></h2>
  <p>{description}</p>
  <div>
    {tags.map((tag) => <TagPill tag={tag} href={`${tagsBase}/${tag}/`} />)}
  </div>
</article>
```

- [ ] **Step 3: Vérifier les types et le lint**

Run: `npm run check && npm run lint`
Expected: 0 erreur (ces composants ne sont pas encore utilisés par une page, donc rien à build/tester visuellement à ce stade — la vérification porte sur la validité TypeScript et le style de code).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Ajout des composants TagPill et ArticleCard"
```

---

### Task 6: Pages de liste du blog

**Files:**

- Create: `src/pages/blog/index.astro`
- Create: `src/pages/en/blog/index.astro`

**Interfaces:**

- Consumes: `blogFr`/`blogEn` (Task 4), `ArticleCard` (Task 5), `BaseLayout` (Task 3).

- [ ] **Step 1: Écrire la page de liste du blog (FR)**

Créer `src/pages/blog/index.astro` :

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArticleCard from '../../components/ArticleCard.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blogFr')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);
---

<BaseLayout
  lang="fr"
  title="Articles"
  description="Liste des articles du blog."
>
  <h1>Articles</h1>
  {
    posts.map((post) => (
      <ArticleCard
        title={post.data.title}
        description={post.data.description}
        pubDate={post.data.pubDate}
        tags={post.data.tags}
        href={`/blog/${post.id}/`}
        lang="fr"
      />
    ))
  }
</BaseLayout>
```

- [ ] **Step 2: Écrire la page de liste du blog (EN)**

Créer `src/pages/en/blog/index.astro` :

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import ArticleCard from '../../../components/ArticleCard.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blogEn')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);
---

<BaseLayout lang="en" title="Blog" description="List of blog articles.">
  <h1>Blog</h1>
  {
    posts.map((post) => (
      <ArticleCard
        title={post.data.title}
        description={post.data.description}
        pubDate={post.data.pubDate}
        tags={post.data.tags}
        href={`/en/blog/${post.id}/`}
        lang="en"
      />
    ))
  }
</BaseLayout>
```

- [ ] **Step 3: Vérifier le contenu généré**

Run: `npm run check && npm run build`
Expected: 0 erreur.

Run: `grep -o 'Bienvenue sur mon blog' dist/blog/index.html && grep -o 'Pourquoi' dist/blog/index.html`
Expected: les deux articles français apparaissent dans la liste FR.

Run: `grep -o 'Hello, world' dist/en/blog/index.html`
Expected: l'article anglais apparaît dans la liste EN.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Ajout des pages de liste du blog"
```

---

### Task 7: Page article individuel (route dynamique)

**Files:**

- Create: `src/layouts/ArticleLayout.astro`
- Create: `src/pages/blog/[id].astro`
- Create: `src/pages/en/blog/[id].astro`

**Interfaces:**

- Consumes: `blogFr`/`blogEn` (Task 4), `TagPill` (Task 5), `BaseLayout` (Task 3).
- Produces: `ArticleLayout` avec props `{ post: CollectionEntry<'blogFr'> | CollectionEntry<'blogEn'>; lang: Lang }`.

- [ ] **Step 1: Écrire le layout d'article partagé**

Créer `src/layouts/ArticleLayout.astro` :

```astro
---
import BaseLayout from './BaseLayout.astro';
import TagPill from '../components/TagPill.astro';
import type { Lang } from '../i18n/ui';
import type { CollectionEntry } from 'astro:content';
import { render } from 'astro:content';

interface Props {
  post: CollectionEntry<'blogFr'> | CollectionEntry<'blogEn'>;
  lang: Lang;
}

const { post, lang } = Astro.props;
const { Content } = await render(post);
const formattedDate = post.data.pubDate.toLocaleDateString(
  lang === 'fr' ? 'fr-FR' : 'en-US',
  {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
);
const tagsBase = lang === 'fr' ? '/blog/tags' : '/en/blog/tags';
---

<BaseLayout
  lang={lang}
  title={post.data.title}
  description={post.data.description}
>
  <article>
    <p class="article-card__date">{formattedDate}</p>
    <h1>{post.data.title}</h1>
    <div>
      {
        post.data.tags.map((tag) => (
          <TagPill tag={tag} href={`${tagsBase}/${tag}/`} />
        ))
      }
    </div>
    <Content />
  </article>
</BaseLayout>
```

- [ ] **Step 2: Écrire la route dynamique FR**

Créer `src/pages/blog/[id].astro` :

```astro
---
import { getCollection } from 'astro:content';
import ArticleLayout from '../../layouts/ArticleLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blogFr');
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
---

<ArticleLayout post={post} lang="fr" />
```

- [ ] **Step 3: Écrire la route dynamique EN**

Créer `src/pages/en/blog/[id].astro` :

```astro
---
import { getCollection } from 'astro:content';
import ArticleLayout from '../../../layouts/ArticleLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blogEn');
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
---

<ArticleLayout post={post} lang="en" />
```

- [ ] **Step 4: Vérifier les pages générées**

Run: `npm run check && npm run build`
Expected: 0 erreur ; `dist/blog/bienvenue-sur-mon-blog/index.html`, `dist/blog/pourquoi-astro/index.html` et `dist/en/blog/hello-world/index.html` générés.

Run: `grep -o "Remplace ce contenu par ton premier vrai article" dist/blog/bienvenue-sur-mon-blog/index.html`
Expected: une correspondance (le corps Markdown est bien rendu).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Ajout des pages d'article individuel"
```

---

### Task 8: Pages de filtrage par tag

**Files:**

- Create: `src/pages/blog/tags/[tag].astro`
- Create: `src/pages/en/blog/tags/[tag].astro`

**Interfaces:**

- Consumes: `blogFr`/`blogEn` (Task 4), `ArticleCard` (Task 5), `BaseLayout` (Task 3). Doit rester cohérent avec les URLs `href` générées par `ArticleCard`/`ArticleLayout` en Task 5/7 (`/blog/tags/<tag>/` et `/en/blog/tags/<tag>/`).

- [ ] **Step 1: Écrire la page de tag FR**

Créer `src/pages/blog/tags/[tag].astro` :

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import ArticleCard from '../../../components/ArticleCard.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blogFr');
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))];
  return tags.map((tag) => ({
    params: { tag },
    props: {
      posts: posts.filter((post) => post.data.tags.includes(tag)),
    },
  }));
}

const { tag } = Astro.params;
const { posts } = Astro.props;
---

<BaseLayout
  lang="fr"
  title={`Articles : ${tag}`}
  description={`Articles tagués ${tag}.`}
>
  <h1>Articles : {tag}</h1>
  {
    posts.map((post) => (
      <ArticleCard
        title={post.data.title}
        description={post.data.description}
        pubDate={post.data.pubDate}
        tags={post.data.tags}
        href={`/blog/${post.id}/`}
        lang="fr"
      />
    ))
  }
</BaseLayout>
```

- [ ] **Step 2: Écrire la page de tag EN**

Créer `src/pages/en/blog/tags/[tag].astro` :

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import ArticleCard from '../../../../components/ArticleCard.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blogEn');
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))];
  return tags.map((tag) => ({
    params: { tag },
    props: {
      posts: posts.filter((post) => post.data.tags.includes(tag)),
    },
  }));
}

const { tag } = Astro.params;
const { posts } = Astro.props;
---

<BaseLayout
  lang="en"
  title={`Articles tagged ${tag}`}
  description={`Articles tagged ${tag}.`}
>
  <h1>Articles tagged: {tag}</h1>
  {
    posts.map((post) => (
      <ArticleCard
        title={post.data.title}
        description={post.data.description}
        pubDate={post.data.pubDate}
        tags={post.data.tags}
        href={`/en/blog/${post.id}/`}
        lang="en"
      />
    ))
  }
</BaseLayout>
```

- [ ] **Step 3: Vérifier les pages de tag générées**

Run: `npm run check && npm run build`
Expected: 0 erreur ; `dist/blog/tags/astro/index.html`, `dist/blog/tags/typescript/index.html`, `dist/blog/tags/carriere/index.html`, `dist/en/blog/tags/career/index.html` générés.

Run: `grep -o 'Pourquoi' dist/blog/tags/astro/index.html`
Expected: une correspondance ; l'article "Bienvenue sur mon blog" (tag `carriere` uniquement) ne doit PAS apparaître sur la page du tag `astro`.

Run: `grep -c 'article-card__title' dist/blog/tags/carriere/index.html`
Expected: `1` (un seul article a le tag `carriere`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Ajout des pages de filtrage par tag"
```

---

### Task 9: Page Projets

**Files:**

- Create: `src/components/ProjectCard.astro`
- Create: `src/pages/projects.astro`
- Create: `src/pages/en/projects.astro`

**Interfaces:**

- Consumes: collection `projects` (Task 4), `BaseLayout` (Task 3), `Lang` (Task 3).
- Produces: `ProjectCard` avec props `{ title: string; description: string; tags: string[]; lang: Lang; url?: string; repoUrl?: string }`.

- [ ] **Step 1: Écrire le composant ProjectCard**

Créer `src/components/ProjectCard.astro` :

```astro
---
import type { Lang } from '../i18n/ui';

interface Props {
  title: string;
  description: string;
  tags: string[];
  lang: Lang;
  url?: string;
  repoUrl?: string;
}

const { title, description, tags, lang, url, repoUrl } = Astro.props;
const codeLabel = lang === 'fr' ? 'Code source' : 'Source code';
const demoLabel = lang === 'fr' ? 'Voir le projet' : 'View project';
---

<article class="project-card">
  <h2 class="project-card__title">{title}</h2>
  <p>{description}</p>
  <p>{tags.join(' · ')}</p>
  <p>
    {url && <a href={url}>{demoLabel}</a>}
    {url && repoUrl && ' · '}
    {repoUrl && <a href={repoUrl}>{codeLabel}</a>}
  </p>
</article>
```

- [ ] **Step 2: Écrire la page Projets FR**

Créer `src/pages/projects.astro` :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const projects = await getCollection('projects');
---

<BaseLayout
  lang="fr"
  title="Projets"
  description="Une sélection de mes projets."
>
  <h1>Projets</h1>
  {
    projects.map((project) => (
      <ProjectCard
        title={project.data.title.fr}
        description={project.data.description.fr}
        tags={project.data.tags}
        lang="fr"
        url={project.data.url}
        repoUrl={project.data.repoUrl}
      />
    ))
  }
</BaseLayout>
```

- [ ] **Step 3: Écrire la page Projets EN**

Créer `src/pages/en/projects.astro` :

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const projects = await getCollection('projects');
---

<BaseLayout
  lang="en"
  title="Projects"
  description="A selection of my projects."
>
  <h1>Projects</h1>
  {
    projects.map((project) => (
      <ProjectCard
        title={project.data.title.en}
        description={project.data.description.en}
        tags={project.data.tags}
        lang="en"
        url={project.data.url}
        repoUrl={project.data.repoUrl}
      />
    ))
  }
</BaseLayout>
```

- [ ] **Step 4: Vérifier le contenu généré**

Run: `npm run check && npm run build`
Expected: 0 erreur.

Run: `grep -o 'Site personnel' dist/projects/index.html && grep -o 'Personal website' dist/en/projects/index.html`
Expected: chaque commande affiche une correspondance.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Ajout de la page Projets"
```

---

### Task 10: Page CV

**Files:**

- Create: `src/components/TimelineItem.astro`
- Create: `src/pages/cv.astro`
- Create: `src/pages/en/cv.astro`

**Interfaces:**

- Consumes: collection `experience` (Task 4), `BaseLayout` (Task 3), `Lang` (Task 3).
- Produces: `TimelineItem` avec props `{ role: string; organization: string; startDate: Date; endDate?: Date; description: string; lang: Lang }`.

- [ ] **Step 1: Écrire le composant TimelineItem**

Créer `src/components/TimelineItem.astro` :

```astro
---
import type { Lang } from '../i18n/ui';

interface Props {
  role: string;
  organization: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  lang: Lang;
}

const { role, organization, startDate, endDate, description, lang } =
  Astro.props;
const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
const formatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
};
const startLabel = startDate.toLocaleDateString(locale, formatOptions);
const endLabel = endDate
  ? endDate.toLocaleDateString(locale, formatOptions)
  : lang === 'fr'
    ? "Aujourd'hui"
    : 'Present';
---

<div class="timeline-item">
  <h3>{role} — {organization}</h3>
  <p class="article-card__date">{startLabel} – {endLabel}</p>
  <p>{description}</p>
</div>
```

- [ ] **Step 2: Écrire la page CV FR**

Créer `src/pages/cv.astro` :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TimelineItem from '../components/TimelineItem.astro';
import { getCollection } from 'astro:content';

const experiences = (await getCollection('experience')).sort(
  (a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf(),
);
---

<BaseLayout lang="fr" title="CV" description="Mon expérience professionnelle.">
  <h1>Expérience</h1>
  {
    experiences.map((experience) => (
      <TimelineItem
        role={experience.data.role.fr}
        organization={experience.data.organization}
        startDate={experience.data.startDate}
        endDate={experience.data.endDate}
        description={experience.data.description.fr}
        lang="fr"
      />
    ))
  }
</BaseLayout>
```

- [ ] **Step 3: Écrire la page CV EN**

Créer `src/pages/en/cv.astro` :

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TimelineItem from '../../components/TimelineItem.astro';
import { getCollection } from 'astro:content';

const experiences = (await getCollection('experience')).sort(
  (a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf(),
);
---

<BaseLayout lang="en" title="Resume" description="My professional experience.">
  <h1>Experience</h1>
  {
    experiences.map((experience) => (
      <TimelineItem
        role={experience.data.role.en}
        organization={experience.data.organization}
        startDate={experience.data.startDate}
        endDate={experience.data.endDate}
        description={experience.data.description.en}
        lang="en"
      />
    ))
  }
</BaseLayout>
```

- [ ] **Step 4: Vérifier le contenu généré**

Run: `npm run check && npm run build`
Expected: 0 erreur.

Run: `grep -o 'Développeur full-stack' dist/cv/index.html && grep -o 'Full-stack developer' dist/en/cv/index.html`
Expected: chaque commande affiche une correspondance.

Run: `grep -o "Aujourd" dist/cv/index.html && grep -o 'Present' dist/en/cv/index.html`
Expected: chaque commande affiche une correspondance (le poste actuel, sans `endDate`, affiche bien "Aujourd'hui"/"Present").

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Ajout de la page CV"
```

---

### Task 11: Pages À propos et Contact

**Files:**

- Create: `src/pages/about.astro`
- Create: `src/pages/en/about.astro`
- Create: `src/pages/contact.astro`
- Create: `src/pages/en/contact.astro`

**Interfaces:**

- Consumes: `BaseLayout` (Task 3).

- [ ] **Step 1: Écrire la page À propos FR**

Créer `src/pages/about.astro` :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  lang="fr"
  title="À propos"
  description="Qui je suis et ce que je fais."
>
  <h1>À propos</h1>
  <p>
    Je suis développeur full-stack, passionné par le web moderne, les
    architectures propres et le partage de connaissances. Ce site rassemble mes
    articles techniques ainsi qu'un aperçu de mon parcours et de mes projets.
  </p>
  <p>Remplace ce texte par ta propre présentation.</p>
</BaseLayout>
```

- [ ] **Step 2: Écrire la page À propos EN**

Créer `src/pages/en/about.astro` :

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout lang="en" title="About" description="Who I am and what I do.">
  <h1>About</h1>
  <p>
    I'm a full-stack developer, passionate about modern web development, clean
    architecture, and sharing knowledge. This site gathers my technical articles
    along with an overview of my background and projects.
  </p>
  <p>Replace this text with your own bio.</p>
</BaseLayout>
```

- [ ] **Step 3: Écrire la page Contact FR**

Créer `src/pages/contact.astro` :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout lang="fr" title="Contact" description="Comment me contacter.">
  <h1>Contact</h1>
  <p>La meilleure façon de me joindre :</p>
  <ul>
    <li><a href="mailto:contact@exemple.com">contact@exemple.com</a></li>
    <li><a href="https://github.com/exemple">GitHub</a></li>
    <li><a href="https://www.linkedin.com/in/exemple">LinkedIn</a></li>
  </ul>
  <p>Remplace ces liens par tes vraies coordonnées.</p>
</BaseLayout>
```

- [ ] **Step 4: Écrire la page Contact EN**

Créer `src/pages/en/contact.astro` :

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout lang="en" title="Contact" description="How to reach me.">
  <h1>Contact</h1>
  <p>The best way to reach me:</p>
  <ul>
    <li><a href="mailto:contact@exemple.com">contact@exemple.com</a></li>
    <li><a href="https://github.com/exemple">GitHub</a></li>
    <li><a href="https://www.linkedin.com/in/exemple">LinkedIn</a></li>
  </ul>
  <p>Replace these links with your real contact details.</p>
</BaseLayout>
```

- [ ] **Step 5: Vérifier le contenu généré**

Run: `npm run check && npm run build`
Expected: 0 erreur.

Run: `grep -o 'mailto:contact@exemple.com' dist/contact/index.html && grep -o 'mailto:contact@exemple.com' dist/en/contact/index.html`
Expected: chaque commande affiche une correspondance.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Ajout des pages À propos et Contact"
```

---

### Task 12: Page d'accueil finalisée

**Files:**

- Modify: `src/pages/index.astro` (remplace le placeholder de la Task 3)
- Modify: `src/pages/en/index.astro` (remplace le placeholder de la Task 3)

**Interfaces:**

- Consumes: `blogFr`/`blogEn` (Task 4), `ArticleCard` (Task 5), `BaseLayout` (Task 3).

- [ ] **Step 1: Écrire la page d'accueil FR**

Remplacer `src/pages/index.astro` :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ArticleCard from '../components/ArticleCard.astro';
import { getCollection } from 'astro:content';

const latestPosts = (await getCollection('blogFr'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);
---

<BaseLayout
  lang="fr"
  title="Accueil"
  description="Développeur — articles techniques et projets."
>
  <section>
    <h1>Bonjour, je suis [Ton Nom]</h1>
    <p>
      Développeur full-stack. J'écris sur le développement web et je partage mes
      projets ici. Remplace ce texte par ta propre présentation.
    </p>
    <p>
      <a href="/cv/">Voir mon parcours</a> · <a href="/projects/"
        >Voir mes projets</a
      >
    </p>
  </section>
  <section>
    <h2>Derniers articles</h2>
    {
      latestPosts.map((post) => (
        <ArticleCard
          title={post.data.title}
          description={post.data.description}
          pubDate={post.data.pubDate}
          tags={post.data.tags}
          href={`/blog/${post.id}/`}
          lang="fr"
        />
      ))
    }
  </section>
</BaseLayout>
```

- [ ] **Step 2: Écrire la page d'accueil EN**

Remplacer `src/pages/en/index.astro` :

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArticleCard from '../../components/ArticleCard.astro';
import { getCollection } from 'astro:content';

const latestPosts = (await getCollection('blogEn'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);
---

<BaseLayout
  lang="en"
  title="Home"
  description="Developer — technical articles and projects."
>
  <section>
    <h1>Hi, I'm [Your Name]</h1>
    <p>
      Full-stack developer. I write about web development and share my projects
      here. Replace this text with your own introduction.
    </p>
    <p>
      <a href="/en/cv/">See my background</a> · <a href="/en/projects/"
        >See my projects</a
      >
    </p>
  </section>
  <section>
    <h2>Latest articles</h2>
    {
      latestPosts.map((post) => (
        <ArticleCard
          title={post.data.title}
          description={post.data.description}
          pubDate={post.data.pubDate}
          tags={post.data.tags}
          href={`/en/blog/${post.id}/`}
          lang="en"
        />
      ))
    }
  </section>
</BaseLayout>
```

- [ ] **Step 3: Vérifier le contenu généré**

Run: `npm run check && npm run build`
Expected: 0 erreur.

Run: `grep -o 'Pourquoi' dist/index.html && grep -o 'Bienvenue' dist/index.html`
Expected: les deux articles français les plus récents apparaissent sur l'accueil FR.

Run: `grep -o 'Hello, world' dist/en/index.html`
Expected: une correspondance sur l'accueil EN.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Finalisation de la page d'accueil"
```

---

### Task 13: Pages 404 localisées

**Files:**

- Create: `src/pages/404.astro`
- Create: `src/pages/en/404.astro`

**Interfaces:**

- Consumes: `BaseLayout` (Task 3).

Note de portée : `src/pages/404.astro` (racine) est la page que les hébergeurs statiques comme Vercel servent automatiquement pour toute route non trouvée sur l'ensemble du site — c'est la 404 par défaut fonctionnelle, en français. `src/pages/en/404.astro` est une vraie page accessible et liée depuis la navigation anglaise, mais Vercel ne la sert pas automatiquement pour une URL anglaise cassée sans configuration de routing supplémentaire (`vercel.json`) — cette configuration additionnelle n'est pas incluse ici car elle est fragile à écrire sans pouvoir la tester contre le routing réel de Vercel, et une règle mal écrite risquerait de casser le routing de tout le site. Décision assumée, à mentionner à l'utilisateur.

- [ ] **Step 1: Écrire la page 404 FR**

Créer `src/pages/404.astro` :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  lang="fr"
  title="Page introuvable"
  description="Cette page n'existe pas."
>
  <h1>Page introuvable</h1>
  <p>La page que tu cherches n'existe pas ou plus.</p>
  <p><a href="/">Retour à l'accueil</a></p>
</BaseLayout>
```

- [ ] **Step 2: Écrire la page 404 EN**

Créer `src/pages/en/404.astro` :

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout
  lang="en"
  title="Page not found"
  description="This page does not exist."
>
  <h1>Page not found</h1>
  <p>The page you're looking for doesn't exist anymore.</p>
  <p><a href="/en/">Back to home</a></p>
</BaseLayout>
```

- [ ] **Step 3: Vérifier le contenu généré**

Run: `npm run check && npm run build`
Expected: 0 erreur ; `dist/404.html` et `dist/en/404/index.html` générés.

Run: `grep -o 'Page introuvable' dist/404.html`
Expected: une correspondance.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Ajout des pages 404 localisées"
```

---

### Task 14: Préparation du déploiement Vercel

**Files:**

- Create: `README.md` (remplace le README généré par le scaffold)

**Interfaces:**

- Consumes: l'intégralité du site des tâches précédentes.

- [ ] **Step 1: Vérifier une dernière fois l'ensemble du site**

Run: `npm run check && npm run lint && npm run format:check && npm run build`
Expected: 0 erreur sur les quatre commandes. Le dossier `dist/` contient toutes les pages FR et EN attendues.

- [ ] **Step 2: Écrire le README avec les instructions de déploiement**

Remplacer `README.md` :

````md
# Site personnel

Blog et vitrine professionnelle bilingue (FR/EN), construit avec [Astro](https://astro.build).

## Développement local

```bash
npm install
npm run dev
```
````

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

````

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Ajout du README avec les instructions de déploiement"
````

---

## Self-Review Notes

- **Couverture de la spec** : routing i18n (Task 3), toutes les pages listées dans la spec (Tasks 6–13), tags/catégories (Tasks 5, 8), contact sans backend (Task 11), données structurées par langue pour projets/CV (Task 4), pas de RSS/mode sombre/recherche/formulaire backend (absents du plan, conforme). Seul écart assumé et documenté : la 404 anglaise n'est pas garantie servie automatiquement par Vercel sans config additionnelle (Task 13, note de portée) — à valider avec l'utilisateur après déploiement si important.
- **Cohérence des types** : `Lang` défini une fois dans `src/i18n/ui.ts` (Task 3) et réutilisé identiquement dans tous les composants et layouts. Les noms de collections (`blogFr`, `blogEn`, `projects`, `experience`) et leurs champs sont identiques entre `content.config.ts` (Task 4) et tous les usages ultérieurs.
- **Aucun placeholder de code** : le contenu d'exemple (bio, projets, expérience, articles) est explicitement identifié comme du texte à remplacer, jamais un `TBD` ou un bloc de code manquant.

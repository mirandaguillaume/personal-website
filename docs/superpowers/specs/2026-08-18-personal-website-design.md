# Site personnel — blog & mise en avant professionnelle

**Date**: 2026-08-18
**Statut**: Validé, en attente de plan d'implémentation

## Contexte et objectif

Site personnel pour un développeur, servant deux buts :

1. Publier des articles de blog (thématique développement/tech).
2. Servir de vitrine professionnelle (bio, projets, expérience, contact) pour la visibilité personnelle.

Projet entièrement nouveau (dossier vide, pas de dépôt git existant).

## Stack technique

- **Générateur de site statique** : [Astro](https://astro.build). Choisi pour son faible poids JS par défaut, son excellent support Markdown/MDX natif, et son adéquation avec les sites de contenu.
- **Contenu** : Markdown/MDX versionné dans le dépôt git, via l'API **Content Collections** d'Astro (schémas validés avec Zod à la compilation — pas d'erreurs de frontmatter silencieuses, autocomplétion TypeScript).
- **Langage** : TypeScript strict.
- **Qualité de code** : ESLint + Prettier.
- **Hébergement / déploiement** : Vercel. Déploiement continu connecté au dépôt git — push sur `main` déploie en production, chaque branche/PR obtient une preview automatique. Domaine personnalisé pourra être branché plus tard (aucun domaine acheté à ce jour).

### Alternative envisagée et écartée

PHP (Grav CMS) a été considéré comme alternative flat-file/Markdown équivalente. Écarté par préférence explicite de l'utilisateur — Astro conservé. Pas de gestion de serveur PHP à prévoir.

## Internationalisation (FR/EN)

Le site est bilingue français/anglais dès le départ.

- **Routing** : i18n natif d'Astro (`astro:i18n`), français comme locale par défaut (racine `/`, sans préfixe), anglais préfixé (`/en/...`).
- **Contenu multilingue** : collections de contenu **séparées par langue** (ex. `blog/fr/`, `blog/en/`) plutôt qu'un champ `lang` unique dans une collection commune. Un article existe dans la langue où il a été écrit — pas d'obligation de traduire chaque article dans les deux langues.
- **Pas de redirection automatique** basée sur la langue du navigateur (`Accept-Language`) — comportement prévisible, meilleur pour le SEO. Un sélecteur de langue dans le header permet de changer manuellement.
- **Projets et CV/expérience** : contrairement aux articles de blog (prose longue), ces contenus sont des **données structurées** (JSON/YAML ou content collection de type `data`) avec des champs texte dupliqués par langue à l'intérieur d'une même entrée (ex. `title: { fr: "...", en: "..." }`), plutôt que des fichiers séparés par langue. Ça évite la duplication de structure pour du contenu court et tabulaire.

## Pages et routes

Toutes préfixées par la locale selon la règle ci-dessus (`/`, `/en/`) :

| Route               | Contenu                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `/`                 | Accueil : intro courte, derniers articles, mise en avant professionnelle |
| `/blog/`            | Liste des articles, filtrable par tag                                    |
| `/blog/[slug]/`     | Article individuel                                                       |
| `/blog/tags/[tag]/` | Articles filtrés par tag                                                 |
| `/about/`           | Bio / à propos                                                           |
| `/projects/`        | Portfolio de projets                                                     |
| `/cv/`              | Expérience professionnelle, consultable en ligne                         |
| `/contact/`         | Liens sociaux + email direct                                             |

Chaque route existe en version `/en/...` équivalente.

## Fonctionnalités

**Incluses dès le départ** :

- Tags/catégories sur les articles, avec pages de filtrage dédiées.
- Sélecteur de langue FR/EN.

**Explicitement hors scope initial (YAGNI, ajoutables plus tard sans refonte)** :

- Flux RSS.
- Bouton mode sombre.
- Recherche d'articles.
- Formulaire de contact avec backend — remplacé par des liens sociaux directs + adresse email (`mailto:`), pour rester 100% statique sans dépendance externe (type Formspree).
- Export CV en PDF téléchargeable.

## Composants

Composants de présentation réutilisables, sans logique métier interne :

- Layout de base (header avec navigation + sélecteur de langue, footer).
- Carte d'article (aperçu dans la liste du blog).
- Carte de projet.
- Item de timeline pour le CV.
- Tag pill (affichage + lien de filtrage).

## Direction visuelle

Aucune préférence esthétique tranchée de l'utilisateur — direction visuelle laissée à l'appréciation lors de l'implémentation (à traiter avec la skill `frontend-design` au moment de construire les composants), dans un esprit cohérent avec un blog dev perso moderne et lisible.

## Erreurs et cas limites

- Page 404 localisée (une par langue).
- Un article sans traduction dans l'autre langue est simplement absent de cette langue — pas d'erreur, pas de fallback affiché à la place (évite d'afficher du contenu dans la mauvaise langue).

## Tests et validation

- Validation du contenu à la compilation via les schémas Zod des content collections (frontmatter invalide = échec de build, détecté avant déploiement).
- Vérification de types via `astro check`.
- Lint via ESLint.
- Pas de suite de tests de composants dédiée pour cette v1 (YAGNI) — le site n'a pas de logique interactive complexe justifiant un investissement de test au-delà de la validation à la compilation. À reconsidérer si le site gagne en interactivité.

## Hors scope de cette spec

- Achat et configuration d'un nom de domaine personnalisé.
- Rédaction du contenu réel (articles, bio, projets, CV) — la spec couvre la structure, pas le contenu final.
- Newsletter, formulaire de contact avec backend, RSS, recherche, mode sombre (voir section Fonctionnalités).

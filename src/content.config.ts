import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { KEBAB } from './content/article-validation';
import { findArticlesHorsLangue } from './content/articles-hors-langue';
import {
  trouverTextesInvalides,
  type ExperienceBrute,
} from './content/cv-validation';
import { existsSync, readFileSync } from 'node:fs';
import {
  calculerEmpreinte,
  FICHIER_EMPREINTE,
  listerSourcesCv,
} from './cv/empreinte';

const experiencesBrutes = JSON.parse(
  readFileSync('./src/data/experience.json', 'utf-8'),
) as ExperienceBrute[];
const textesInvalides = trouverTextesInvalides(experiencesBrutes);
if (textesInvalides.length > 0) {
  throw new Error(`Données du CV invalides :\n${textesInvalides.join('\n')}`);
}

// Les PDF du CV sont générés en local (npm run cv:pdf) : le build refuse
// des PDF qui ne correspondent plus aux sources. Le script de génération
// construit lui-même le site, d'où l'échappatoire CV_PDF_GENERATION.
if (process.env.CV_PDF_GENERATION !== '1') {
  const attendue = calculerEmpreinte(listerSourcesCv(), (chemin) =>
    readFileSync(chemin, 'utf-8'),
  );
  const enregistree = existsSync(FICHIER_EMPREINTE)
    ? readFileSync(FICHIER_EMPREINTE, 'utf-8').trim()
    : '';
  if (enregistree !== attendue) {
    throw new Error('PDF du CV périmé : lancez npm run cv:pdf');
  }
}

const horsLangue = findArticlesHorsLangue('./src/content/blog');
if (horsLangue.length > 0) {
  throw new Error(`Article(s) hors de fr/ et en/ : ${horsLangue.join(', ')}`);
}

/** Un `pubDate:` vide vaut null en YAML, que z.coerce.date() rend 1970. */
const DATE_MINIMALE = new Date('2000-01-01');

const blogSchema = z.object({
  title: z.string().trim().min(1, 'title ne doit pas être vide'),
  description: z.string().trim().min(1, 'description ne doit pas être vide'),
  pubDate: z.coerce.date().min(DATE_MINIMALE, {
    message:
      'pubDate doit être postérieure au 2000-01-01 (un champ vide vaut 1970)',
  }),
  tags: z.array(
    z
      .string()
      .regex(KEBAB, 'chaque tag doit être en kebab minuscule, sans / ni #'),
  ),
  // Relie un article à sa traduction. Obligatoire : un article sans clé
  // casse le build plutôt que de perdre son hreflang en silence.
  translationKey: z
    .string()
    .regex(KEBAB, 'translationKey doit être en kebab minuscule'),
  draft: z.boolean().optional().default(false),
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
    url: z.url().optional(),
    repoUrl: z.url().optional(),
  }),
});

const mission = z.object({
  client: z.string().min(1),
  role: localizedText.optional(),
  featured: z.boolean(),
  // Facultatives : une mission sans date affiche la période du poste porteur.
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  year: z.number().int().optional(),
  achievements: z.array(localizedText).min(1),
  stack: z.array(z.string()),
});

const experience = defineCollection({
  loader: file('src/data/experience.json'),
  schema: z.object({
    role: localizedText,
    organization: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    summary: localizedText,
    achievements: z.array(localizedText),
    stack: z.array(z.string()),
    missions: z.array(mission),
  }),
});

const offers = defineCollection({
  loader: file('src/data/offers.json'),
  schema: z.object({
    order: z.number().int(),
    title: localizedText,
    method: localizedText,
    proof: z
      .object({ text: localizedText, href: z.string().optional() })
      .optional(),
  }),
});

const skills = defineCollection({
  loader: file('src/data/skills.json'),
  schema: z.object({
    order: z.number().int(),
    label: localizedText,
    items: z.array(z.union([z.string(), localizedText])),
  }),
});

const education = defineCollection({
  loader: file('src/data/education.json'),
  schema: z.object({
    diploma: localizedText,
    school: z.string(),
    city: z.string(),
    startYear: z.number().int(),
    endYear: z.number().int(),
  }),
});

const engagements = defineCollection({
  loader: file('src/data/engagements.json'),
  schema: z.object({ text: localizedText, href: z.url().optional() }),
});

export const collections = {
  blogFr,
  blogEn,
  projects,
  experience,
  offers,
  skills,
  education,
  engagements,
};

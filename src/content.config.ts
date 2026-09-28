import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { KEBAB } from './content/article-validation';

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

import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()),
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

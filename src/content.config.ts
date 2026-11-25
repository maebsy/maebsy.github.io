/**
 * Content collections. One Markdown file per (item, locale):
 *   src/content/<collection>/<locale>/<id>.md
 * Files share `id` + `translationKey` across locales so the language switch
 * and hreflang can link translations. See docs/content-guide.md.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const locale = z.enum(['en', 'ja', 'ko']);
const status = z.enum(['draft', 'review', 'published']);
const isoDate = z.coerce.date();

/** Fields every localized document carries. */
const base = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  translationKey: z.string().regex(/^[a-z]+-[a-z0-9-]+$/),
  locale,
  title: z.string().min(1),
  summary: z.string().min(1).max(320),
  status,
  updatedAt: isoDate,
  /**
   * Revision of the source this text was written from: a repository SHA for
   * projects, or the private vault note revision for exported writing.
   */
  sourceRevision: z.string().min(1),
  /** For translations: the locale this file was translated from. */
  translatedFrom: locale.optional(),
  tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/projects' }),
  schema: base.extend({
    /** Short role statement shown in the project header. */
    role: z.string().min(1),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/blog' }),
  schema: base.extend({
    publishedAt: isoDate,
    category: z.enum(['data-engineering', 'databases', 'tooling', 'infrastructure', 'ai-ml', 'career']),
    /** Zenn cross-post, added manually after an approved publication. */
    zennUrl: z.url().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/notes' }),
  schema: base.extend({
    progress: z.enum(['seedling', 'growing', 'stable']),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/research' }),
  schema: base.extend({
    sources: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
    hypothesis: z.string(),
  }),
});

export const collections = { projects, blog, notes, research };

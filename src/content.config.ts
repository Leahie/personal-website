import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    techStack: z.array(z.string()),
    link: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { projects };

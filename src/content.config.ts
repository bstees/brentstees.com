import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const digests = defineCollection({
  loader: glob({ base: './src/content/digests', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(240),
    publicationDate: z.coerce.date(),
    issueNumber: z.number().int().positive(),
    topics: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).min(1),
    sourceConversationId: z.string().uuid(),
    sourceMessageId: z.string().uuid(),
    findingIds: z.array(z.string().regex(/^F-\d{4}-\d{2}-\d{2}-\d{2}$/)).min(1),
  }),
});

export const collections = { digests };


import { z } from 'zod';

export const StoryGenreSchema = z.enum([
  'adventure',
  'mystery',
  'sci-fi',
  'daily-life',
  'business',
  'fantasy',
]);
export type StoryGenre = z.infer<typeof StoryGenreSchema>;

export const StorySentenceSchema = z.object({
  id: z.number(),
  english: z.string(),
  arabic: z.string(),
  highlightedWords: z.array(z.string()),
  evaluationScore: z.number().optional(),
});

export type StorySentence = z.infer<typeof StorySentenceSchema>;

export const StoryGenerationParamsSchema = z.object({
  targetWords: z.array(z.string()).min(1).max(5),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2']),
  genre: StoryGenreSchema,
  length: z.enum(['short', 'medium', 'long']),
});

export type StoryGenerationParams = z.infer<typeof StoryGenerationParamsSchema>;

export const GeneratedStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  arabicTitle: z.string(),
  sentences: z.array(StorySentenceSchema),
  targetWords: z.array(z.string()),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2']),
  genre: StoryGenreSchema,
  createdAt: z.number(),
});

export type GeneratedStory = z.infer<typeof GeneratedStorySchema>;

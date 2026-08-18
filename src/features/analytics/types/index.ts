import { z } from 'zod';

export const CefrMasteryStatsSchema = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2']),
  totalWords: z.number(),
  masteredWords: z.number(),
  learningWords: z.number(),
  accuracyRate: z.number(),
});

export type CefrMasteryStats = z.infer<typeof CefrMasteryStatsSchema>;

export const UserLearningProfileSchema = z.object({
  userId: z.string(),
  totalXp: z.number(),
  currentStreakDays: z.number(),
  lastStudyDate: z.string(),
  wordsMastered: z.array(z.number()),
  wordsFavorited: z.array(z.number()),
  speechRecordingsCount: z.number(),
  storiesGeneratedCount: z.number(),
  tutorSessionsCount: z.number(),
  cefrStats: z.array(CefrMasteryStatsSchema),
});

export type UserLearningProfile = z.infer<typeof UserLearningProfileSchema>;

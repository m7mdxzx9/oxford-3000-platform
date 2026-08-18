import { z } from 'zod';

export const SrsReviewRatingSchema = z.enum(['again', 'hard', 'good', 'easy']);
export type SrsReviewRating = z.infer<typeof SrsReviewRatingSchema>;

export const SrsCardStateSchema = z.object({
  wordId: z.number(),
  intervalDays: z.number(),
  repetitionCount: z.number(),
  easeFactor: z.number(),
  dueDate: z.string(),
  lastReviewDate: z.string().optional(),
  history: z.array(
    z.object({
      date: z.string(),
      rating: SrsReviewRatingSchema,
    })
  ).default([]),
});

export type SrsCardState = z.infer<typeof SrsCardStateSchema>;

export interface FlashcardSession {
  dueWordIds: number[];
  currentIndex: number;
  reviewedCount: number;
  isFlipped: boolean;
}

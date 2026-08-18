import { z } from 'zod';

export const QuizQuestionSchema = z.object({
  id: z.string(),
  wordId: z.number(),
  word: z.string(),
  ipa: z.string(),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2']),
  questionType: z.enum(['definition', 'arabic-to-english', 'english-to-arabic', 'audio-listen']),
  prompt: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string(),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const MinimalPairSchema = z.object({
  id: z.string(),
  wordA: z.string(),
  ipaA: z.string(),
  wordB: z.string(),
  ipaB: z.string(),
  phonemeContrast: z.string(),
  hint: z.string(),
});

export type MinimalPair = z.infer<typeof MinimalPairSchema>;

export interface GameScoreState {
  currentStreak: number;
  bestStreak: number;
  totalAnswered: number;
  correctCount: number;
  xpEarned: number;
}

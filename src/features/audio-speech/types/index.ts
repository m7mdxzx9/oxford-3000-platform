import { z } from 'zod';

export const WordEvaluationSchema = z.object({
  word: z.string(),
  cleanWord: z.string(),
  status: z.enum(['correct', 'incorrect', 'missed']),
  similarity: z.number().min(0).max(100),
  phoneticFeedback: z.string().optional(),
});

export type WordEvaluation = z.infer<typeof WordEvaluationSchema>;

export const SpeechEvaluationResultSchema = z.object({
  spokenText: z.string(),
  targetText: z.string(),
  overallScore: z.number().min(0).max(100),
  breakdown: z.array(WordEvaluationSchema),
  passed: z.boolean(),
  timestamp: z.number(),
});

export type SpeechEvaluationResult = z.infer<typeof SpeechEvaluationResultSchema>;

export const AudioPlaybackRateSchema = z.enum(['0.6', '0.8', '1.0', '1.2']);
export type AudioPlaybackRate = z.infer<typeof AudioPlaybackRateSchema>;

export interface AudioEngineState {
  isPlaying: boolean;
  isListening: boolean;
  rate: number;
  currentWordId: number | null;
  lastEvaluation: SpeechEvaluationResult | null;
}

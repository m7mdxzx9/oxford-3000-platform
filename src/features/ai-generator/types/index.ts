import { z } from 'zod';

export const CefrDifficultySchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export type CefrDifficulty = z.infer<typeof CefrDifficultySchema>;

export const GeneratedSentenceResultSchema = z.object({
  id: z.string(),
  word: z.string(),
  cefr: CefrDifficultySchema,
  english: z.string().min(1),
  arabic: z.string().min(1),
  grammarNote: z.string().optional(),
  highlightedTokens: z.array(z.string()).default([]),
  timestamp: z.number(),
});

export type GeneratedSentenceResult = z.infer<typeof GeneratedSentenceResultSchema>;

export const ApiKeyProviderSchema = z.enum(['gemini', 'openai', 'groq']);
export type ApiKeyProvider = z.infer<typeof ApiKeyProviderSchema>;

export interface ApiKeyState {
  key: string;
  provider: ApiKeyProvider;
  isConfigured: boolean;
  lastUpdated: string | null;
}

export interface SentenceGenerationRequest {
  word: string;
  cefr: CefrDifficulty;
  genre?: string;
  customPrompt?: string;
}

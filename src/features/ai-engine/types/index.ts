import { z } from 'zod';

export const CefrLevelChoiceSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export type CefrLevelChoice = z.infer<typeof CefrLevelChoiceSchema>;

export const GrokSentenceResponseSchema = z.object({
  word: z.string(),
  cefr: CefrLevelChoiceSchema,
  english: z.string().min(1),
  arabic: z.string().min(1),
  grammarInsight: z.string().optional(),
  syllables: z.array(z.string()).optional(),
  collocations: z.array(z.string()).optional(),
  timestamp: z.number(),
});

export type GrokSentenceResponse = z.infer<typeof GrokSentenceResponseSchema>;

export type GrokConnectionStatus = 'disconnected' | 'validating' | 'active' | 'error';

export interface GrokApiKeyState {
  key: string;
  status: GrokConnectionStatus;
  errorMessage?: string;
  lastTested?: number;
}

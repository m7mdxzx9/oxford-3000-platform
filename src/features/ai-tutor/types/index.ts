import { z } from 'zod';

export const RoleplayMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'tutor', 'system']),
  english: z.string().min(1),
  arabic: z.string().optional(),
  grammarTip: z.string().optional(),
  suggestedVocab: z.array(z.string()).optional(),
  timestamp: z.number(),
});

export type RoleplayMessage = z.infer<typeof RoleplayMessageSchema>;

export const RoleplayScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  arabicTitle: z.string(),
  icon: z.string(),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2']),
  description: z.string(),
  userRole: z.string(),
  tutorRole: z.string(),
  targetWords: z.array(z.string()),
  starterMessages: z.array(RoleplayMessageSchema),
});

export type RoleplayScenario = z.infer<typeof RoleplayScenarioSchema>;

export interface TutorState {
  currentScenario: RoleplayScenario | null;
  messages: RoleplayMessage[];
  isLoadingResponse: boolean;
  voiceInputActive: boolean;
  apiKey: string;
}

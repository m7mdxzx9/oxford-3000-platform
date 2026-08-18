import { z } from 'zod';

export const CefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'ALL']);
export type CefrLevel = z.infer<typeof CefrLevelSchema>;

export const LexiconItemSchema = z.object({
  id: z.number(),
  word: z.string().min(1),
  pos: z.string(),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2']),
  arabic: z.string(),
  example: z.string(),
  ipa: z.string(),
  isMastered: z.boolean().optional().default(false),
  isFavorite: z.boolean().optional().default(false),
  srsLevel: z.number().int().min(0).max(5).optional().default(0),
  lastReviewed: z.string().optional(),
});

export type LexiconItem = z.infer<typeof LexiconItemSchema>;

export const LexiconFilterParamsSchema = z.object({
  query: z.string().default(''),
  cefr: CefrLevelSchema.default('ALL'),
  letter: z.string().default('ALL'),
  pos: z.string().default('ALL'),
  onlyFavorites: z.boolean().default(false),
  onlyMastered: z.boolean().default(false),
});

export type LexiconFilterParams = z.infer<typeof LexiconFilterParamsSchema>;

export interface LexiconCatalogState {
  items: LexiconItem[];
  filteredItems: LexiconItem[];
  filterParams: LexiconFilterParams;
  selectedItem: LexiconItem | null;
  isLoading: boolean;
  searchQuery: string;
}

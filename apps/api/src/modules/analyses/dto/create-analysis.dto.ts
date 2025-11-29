import { z } from 'zod';

export const createAnalysisSchema = z.object({
  inputText: z
    .string()
    .min(10, 'Text must be at least 10 characters')
    .max(10000, 'Text must be less than 10000 characters'),
});

export type CreateAnalysisDto = z.infer<typeof createAnalysisSchema>;

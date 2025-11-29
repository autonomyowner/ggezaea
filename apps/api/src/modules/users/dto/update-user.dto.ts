import { z } from 'zod';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

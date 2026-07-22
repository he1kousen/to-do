import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

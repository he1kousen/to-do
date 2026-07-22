import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  category_id: z.string().uuid('Invalid category ID'),
  view_type: z.enum(['list', 'kanban']),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  view_type: z.enum(['list', 'kanban']).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  description: z.string().default(''),
  project_id: z.string().uuid('Invalid project ID'),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  due_date: z.string().datetime().optional().nullable(),
  position: z.number().int().default(0),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long').optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  due_date: z.string().datetime().optional().nullable(),
  position: z.number().int().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

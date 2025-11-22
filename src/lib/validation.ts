import { z } from 'zod';

export const noteSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Note cannot be empty')
    .max(5000, 'Note must be less than 5000 characters')
});

export const profileSchema = z.object({
  display_name: z.string()
    .trim()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters'),
  bio: z.string()
    .trim()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
});

export const reviewSchema = z.object({
  review: z.string()
    .trim()
    .max(2000, 'Review must be less than 2000 characters')
    .optional()
});

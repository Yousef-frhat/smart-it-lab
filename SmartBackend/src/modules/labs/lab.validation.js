import { z } from "zod";

export const saveProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  score: z.number().min(0).optional(),
  completedObjectives: z.array(z.number().int().min(0)).optional(),
});

export const terminalCommandSchema = z.object({
  command: z
    .string()
    .min(1, "Command cannot be empty")
    .max(500, "Command too long"),
  device: z.string().max(100).optional(),
});

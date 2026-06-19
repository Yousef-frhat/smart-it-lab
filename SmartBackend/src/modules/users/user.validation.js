import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  role: z.enum(["student", "admin", "instructor"]).optional(),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
});

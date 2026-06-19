import { z } from "zod";

export const updateSettingsSchema = z.object({
  theme: z.enum(["dark", "light", "auto"]).optional(),
  language: z.enum(["en", "ar", "fr", "de", "es", "zh"]).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      labReminders: z.boolean().optional(),
      achievements: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
  privacy: z
    .object({
      showProfile: z.boolean().optional(),
      showLeaderboard: z.boolean().optional(),
      showActivity: z.boolean().optional(),
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password must not exceed 128 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  avatar: z
    .string()
    .url("Avatar must be a valid URL")
    .optional()
    .or(z.literal("")),
});

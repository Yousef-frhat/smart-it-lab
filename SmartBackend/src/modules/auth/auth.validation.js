import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  // Security Fix #6 — Password Policy:
  // Minimum 8 chars (was 6), require at least one letter and one digit.
  // Max 128 to prevent bcrypt DoS (bcrypt silently truncates at 72 bytes,
  // but a 10MB password would still CPU-saturate before reaching bcrypt).
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      "Password must contain at least one letter and one number"
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

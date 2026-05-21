import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(50, "Username must be at most 50 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Please enter a valid email address.")
      .max(254, "Email must be at most 254 characters."),
    password: z
      .string()
      .regex(/^[A-Z]/, "Password must start with an uppercase letter.")
      .min(6, "Password must be at least 6 characters.")
      .max(100, "Password must be at most 100 characters."),
    token: z
      .string()
      .trim()
      .min(1, "Invitation token cannot be empty.")
      .max(200, "Invitation token is too long.")
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(50, "Username must be at most 50 characters."),
    password: z.string().min(1, "Password is required."),
  }),
});

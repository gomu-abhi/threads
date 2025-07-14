import { z } from "zod"

export const registerSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Wrong Password" }),
});
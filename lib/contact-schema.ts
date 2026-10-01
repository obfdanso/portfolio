import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Please enter your name").max(120),
  email: z.email("Please enter a valid email address"),
  message: z
    .string()
    .min(10, "Please write at least ten characters")
    .max(2000, "Please keep it under 2000 characters"),
  // Honeypot: real people never see this field, so any value means a bot.
  website: z.string().max(0).optional(),
});

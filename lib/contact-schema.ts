import { z } from "zod";

// Zod probes for `new Function` to compile faster validators. The site's
// Content Security Policy blocks eval, so the probe fails, Zod falls back, and
// Chrome logs a policy violation that costs the Lighthouse Best Practices
// score. Jitless skips the probe; a three-field form loses nothing.
z.config({ jitless: true });

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

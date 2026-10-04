import { z } from "zod";

/**
 * The exclusive union is the point: a project without a live URL has no `url`
 * field to render, so a dead "Live site" button is a type error rather than a
 * discipline problem. `strictObject` is what makes it genuinely exclusive —
 * without it a repo-only project could carry a stray `url` that a template
 * might pick up.
 */
const demoSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("live"),
    url: z.url(),
    repoUrl: z.url(),
  }),
  z.strictObject({
    kind: z.literal("repo-only"),
    repoUrl: z.url(),
  }),
  z.strictObject({
    kind: z.literal("recording"),
    posterSrc: z.string().min(1),
    videoSrc: z.string().min(1),
    repoUrl: z.url(),
  }),
  // A recording is planned but does not exist yet. The case study shows a
  // "coming soon" panel; the card offers only the source link.
  z.strictObject({
    kind: z.literal("recording-pending"),
    repoUrl: z.url(),
  }),
]);

export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  summary: z.string().min(1).max(200),
  role: z.string().min(1),
  contribution: z.string().min(1),
  timeframe: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  featured: z.boolean(),
  order: z.number().int().nonnegative(),
  accentHue: z.number().min(0).max(360),
  // Required, not defaulted: a new project without it fails the build rather
  // than landing on the wrong page silently. "frontend" projects appear on the
  // home and Projects pages; "other" ones only through the skills page.
  category: z.enum(["frontend", "other"]),
  demo: demoSchema,
  cover: z.strictObject({
    src: z.string().min(1),
    alt: z.string().min(1, "cover images require alt text"),
  }),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { projectFrontmatterSchema, type ProjectFrontmatter } from "@/lib/schemas";

export type Project = ProjectFrontmatter & { body: string };

const DEFAULT_DIR = path.join(process.cwd(), "content/projects");

export function loadProjects(dir: string = DEFAULT_DIR): Project[] {
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".mdx"));

  const projects = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const parsed = projectFrontmatterSchema.safeParse(data);

    if (!parsed.success) {
      // Fail the build loudly, naming the file and the field. A broken card
      // must never ship.
      const issues = parsed.error.issues
        .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("\n");
      throw new Error(`Invalid frontmatter in ${file}:\n${issues}`);
    }

    return { ...parsed.data, body: content };
  });

  return projects.sort((a, b) => a.order - b.order);
}

export function getProject(slug: string, dir?: string): Project | undefined {
  return loadProjects(dir).find((project) => project.slug === slug);
}

export function getFeaturedProjects(dir?: string): Project[] {
  return loadProjects(dir).filter((project) => project.featured);
}

/** The projects shown on the home and Projects pages, in `order`. */
export function getFrontendProjects(dir?: string): Project[] {
  return loadProjects(dir).filter((project) => project.category === "frontend");
}

import type { MetadataRoute } from "next";
import { loadProjects } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/projects", "/about", "/resume", "/skills", "/contact"].map(
    (route) => ({
      url: `${SITE.url}${route}`,
      lastModified: new Date(),
    }),
  );

  const projectRoutes = loadProjects().map((project) => ({
    url: `${SITE.url}/projects/${project.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...projectRoutes];
}

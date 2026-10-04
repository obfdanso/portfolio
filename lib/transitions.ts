/**
 * One source for the view transition names a project card and its case study
 * share. React morphs elements with the same name between pages, so the card
 * and the page must agree exactly.
 */
export function projectTransitionName(slug: string, part: "cover" | "title"): string {
  return `project-${part}-${slug}`;
}

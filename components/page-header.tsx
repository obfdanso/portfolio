import { MeshGradient } from "@/components/ui/mesh-gradient";

/**
 * The gradient header every page but the home page opens with. One size and
 * the site's own colours everywhere, the Resume header's, so the pages read
 * as one site (Danso's call, 2026-10-11). Taller content simply makes it
 * taller; shorter content sits in the middle of the same space.
 */
export function PageHeader({
  as: Tag = "section",
  children,
}: {
  as?: "section" | "header";
  children: React.ReactNode;
}) {
  return (
    <Tag className="mesh-host relative flex min-h-[30rem] items-center overflow-hidden py-24 md:min-h-[27rem] md:rounded-2xl">
      <MeshGradient />
      <div className="container-page w-full">{children}</div>
    </Tag>
  );
}

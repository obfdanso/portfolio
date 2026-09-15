import { ImageResponse } from "next/og";
import { getProject, loadProjects } from "@/lib/content";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study";

export function generateStaticParams() {
  return loadProjects().map((project) => ({ slug: project.slug }));
}

// Next 16 breaking change: params is a Promise here, so this must be async.
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: "linear-gradient(135deg, #0b1614 0%, #0f2a26 52%, #1d5a45 100%)",
          color: "#f2f7f5",
        }}
      >
        {/* One text child: Satori requires an explicit display on any div
            with more than one child, and JSX splits this into three. */}
        <div style={{ fontSize: 28, opacity: 0.72 }}>{`${SITE.name} — ${SITE.role}`}</div>
        <div style={{ fontSize: 68, marginTop: 14, letterSpacing: -2 }}>
          {project?.title ?? "Case study"}
        </div>
        <div style={{ fontSize: 28, marginTop: 18, opacity: 0.8, maxWidth: 900 }}>
          {project?.summary ?? ""}
        </div>
      </div>
    ),
    size,
  );
}

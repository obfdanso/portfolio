import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} · ${SITE.role}`;

// Hex rather than the OKLCH theme tokens: Satori does not resolve CSS custom
// properties, so the palette is restated here.
export default function OpengraphImage() {
  return new ImageResponse(
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
      <div style={{ fontSize: 30, opacity: 0.72 }}>{SITE.role}</div>
      <div style={{ fontSize: 68, marginTop: 14, letterSpacing: -2 }}>{SITE.name}</div>
    </div>,
    size,
  );
}

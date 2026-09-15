import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icons must be raster, so this is generated rather than shared
// with app/icon.svg. Hex, not OKLCH tokens: Satori does not resolve custom
// properties.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d4f52 0%, #1f7d5c 55%, #8fcf62 100%)",
          color: "#f2f7f5",
          fontSize: 116,
          fontWeight: 700,
        }}
      >
        D
      </div>
    ),
    size,
  );
}

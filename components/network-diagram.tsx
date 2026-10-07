import type { CSSProperties } from "react";

// Two clients talking through a server, as intercli does. Packets travel the
// links with CSS offset-path; the lock marks every hop as encrypted.
const LEFT = "M 70 60 L 210 60";
const RIGHT = "M 350 60 L 210 60";

const packet = (path: string, delay: string) =>
  ({ offsetPath: `path("${path}")`, animationDelay: delay }) as CSSProperties;

export function NetworkDiagram() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 420 120"
      className="network-diagram mt-8 w-full max-w-md"
    >
      <path className="network-diagram__link" d={LEFT} />
      <path className="network-diagram__link" d={RIGHT} />

      <circle className="network-diagram__packet" r="4" style={packet(LEFT, "0ms")} />
      <circle className="network-diagram__packet" r="4" style={packet(RIGHT, "1400ms")} />
      <circle
        className="network-diagram__packet network-diagram__packet--back"
        r="4"
        style={packet(LEFT, "700ms")}
      />

      <g className="network-diagram__node" transform="translate(70 60)">
        <rect x="-34" y="-20" width="68" height="40" rx="8" />
        <text y="5">client</text>
      </g>
      <g
        className="network-diagram__node network-diagram__node--server"
        transform="translate(210 60)"
      >
        <rect x="-40" y="-24" width="80" height="48" rx="10" />
        <text y="-5">server</text>
        <path
          className="network-diagram__lock"
          d="M -6 11 h 12 v 9 h -12 Z M -4 11 v -3 a 4 4 0 0 1 8 0 v 3"
        />
      </g>
      <g className="network-diagram__node" transform="translate(350 60)">
        <rect x="-34" y="-20" width="68" height="40" rx="8" />
        <text y="5">client</text>
      </g>
    </svg>
  );
}

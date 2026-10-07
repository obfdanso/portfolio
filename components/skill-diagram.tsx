import type { CSSProperties, ReactNode } from "react";

/**
 * A small animated drawing for each skill on the skills page. Decorative:
 * hidden from assistive technology, coloured from the theme, and still under
 * reduced motion (see "Skill diagrams" in globals.css). Packets travel the
 * links with CSS offset-path; database rows light up as a query scans them.
 */
export function SkillDiagram({ id }: { id: string }) {
  const draw = DIAGRAMS[id];
  if (!draw) return null;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 440 120"
      data-diagram={id}
      className="skill-diagram mt-8 w-full max-w-md"
    >
      {draw()}
    </svg>
  );
}

const packet = (path: string, delay: string) =>
  ({ offsetPath: `path("${path}")`, animationDelay: delay }) as CSSProperties;

function Packet({ path, delay, back = false }: { path: string; delay: string; back?: boolean }) {
  return (
    <circle
      className={
        back ? "skill-diagram__packet skill-diagram__packet--back" : "skill-diagram__packet"
      }
      r="4"
      style={packet(path, delay)}
    />
  );
}

function Node({
  x,
  label,
  accent = false,
  width = 72,
  children,
}: {
  x: number;
  label: string;
  accent?: boolean;
  width?: number;
  children?: ReactNode;
}) {
  return (
    <g
      className={accent ? "skill-diagram__node skill-diagram__node--accent" : "skill-diagram__node"}
      transform={`translate(${x} 60)`}
    >
      <rect x={-width / 2} y="-22" width={width} height="44" rx="9" />
      <text y={children ? -5 : 4}>{label}</text>
      {children}
    </g>
  );
}

// Backend: a request travels from the browser to the API and on to the
// database, and the response comes back the same way.
function Backend() {
  const left = "M 75 60 L 220 60";
  const right = "M 220 60 L 365 60";
  return (
    <>
      <path className="skill-diagram__link" d={left} />
      <path className="skill-diagram__link" d={right} />
      <Packet path={left} delay="0ms" />
      <Packet path={right} delay="700ms" />
      <Packet path={right} delay="1400ms" back />
      <Packet path={left} delay="2100ms" back />
      <Node x={75} label="browser" />
      <Node x={220} label="express" accent>
        <text className="skill-diagram__glyph" y="13">
          {"{ }"}
        </text>
      </Node>
      <Node x={365} label="postgres" />
    </>
  );
}

// Databases and SQL: a query goes into a table, its rows light up one by one
// as they are scanned, and the result comes out.
function Databases() {
  const into = "M 60 60 L 220 60";
  const out = "M 220 60 L 380 60";
  return (
    <>
      <path className="skill-diagram__link" d={into} />
      <path className="skill-diagram__link" d={out} />
      <Packet path={into} delay="0ms" />
      <Packet path={out} delay="1400ms" />
      <Node x={60} label="SELECT" />
      <g className="skill-diagram__node skill-diagram__table" transform="translate(220 60)">
        <rect x="-54" y="-34" width="108" height="68" rx="8" />
        <line x1="-54" y1="-20" x2="54" y2="-20" />
        {[0, 1, 2, 3].map((row) => (
          <rect
            key={row}
            className="skill-diagram__row"
            x="-48"
            y={-15 + row * 12}
            width="96"
            height="9"
            rx="2"
            style={{ animationDelay: `${row * 350}ms` }}
          />
        ))}
      </g>
      <Node x={380} label="rows" />
    </>
  );
}

// Networking: two clients talking through a server, as intercli does. The
// lock marks every hop as encrypted.
function Networking() {
  const left = "M 80 60 L 220 60";
  const right = "M 360 60 L 220 60";
  return (
    <>
      <path className="skill-diagram__link" d={left} />
      <path className="skill-diagram__link" d={right} />
      <Packet path={left} delay="0ms" />
      <Packet path={right} delay="1400ms" />
      <Packet path={left} delay="700ms" back />
      <Node x={80} label="client" width={68} />
      <Node x={220} label="server" accent width={80}>
        <path
          className="skill-diagram__lock"
          d="M -6 11 h 12 v 9 h -12 Z M -4 11 v -3 a 4 4 0 0 1 8 0 v 3"
        />
      </Node>
      <Node x={360} label="client" width={68} />
    </>
  );
}

// AI tools: a prompt becomes a draft, the draft gets reviewed (the check),
// and either ships or goes back for another pass.
function AiTools() {
  const line = "M 55 60 L 385 60";
  const loop = "M 275 38 C 260 0, 180 0, 165 38";
  return (
    <>
      <path className="skill-diagram__link" d={line} />
      <path className="skill-diagram__link" d={loop} />
      <Packet path={line} delay="0ms" />
      <Packet path={loop} delay="1400ms" />
      <Node x={55} label="prompt" width={78} />
      <Node x={165} label="draft" width={78} />
      <Node x={275} label="review" accent width={78}>
        <path className="skill-diagram__check" d="M -6 13 l 4 4 l 8 -9" />
      </Node>
      <Node x={385} label="ship" width={78} />
    </>
  );
}

const DIAGRAMS: Record<string, () => ReactNode> = {
  backend: Backend,
  databases: Databases,
  networking: Networking,
  "ai-tools": AiTools,
};

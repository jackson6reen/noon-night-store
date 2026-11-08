import type { Line } from "@/lib/products";

const THEMES: Record<Line, { body: string; cap: string; label: string; ink: string; glyph: "sun" | "moon" | "both" }> = {
  noon: { body: "#F3C46B", cap: "#C47A12", label: "#FFF8EA", ink: "#5A3A07", glyph: "sun" },
  night: { body: "#2E3170", cap: "#14163A", label: "#EEF0FF", ink: "#1F2150", glyph: "moon" },
  bundle: { body: "#2E3170", cap: "#C47A12", label: "#FFF8EA", ink: "#1F2150", glyph: "both" },
};

function Glyph({ kind, x, y, color }: { kind: "sun" | "moon"; x: number; y: number; color: string }) {
  if (kind === "sun")
    return (
      <g transform={`translate(${x} ${y})`} fill={color}>
        <circle r="7" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="-1.2" y="-13" width="2.4" height="4" rx="1.2" transform={`rotate(${i * 45})`} />
        ))}
      </g>
    );
  return (
    <path
      transform={`translate(${x} ${y})`}
      fill={color}
      d="M3 -10a10 10 0 1 0 7 17A8 8 0 0 1 3 -10z"
    />
  );
}

/** Drawn product bottle, used until real supplier mockups are added. */
export function Bottle({
  name,
  line,
  format,
  className,
}: {
  name: string;
  line: Line;
  format: string;
  className?: string;
}) {
  const t = THEMES[line];
  const words = name.split(" ");
  const top = words[0];
  const rest = words.slice(1).join(" ");
  return (
    <svg viewBox="0 0 160 220" role="img" aria-label={`${name} bottle`} className={className}>
      <ellipse cx="80" cy="212" rx="52" ry="6" fill="#000" opacity="0.08" />
      <rect x="50" y="10" width="60" height="30" rx="6" fill={t.cap} />
      <rect x="50" y="34" width="60" height="6" fill="#000" opacity="0.12" />
      <rect x="32" y="40" width="96" height="170" rx="18" fill={t.body} />
      <rect x="38" y="46" width="10" height="150" rx="5" fill="#fff" opacity="0.18" />
      <rect x="40" y="82" width="80" height="100" rx="8" fill={t.label} />
      {t.glyph === "both" ? (
        <>
          <Glyph kind="sun" x={68} y={102} color="#E9A23B" />
          <Glyph kind="moon" x={92} y={102} color="#2E3170" />
        </>
      ) : (
        <Glyph kind={t.glyph} x={80} y={102} color={line === "noon" ? "#E9A23B" : "#2E3170"} />
      )}
      <text x="80" y="134" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" letterSpacing="2.5" fill={t.ink}>
        NOON·NIGHT
      </text>
      <text x="80" y="152" textAnchor="middle" fontFamily="Georgia, serif" fontSize={rest.length > 9 ? 11 : 14} fontWeight="700" fill={t.ink}>
        {line === "bundle" ? "24-HOUR" : rest || top}
      </text>
      <text x="80" y="170" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fill={t.ink} opacity="0.7">
        {line === "bundle" ? "RESET KIT" : format.toUpperCase()}
      </text>
    </svg>
  );
}

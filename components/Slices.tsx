/**
 * Fruit-slice graphic from the Sunlit Balance packaging: overlapping quarter and half circles.
 * Decorative only (aria-hidden). Colors default to the three fruit accents.
 */
export function Slices({
  className = "ev-slices",
  colors = ["#FF735E", "#FFC857", "#EE91AC"],
  style,
}: {
  className?: string;
  colors?: [string, string, string];
  style?: React.CSSProperties;
}) {
  const [a, b, c] = colors;
  return (
    <span className={className} style={style} aria-hidden="true">
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" focusable="false">
        <path d="M0 100 A100 100 0 0 1 100 0 L100 100 Z" fill={c} opacity=".55" />
        <path d="M0 200 L0 100 A100 100 0 0 1 100 200 Z" fill={b} opacity=".75" />
        <path d="M60 200 A100 100 0 0 1 200 70 L200 200 Z" fill={a} />
      </svg>
    </span>
  );
}

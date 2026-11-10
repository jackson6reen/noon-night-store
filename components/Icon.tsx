/** Same icon set as wordpress/themes/evenly/inc/icons.php */
const PATHS: Record<string, string> = {
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19 13 11"/>',
  wave: '<path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9S10 4 7.5 5 9 9 12 9Zm0 0s2-5 4.5-4S15 9 12 9Z"/>',
  cart: '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7 15h10"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};

export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const key = PATHS[name] ? name : "leaf";
  return (
    <svg
      className={`nn-icon nn-icon--${key}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: PATHS[key] }}
    />
  );
}

/**
 * The approved evenly wordmark, extracted from brand/reference/evenly_logo_concepts.webp
 * by scripts/brand/extract-logo.mjs (raster: no vector source has been supplied yet).
 * Intrinsic size 1439x433, so height h → width h * 3.32.
 */
export function Logo({ height = 30, tone = "green" }: { height?: number; tone?: "green" | "cream" }) {
  return (
    <img
      className="ev-logo"
      src={`/img/logo-${tone}.webp`}
      alt="evenly"
      width={Math.round(height * 3.323)}
      height={height}
      style={{ height, width: "auto" }}
    />
  );
}

/** Drawn bottle (fallback only, when a product has no photo). */
export function Bottle({ label, accent = "#3B2A5A", bare = false }: { label: string; accent?: string; bare?: boolean }) {
  const text = label.replace(/:.*$/, "").slice(0, 18);
  return (
    <svg className="nn-bottle" viewBox="0 0 300 300" role="img" aria-label={text}>
      {!bare && <rect width="300" height="300" fill={accent} opacity=".12" />}
      <rect x="112" y="40" width="76" height="34" rx="8" fill="#231B33" />
      <rect x="92" y="70" width="116" height="190" rx="26" fill="#fff" stroke="#231B33" strokeWidth="3" />
      <rect x="92" y="128" width="116" height="78" fill={accent} />
      <text x="150" y="160" textAnchor="middle" fontFamily="Georgia,serif" fontSize="15" fill="#fff">EVENLY</text>
      <text x="150" y="184" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="11" fill="#fff">{text}</text>
    </svg>
  );
}

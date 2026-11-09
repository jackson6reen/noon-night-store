"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Same behaviour as the WordPress plugin's consent.js:
 * analytics/marketing only after consent, Global Privacy Control honoured,
 * choice stored in the "nn_consent" cookie for 180 days.
 * The preview has no tracking IDs, so nothing is ever loaded here.
 */
type State = { analytics: boolean; marketing: boolean };
const COOKIE = "nn_consent";
const EVENT = "nn:open-consent";

function read(): State | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!m) return null;
  try { return JSON.parse(decodeURIComponent(m[1])); } catch { return null; }
}
function write(s: State) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify({ ...s, ts: Date.now() }))}; Max-Age=${180 * 86400}; Path=/; SameSite=Lax${secure}`;
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [gpc, setGpc] = useState(false);

  useEffect(() => {
    const hasGpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    // Browser-only state (cookie, GPC) can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGpc(hasGpc);
    if (!read()) setVisible(true);
    const open = () => {
      const s = read();
      setAnalytics(!!s?.analytics);
      setMarketing(!!s?.marketing && !hasGpc);
      setCustom(true);
      setVisible(true);
    };
    window.addEventListener(EVENT, open);
    return () => window.removeEventListener(EVENT, open);
  }, []);

  const close = (s: State) => { write(s); setVisible(false); setCustom(false); };
  if (!visible) return null;

  return (
    <div className="nn-consent" role="dialog" aria-modal="false" aria-labelledby="nn-consent-title">
      <div className="nn-consent__inner">
        <p className="nn-consent__title" id="nn-consent-title">Your privacy choices</p>
        <p className="nn-consent__text">
          We use essential cookies to run the store. With your OK, we also use analytics to improve the site and marketing cookies to show you relevant ads.{" "}
          <Link href="/privacy-policy/">Privacy Policy</Link>
        </p>
        {custom && (
          <fieldset className="nn-consent__options">
            <legend className="screen-reader-text">Cookie categories</legend>
            <label><input type="checkbox" checked disabled /> Essential (always on)</label>
            <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics</label>
            <label><input type="checkbox" checked={marketing && !gpc} disabled={gpc} onChange={(e) => setMarketing(e.target.checked)} /> Marketing / targeted ads (&quot;sharing&quot;)</label>
            {gpc && <p className="nn-consent__gpc">Your browser sent a Global Privacy Control signal, so we have opted you out of sale and sharing.</p>}
          </fieldset>
        )}
        <div className="nn-consent__actions">
          {!custom && <button type="button" className="nn-btn nn-btn--ghost" onClick={() => setCustom(true)}>Customize</button>}
          <button type="button" className="nn-btn nn-btn--ghost" onClick={() => close({ analytics: false, marketing: false })}>Essential only</button>
          {custom
            ? <button type="button" className="nn-btn" onClick={() => close({ analytics, marketing: marketing && !gpc })}>Save choices</button>
            : <button type="button" className="nn-btn" onClick={() => close({ analytics: true, marketing: !gpc })}>Accept all</button>}
        </div>
      </div>
    </div>
  );
}

export function PrivacyChoicesLink() {
  return (
    <a href="#privacy-choices" className="nn-privacy-choices" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event(EVENT)); }}>
      Your Privacy Choices
    </a>
  );
}

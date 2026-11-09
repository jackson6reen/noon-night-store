"use client";

import { useState, type ReactNode } from "react";

/** WooCommerce-style tabs (same classes), all panels stay in the HTML for SEO. */
export function ProductTabs({ tabs }: { tabs: { id: string; title: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div className="woocommerce-tabs wc-tabs-wrapper">
      <ul className="tabs wc-tabs" role="tablist">
        {tabs.map((t) => (
          <li key={t.id} className={active === t.id ? "active" : ""} role="presentation">
            <a href={`#tab-${t.id}`} role="tab" aria-selected={active === t.id} aria-controls={`tab-${t.id}`}
              onClick={(e) => { e.preventDefault(); setActive(t.id); }}>{t.title}</a>
          </li>
        ))}
      </ul>
      {tabs.map((t) => (
        <div key={t.id} id={`tab-${t.id}`} className="woocommerce-Tabs-panel panel entry-content wc-tab" role="tabpanel" hidden={active !== t.id}>
          {t.content}
        </div>
      ))}
    </div>
  );
}

"use client";

/**
 * Commerce events, sent ONLY after the visitor accepted analytics cookies
 * (the "nn_consent" cookie written by the consent banner).
 *
 * One delivery path per event, so nothing is counted twice:
 *  - GA4 via gtag.js when it's loaded (window.gtag),
 *  - otherwise a GTM-style dataLayer push.
 *
 * Events: view_item, add_to_cart, begin_checkout (GA4 standard)
 *         bundle_select_item, bundle_complete (custom, "Build your 3")
 */
type Item = { item_id: string; item_name: string; price: number; quantity?: number };
type Params = { currency?: "USD"; value?: number; items?: Item[]; [k: string]: unknown };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function analyticsConsent(): boolean {
  if (typeof document === "undefined") return false;
  const m = document.cookie.match(/(?:^|; )nn_consent=([^;]*)/);
  if (!m) return false;
  try {
    return Boolean(JSON.parse(decodeURIComponent(m[1])).analytics);
  } catch {
    return false;
  }
}

export function track(event: string, params: Params = {}) {
  if (!analyticsConsent()) return;
  const payload = { currency: "USD" as const, ...params };
  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  } else {
    (window.dataLayer = window.dataLayer || []).push({ event, ecommerce: payload });
  }
}

export const toItem = (p: { sku: string; name: string; price: number }, quantity = 1): Item => ({
  item_id: p.sku,
  item_name: p.name,
  price: p.price,
  quantity,
});

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { Icon } from "./Icon";

export function Header({ nav, announcement }: { nav: { label: string; href: string }[]; announcement: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const { count, setOpen: openCart } = useCart();
  const navRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    document.body.classList.toggle("nn-nav-open", open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    if (open) navRef.current?.querySelector("a")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a className="nn-skip" href="#main">Skip to content</a>
      {announcement && <div className="nn-announce"><p>{announcement}</p></div>}
      <header className="nn-header">
        <div className="nn-container nn-header__bar">
          <button className="nn-icon-btn nn-menu-toggle" type="button" aria-controls="nn-nav" aria-expanded={open} onClick={() => setOpen(!open)}>
            <Icon name="menu" />
            <span className="screen-reader-text">Menu</span>
          </button>
          <div className="nn-logo"><Link href="/" rel="home">Noon Night</Link></div>
          <nav id="nn-nav" ref={navRef} className={`nn-nav${open ? " is-open" : ""}`} aria-label="Main">
            <ul>
              {nav.map((item) => (
                <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="nn-header__actions">
            <button className="nn-icon-btn" type="button" aria-expanded={search} onClick={() => setSearch(!search)}>
              <Icon name="search" />
              <span className="screen-reader-text">Search</span>
            </button>
            <button className="nn-icon-btn nn-cart-link" type="button" onClick={() => openCart(true)}>
              <Icon name="cart" />
              <span className="screen-reader-text">Cart</span>
              <span className="nn-cart-count" aria-label={`${count} items in cart`}>{count}</span>
            </button>
          </div>
        </div>
        {search && (
          <div className="nn-search-panel">
            <div className="nn-container">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = String(new FormData(e.currentTarget).get("q") ?? "");
                  router.push(`/shop?q=${encodeURIComponent(q)}`);
                  setSearch(false);
                }}
              >
                <label className="screen-reader-text" htmlFor="nn-q">Search products</label>
                <input id="nn-q" name="q" type="search" placeholder="Search sleep, cramps, bloating…" autoFocus />
                <button className="nn-btn" type="submit">Search</button>
              </form>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

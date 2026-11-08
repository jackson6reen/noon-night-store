import Link from "next/link";
import { FDA_DISCLAIMER } from "@/lib/products";
import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="mt-24 bg-night text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-cream/70">
            Supplements for the two hardest parts of the day: the bloated afternoon and the restless night.
          </p>
        </div>
        <div className="text-sm">
          <h3 className="mb-3 font-semibold">Shop</h3>
          <ul className="space-y-2 text-cream/75">
            <li><Link href="/shop?line=noon" className="hover:text-sun">Noon line (day)</Link></li>
            <li><Link href="/shop?line=night" className="hover:text-sun">Night line (sleep)</Link></li>
            <li><Link href="/reset" className="hover:text-sun">The 24-Hour Reset</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h3 className="mb-3 font-semibold">Promise</h3>
          <ul className="space-y-2 text-cream/75">
            <li>Made in FDA-registered, cGMP facilities</li>
            <li>Ships from the U.S.</li>
            <li>30-Night Rest-Easy Guarantee</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-cream/55">
          {FDA_DISCLAIMER} Talk to your doctor before starting any supplement, especially if you are pregnant, nursing, taking medication, or have a medical condition.
          <br />© 2026 Noon Night.
        </p>
      </div>
    </footer>
  );
}

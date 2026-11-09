import Link from "next/link";
import { getConcerns } from "@/lib/site";

export default function NotFound() {
  return (
    <main id="main" className="nn-main">
      <div className="nn-container nn-container--narrow nn-center">
        <h1>This page is taking a nap.</h1>
        <p className="nn-lead" style={{ marginInline: "auto" }}>We couldn&apos;t find it. Here&apos;s where most people were headed:</p>
        <div className="nn-chips nn-chips--center">
          {getConcerns(true).map((c) => <Link key={c.slug} href={`/product-category/${c.slug}`}>{c.name}</Link>)}
        </div>
      </div>
    </main>
  );
}

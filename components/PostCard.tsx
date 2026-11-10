import Link from "next/link";
import type { ContentDoc } from "@/lib/site";

export const readingTime = (html: string) => Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 230));

/** Journal category → matching lifestyle photo (same mapping as the theme's card-post.php). */
const CATEGORY_IMAGE: Record<string, string> = {
  Sleep: "l-sleep.webp",
  "Period Comfort": "l-cycle.webp",
  "Bloating & Gut": "l-gut.webp",
  Stress: "l-calm.webp",
};

export function PostCard({ doc }: { doc: ContentDoc }) {
  const image = CATEGORY_IMAGE[doc.category ?? ""] ?? "lineup-960.webp";
  return (
    <article className="nn-post-card">
      <Link className="nn-post-card__link" href={`/${doc.slug}/`}>
        <span className="nn-post-card__art"><img src={`/img/${image}`} alt="" loading="lazy" width={960} height={600} /></span>
        <span className="nn-post-card__body">
          {doc.category && <span className="nn-eyebrow">{doc.category}</span>}
          <span className="nn-post-card__title">{doc.title}</span>
          <span className="nn-post-card__excerpt">{doc.excerpt}</span>
          <span className="nn-post-card__meta">{readingTime(doc.body)} min read</span>
        </span>
      </Link>
    </article>
  );
}

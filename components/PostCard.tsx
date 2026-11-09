import Link from "next/link";
import type { ContentDoc } from "@/lib/site";
import { Icon } from "./Icon";

export const readingTime = (html: string) => Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 230));

export function PostCard({ doc }: { doc: ContentDoc }) {
  return (
    <article className="nn-post-card">
      <Link className="nn-post-card__link" href={`/${doc.slug}`}>
        <span className="nn-post-card__art" aria-hidden="true"><Icon name="leaf" size={40} /></span>
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

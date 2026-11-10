import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDoc, getDocs } from "@/lib/site";
import { Faq } from "@/components/Faq";
import { PostCard, readingTime } from "@/components/PostCard";

/** WordPress serves pages and posts at /slug/, so this route handles both (page.php + single.php). */
/** Only the slugs from wordpress/setup exist; anything else is a real 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getDocs().filter((d) => d.slug !== "home").map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const d = getDoc((await params).slug);
  if (!d) return {};
  return { title: d.seoTitle ? { absolute: d.seoTitle } : d.title, description: d.description };
}

export default async function DocPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const d = getDoc(slug);
  if (!d || slug === "home") notFound();

  if (d.type === "page") {
    return (
      <main id="main" className="nn-main">
        <div className="nn-container nn-container--narrow">
          <header className="nn-page-head"><h1>{d.title}</h1></header>
          <div className="nn-prose">
            <div dangerouslySetInnerHTML={{ __html: d.body }} />
            <Faq items={d.faq} />
          </div>
        </div>
      </main>
    );
  }

  const related = getDocs("post").filter((p) => p.slug !== d.slug && p.category === d.category).slice(0, 3);
  return (
    <main id="main" className="nn-main">
      <article className="nn-article">
        <header className="nn-article__head nn-container nn-container--narrow">
          {d.category && <Link className="nn-eyebrow" href="/journal">{d.category}</Link>}
          <h1>{d.title}</h1>
          {d.excerpt && <p className="nn-lead">{d.excerpt}</p>}
          <p className="nn-article__meta">By the Evenly team · {readingTime(d.body)} min read</p>
        </header>
        <div className="nn-prose nn-container nn-container--narrow">
          <div dangerouslySetInnerHTML={{ __html: d.body }} />
          {d.faq.length > 0 && <><h2>Frequently asked questions</h2><Faq items={d.faq} /></>}
          <aside className="nn-medical-note">
            <p><strong>This article is for education, not medical advice.</strong> If your symptoms are severe, sudden or getting worse, please talk to your doctor.</p>
          </aside>
        </div>
      </article>
      {related.length > 0 && (
        <section className="nn-section nn-container" aria-labelledby="nn-related">
          <h2 id="nn-related">Keep reading</h2>
          <div className="nn-post-grid">{related.map((p) => <PostCard key={p.slug} doc={p} />)}</div>
        </section>
      )}
    </main>
  );
}

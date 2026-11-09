import Link from "next/link";
import type { Metadata } from "next";
import { Bottle, Icon } from "@/components/Icon";
import { ProductGrid } from "@/components/ProductGrid";
import { Quiz } from "@/components/Quiz";
import { Faq } from "@/components/Faq";
import { PostCard } from "@/components/PostCard";
import { concernColor, getBusiness, getConcerns, getDoc, getDocs, getProducts, toCard } from "@/lib/site";

export function generateMetadata(): Metadata {
  const home = getDoc("home");
  return { title: { absolute: home?.seoTitle ?? "Noon Night" }, description: home?.description };
}

/** Mirrors front-page.php: one block per template-parts/home/*.php section. */
export default function Home() {
  const b = getBusiness();
  const concerns = getConcerns();
  const products = getProducts();
  const bundles = products.filter((p) => p.isBundle).sort((a, z) => z.price - a.price).map(toCard);
  const singles = products.filter((p) => !p.isBundle).slice(0, 4).map(toCard);
  const posts = getDocs("post").slice(0, 3);
  const quizLinks = Object.fromEntries(getConcerns(true).map((c) => [c.slug, { url: `/product-category/${c.slug}`, name: c.name }]));

  return (
    <main id="main" className="nn-main nn-home">
      {/* hero */}
      <section className="nn-hero">
        <div className="nn-container nn-hero__grid">
          <div className="nn-hero__copy">
            <p className="nn-eyebrow">For the things women are told to &quot;just live with&quot;</p>
            <h1>Better nights. Easier periods. A calmer gut.</h1>
            <p className="nn-lead">Gentle, research-backed supplements for sleep, period comfort and bloating, made for women who are tired of pushing through.*</p>
            <div className="nn-hero__ctas">
              <a className="nn-btn nn-btn--lg" href="#nn-quiz">Find what helps me</a>
              <Link className="nn-btn nn-btn--ghost nn-btn--lg" href="/shop">Shop all</Link>
            </div>
            <ul className="nn-hero__proof">
              <li><Icon name="check" size={18} /> Made in the USA, cGMP facility</li>
              <li><Icon name="check" size={18} /> Every ingredient and dose listed</li>
              <li><Icon name="check" size={18} /> {b.guarantee_days}-day money-back guarantee</li>
            </ul>
          </div>
          <div className="nn-hero__art" aria-hidden="true">
            <span className="nn-blob nn-blob--lilac" />
            <span className="nn-blob nn-blob--peach" />
            <span className="nn-hero__bottle nn-hero__bottle--1"><Bottle label="CYCLE EASE" accent={concernColor("period-comfort")} /></span>
            <span className="nn-hero__bottle nn-hero__bottle--2"><Bottle label="NIGHT CALM" accent={concernColor("sleep")} /></span>
            <span className="nn-hero__bottle nn-hero__bottle--3"><Bottle label="NOON DIGEST" accent={concernColor("bloating-gut")} /></span>
          </div>
        </div>
      </section>

      {/* concerns */}
      <section className="nn-section nn-container" aria-labelledby="nn-concerns-title">
        <div className="nn-section__head">
          <h2 id="nn-concerns-title">What do you need help with?</h2>
          <p>Start with what hurts. We&apos;ll show you what can help, and why.</p>
        </div>
        <div className="nn-concern-grid">
          {concerns.map((c) => (
            <Link key={c.slug} className="nn-concern" href={`/product-category/${c.slug}`} style={{ ["--accent" as string]: concernColor(c.slug) }}>
              <span className="nn-concern__icon"><Icon name={c.icon} size={28} /></span>
              <span className="nn-concern__name">{c.name}</span>
              <span className="nn-concern__tag">{c.tagline}</span>
              <span className="nn-concern__go">Explore <Icon name="arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* bestsellers */}
      <section className="nn-section nn-section--tint" aria-labelledby="nn-best-title">
        <div className="nn-container">
          <div className="nn-section__head">
            <h2 id="nn-best-title">Routines that work together</h2>
            <p>Our kits pair the products that support each other, and cost less than buying them one by one.</p>
          </div>
          <ProductGrid products={bundles} columns={4} />
          <div className="nn-section__head nn-section__head--spaced"><h2>Or start with one</h2></div>
          <ProductGrid products={singles} columns={4} />
        </div>
      </section>

      <Quiz links={quizLinks} />

      {/* difference */}
      <section className="nn-section nn-container" aria-labelledby="nn-diff-title">
        <div className="nn-section__head">
          <h2 id="nn-diff-title">Why women switch from the drugstore aisle</h2>
          <p>You&apos;ve probably tried something already. Here&apos;s what we do differently.</p>
        </div>
        <div className="nn-table-wrap">
          <table className="nn-compare">
            <thead><tr><td /><th scope="col">Typical drugstore</th><th scope="col" className="nn-compare__us">Noon Night</th></tr></thead>
            <tbody>
              {[
                ["Melatonin dose", 'Often 5â€“10 mg, the "groggy tomorrow" dose', "Low dose, paired with magnesium"],
                ["Magnesium form", "Oxide: cheap, poorly absorbed, laxative", "Glycinate: gentle and well absorbed"],
                ["Labels", '"Proprietary blends" that hide the doses', "Every ingredient and amount listed"],
                ["Approach", "Mask one symptom for a few hours", "Daily routines that support the root rhythm*"],
                ["If it doesn't work", "You're out the money", "Full refund on your first order"],
              ].map(([k, them, us]) => (
                <tr key={k}><th scope="row">{k}</th><td>{them}</td><td className="nn-compare__us">{us}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* how */}
      <section className="nn-section nn-section--night" aria-labelledby="nn-how-title">
        <div className="nn-container">
          <div className="nn-section__head"><h2 id="nn-how-title">How it works</h2></div>
          <ol className="nn-steps">
            {[
              ["Pick what hurts", "Sleep, period, bloating or stress. Or take the 30-second quiz."],
              ["Make it a ritual", "Clear directions for when to take each one. Most routines take under a minute a day."],
              ["Give it 30 days", "Many women notice a difference in the first weeks. If you don't, we refund your first order."],
            ].map(([h, p], i) => (
              <li key={h}><span className="nn-steps__num" aria-hidden="true">{i + 1}</span><h3>{h}</h3><p>{p}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* guarantee */}
      <section className="nn-section nn-container" aria-labelledby="nn-guarantee-title">
        <div className="nn-guarantee">
          <div className="nn-guarantee__seal" aria-hidden="true"><span>{b.guarantee_days}</span><small>DAYS</small></div>
          <div>
            <h2 id="nn-guarantee-title">The {b.guarantee_days}-day &quot;feel the difference&quot; guarantee</h2>
            <p>Try your first order for a full cycle. If you don&apos;t feel it&apos;s helping, email us and we&apos;ll refund you. No forms, and no need to send the bottle back.</p>
            <Link href="/refund-policy">Read the refund policy</Link>
          </div>
        </div>
      </section>

      {/* journal */}
      <section className="nn-section nn-section--tint" aria-labelledby="nn-journal-title">
        <div className="nn-container">
          <div className="nn-section__head nn-section__head--row">
            <h2 id="nn-journal-title">The Journal: honest answers</h2>
            <Link href="/journal">All articles <Icon name="arrow" size={16} /></Link>
          </div>
          <div className="nn-post-grid">{posts.map((p) => <PostCard key={p.slug} doc={p} />)}</div>
        </div>
      </section>

      {/* faq */}
      <section className="nn-section nn-container nn-container--narrow" aria-labelledby="nn-faq-title">
        <div className="nn-section__head"><h2 id="nn-faq-title">Questions, answered</h2></div>
        <Faq items={getDoc("home")?.faq ?? []} />
      </section>
    </main>
  );
}

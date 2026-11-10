import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ProductGrid } from "@/components/ProductGrid";
import { BuildYour3 } from "@/components/AddToCart";
import { Quiz } from "@/components/Quiz";
import { Faq } from "@/components/Faq";
import { PostCard } from "@/components/PostCard";
import { getBusiness, getConcerns, getDoc, getDocs, getOffer, getProducts, img, toCard } from "@/lib/site";

export function generateMetadata(): Metadata {
  const home = getDoc("home");
  return { title: { absolute: home?.seoTitle ?? "Evenly" }, description: home?.description };
}

/** Mirrors front-page.php: one block per template-parts/home/*.php section. */
export default function Home() {
  const b = getBusiness();
  const offer = getOffer();
  const concerns = getConcerns();
  const products = getProducts();
  const singles = products.filter((p) => !p.isBundle).map(toCard);
  const kits = products.filter((p) => p.isBundle).map(toCard);
  const posts = getDocs("post").slice(0, 3);
  const quizLinks = Object.fromEntries(getConcerns(true).map((c) => [c.slug, { url: `/product-category/${c.slug}/`, name: c.name }]));
  const marquee = [offer.label, `Free US shipping over $${b.free_ship_min}`, `${b.guarantee_days}-day money-back guarantee`, "Made in the USA", "Every dose on the label"];

  return (
    <main id="main" className="nn-main nn-home">
      {/* hero */}
      <section className="ev-hero">
        <picture>
          <source media="(max-width: 860px)" srcSet={img("hero-960.webp")} />
          <img className="ev-hero__img" src={img("hero.webp")} alt="Woman waking up rested in bed with a cup of tea" fetchPriority="high" width={1920} height={1088} />
        </picture>
        <div className="nn-container ev-hero__inner">
          <div className="ev-hero__copy">
            {offer.enabled && <span className="nn-badge">{offer.label} · any formula</span>}
            <h1 style={{ marginTop: 18 }}>Feel even again.</h1>
            <p className="nn-lead">Clean, honest formulas for the sleepless nights, cramps and bloat women are told to just live with.*</p>
            <div className="nn-hero__ctas">
              <a className="nn-btn nn-btn--lg" href="#build">Build your 3</a>
              <a className="nn-btn nn-btn--ghost nn-btn--lg" href="#nn-quiz">Find my formula</a>
            </div>
            <ul className="nn-hero__proof">
              <li><Icon name="check" size={18} /> Made in the USA, cGMP</li>
              <li><Icon name="check" size={18} /> Every dose listed</li>
              <li><Icon name="check" size={18} /> {b.guarantee_days}-day guarantee</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="ev-offer-band" aria-hidden="true">
        <div className="ev-offer-band__track">{[...marquee, ...marquee].map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>

      {/* concerns */}
      <section className="nn-section nn-container" aria-labelledby="nn-concerns-title">
        <div className="nn-section__head">
          <p className="nn-eyebrow">Shop by what hurts</p>
          <h2 id="nn-concerns-title">What&apos;s keeping you from feeling like you?</h2>
        </div>
        <div className="nn-concern-grid">
          {concerns.map((c) => (
            <Link key={c.slug} className="nn-concern" href={`/product-category/${c.slug}/`} style={{ ["--accent" as string]: c.color }}>
              <img className="nn-concern__img" src={img(c.image)} alt="" loading="lazy" width={960} height={1280} />
              <span className="nn-concern__name">{c.name}</span>
              <span className="nn-concern__tag">{c.tagline}</span>
              <span className="nn-concern__go">Shop {c.menu_label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* build your 3 */}
      <section className="nn-section ev-build" id="build" aria-labelledby="ev-build-title">
        <div className="nn-container">
          <div className="nn-section__head">
            <p className="nn-eyebrow">{offer.label}</p>
            <h2 id="ev-build-title">Build your 3. Pay for 2.</h2>
            <p>Mix any three formulas into your own routine. The cheapest one is on us.</p>
          </div>
          <BuildYour3 products={singles} label={offer.label} />
        </div>
      </section>

      {/* kits */}
      <section className="nn-section nn-container" aria-labelledby="nn-best-title">
        <div className="nn-section__head nn-section__head--row">
          <div>
            <p className="nn-eyebrow">Ready-made routines</p>
            <h2 id="nn-best-title" style={{ marginBottom: 0 }}>Bestselling kits</h2>
          </div>
          <Link className="nn-btn nn-btn--ghost" href="/shop/">Shop all</Link>
        </div>
        <ProductGrid products={kits} columns={4} />
      </section>

      {/* lineup */}
      <section className="nn-section ev-lineup" aria-labelledby="ev-lineup-title">
        <div className="nn-container ev-lineup__grid">
          <img className="ev-lineup__img" src={img("lineup.webp")} alt="Evenly Sleep, Cycle, Digest and Calm bottles" loading="lazy" width={1920} height={1088} />
          <div>
            <p className="nn-eyebrow">One brand for your whole month</p>
            <h2 id="ev-lineup-title">Every hard day has a formula.</h2>
            <ul>
              {singles.slice(0, 4).map((p) => (
                <li key={p.slug}><b style={{ background: p.accent }}>{p.shortName}</b> {p.tagline}</li>
              ))}
            </ul>
            <a className="nn-btn" href="#build">Build your 3</a>
          </div>
        </div>
      </section>

      <Quiz links={quizLinks} />

      {/* difference */}
      <section className="nn-section nn-container" aria-labelledby="nn-diff-title">
        <div className="nn-section__head">
          <p className="nn-eyebrow">Why women switch</p>
          <h2 id="nn-diff-title">Not another drugstore bottle.</h2>
        </div>
        <div className="nn-table-wrap">
          <table className="nn-compare">
            <thead><tr><td /><th scope="col">Typical drugstore</th><th scope="col" className="nn-compare__us">Evenly</th></tr></thead>
            <tbody>
              {[
                ["Melatonin dose", 'Often 5–10 mg, the "groggy tomorrow" dose', "Low dose, paired with magnesium"],
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
      <section className="nn-section nn-section--ink" aria-labelledby="nn-how-title">
        <div className="nn-container">
          <div className="nn-section__head"><h2 id="nn-how-title">How it works</h2></div>
          <ol className="nn-steps">
            {[
              ["Pick what hurts", "Sleep, cramps, bloating or stress. Or take the 30-second quiz."],
              ["Build your 3", "Mix any three formulas. The cheapest one is free."],
              ["Give it 30 days", "Most women feel a difference within weeks. If you don't, we refund your first order."],
            ].map(([h, p], i) => (
              <li key={h}><span className="nn-steps__num" aria-hidden="true">0{i + 1}</span><h3>{h}</h3><p>{p}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* guarantee */}
      <section className="nn-section nn-container" aria-labelledby="nn-guarantee-title">
        <div className="nn-guarantee">
          <div className="nn-guarantee__seal" aria-hidden="true"><span>{b.guarantee_days}</span><small>DAYS</small></div>
          <div>
            <h2 id="nn-guarantee-title">Feel the difference, or it&apos;s free.</h2>
            <p>Try your first order for a full cycle. If it isn&apos;t helping, email us and we&apos;ll refund you. No forms, and no need to send the bottle back.</p>
            <Link href="/refund-policy/">Read the guarantee</Link>
          </div>
        </div>
      </section>

      {/* journal */}
      <section className="nn-section nn-section--tint" aria-labelledby="nn-journal-title">
        <div className="nn-container">
          <div className="nn-section__head nn-section__head--row">
            <h2 id="nn-journal-title" style={{ marginBottom: 0 }}>The Journal</h2>
            <Link className="nn-btn nn-btn--ghost" href="/journal/">All articles</Link>
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

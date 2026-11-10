import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Slices } from "@/components/Slices";
import { ProductGrid } from "@/components/ProductGrid";
import { BuildYour3 } from "@/components/AddToCart";
import { Quiz } from "@/components/Quiz";
import { Faq } from "@/components/Faq";
import { PostCard } from "@/components/PostCard";
import { getBusiness, getConcerns, getDoc, getDocs, getOffer, getProducts, img, toCard } from "@/lib/site";

export function generateMetadata(): Metadata {
  const home = getDoc("home");
  return { title: { absolute: home?.seoTitle ?? "evenly" }, description: home?.description };
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
  const marquee = [offer.label, `Free US shipping over $${b.free_ship_min}`, `${b.guarantee_days}-day money-back guarantee`, "Ingredients and warnings on every product page"];
  const lineup = ["evenly-sleep-low-dose-sleep-formula", "evenly-cycle-womens-balance", "evenly-digest-digestive-enzymes", "evenly-calm-ashwagandha"]
    .map((s) => singles.find((p) => p.slug === s))
    .filter(Boolean) as typeof singles;

  return (
    <main id="main" className="nn-main nn-home">
      {/* hero: promise + actions first on mobile, then the photo */}
      <section className="ev-hero" aria-labelledby="ev-hero-title">
        <div className="nn-container ev-hero__grid">
          <div className="ev-hero__copy">
            {offer.enabled && <span className="nn-badge">{offer.label} on any formula</span>}
            <h1 id="ev-hero-title">Feel even again.</h1>
            <p className="nn-lead">Clean, honest formulas for the sleepless nights, cramps and bloat women are told to just live with.*</p>
            <ul className="ev-hero__needs" aria-label="Shop by need">
              {concerns.map((c) => (
                <li key={c.slug}>
                  <Link href={`/product-category/${c.slug}/`}><i style={{ ["--dot" as string]: c.color }} />{c.menu_label}</Link>
                </li>
              ))}
            </ul>
            <div className="nn-hero__ctas">
              <a className="nn-btn nn-btn--lg" href="#build">Build your 3</a>
              <a className="nn-btn nn-btn--secondary nn-btn--lg" href="#nn-quiz">Find my formula</a>
            </div>
            <ul className="nn-hero__proof">
              <li><Icon name="check" size={18} /> {b.guarantee_days}-day money-back guarantee</li>
              <li><Icon name="check" size={18} /> Free US shipping over ${b.free_ship_min}</li>
            </ul>
          </div>
          <div className="ev-hero__visual">
            <Slices />
            <picture>
              <source media="(max-width: 900px)" srcSet={img("hero-960.webp")} />
              <img className="ev-hero__photo" src={img("hero.webp")} alt="Woman waking up rested in bed with a cup of tea" fetchPriority="high" width={1920} height={1088} />
            </picture>
            <img className="ev-hero__product" src={img("p-sleep.webp")} alt="evenly Sleep bottle (packaging render)" width={1000} height={1000} />
          </div>
        </div>
      </section>

      <div className="ev-offer-band" aria-hidden="true">
        <div className="ev-offer-band__track">{[...marquee, ...marquee].map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>

      {/* concerns */}
      <section className="nn-section nn-container" aria-labelledby="nn-concerns-title">
        <div className="nn-section__head">
          <p className="nn-eyebrow">Shop by what you need</p>
          <h2 id="nn-concerns-title">What&apos;s keeping you from feeling like you?</h2>
        </div>
        <div className="nn-concern-grid">
          {concerns.map((c) => (
            <Link key={c.slug} className="nn-concern" href={`/product-category/${c.slug}/`} style={{ ["--accent" as string]: c.color }}>
              <img className="nn-concern__img" src={img(c.image)} alt="" loading="lazy" decoding="async" width={960} height={720} />
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
            <p>Mix any three formulas into your own routine. The lowest-priced one is on us.</p>
          </div>
          <BuildYour3 products={singles} label={offer.label} />
        </div>
      </section>

      {/* kits */}
      <section className="nn-section nn-container" aria-labelledby="nn-best-title">
        <div className="nn-section__head nn-section__head--row">
          <div>
            <p className="nn-eyebrow">Ready-made routines</p>
            <h2 id="nn-best-title" style={{ marginBottom: 0 }}>Kits for the hard days</h2>
          </div>
          <Link className="nn-btn nn-btn--secondary" href="/shop/">Shop all</Link>
        </div>
        <ProductGrid products={kits} columns={4} />
      </section>

      {/* lineup */}
      <section className="nn-section ev-lineup" aria-labelledby="ev-lineup-title">
        <div className="nn-container ev-lineup__grid">
          <img className="ev-lineup__img" src={img("lineup.webp")} alt="evenly Sleep, Cycle, Digest and Calm bottles (packaging render)" loading="lazy" decoding="async" width={1920} height={1088} />
          <div>
            <p className="nn-eyebrow">One brand for your whole month</p>
            <h2 id="ev-lineup-title">A formula for each hard day.</h2>
            <ul>
              {lineup.map((p) => (
                <li key={p.slug}><b style={{ background: p.accent }}>{p.shortName}</b> <span>{p.tagline}</span></li>
              ))}
            </ul>
            <a className="nn-btn" href="#build">Build your 3</a>
          </div>
        </div>
      </section>

      <Quiz links={quizLinks} />

      {/* what to look for */}
      <section className="nn-section nn-container" aria-labelledby="ev-look-title">
        <div className="nn-section__head">
          <p className="nn-eyebrow">Before you buy any supplement</p>
          <h2 id="ev-look-title">What to look for in your supplements</h2>
          <p>Four checks we&apos;d use on any brand, including ours.</p>
        </div>
        <ul className="ev-criteria">
          <li style={{ ["--dot" as string]: "#EE91AC" }}>
            <h3>The form of the nutrient</h3>
            <p>Magnesium oxide is cheap but poorly absorbed and often has a laxative effect. Glycinate is gentler on the stomach.</p>
            <p><strong>evenly:</strong> <Link href="/product/evenly-unwind-magnesium-glycinate/">Unwind</Link> uses magnesium glycinate.</p>
          </li>
          <li style={{ ["--dot" as string]: "#FF735E" }}>
            <h3>Ingredients you can see</h3>
            <p>&quot;Proprietary blends&quot; can hide how much of each ingredient you&apos;re getting.</p>
            <p><strong>evenly:</strong> every product page lists the ingredients, and amounts from each verified label.</p>
          </li>
          <li style={{ ["--dot" as string]: "#FFC857" }}>
            <h3>Who shouldn&apos;t take it</h3>
            <p>Some herbs and hormones interact with birth control, antidepressants or blood thinners.</p>
            <p><strong>evenly:</strong> each product has a Safety section with specific warnings.</p>
          </li>
          <li style={{ ["--dot" as string]: "#123D38" }}>
            <h3>What happens if it&apos;s not for you</h3>
            <p>Supplements don&apos;t work the same for everyone.</p>
            <p><strong>evenly:</strong> your first order is covered by a <Link href="/refund-policy/">{b.guarantee_days}-day money-back guarantee</Link>.</p>
          </li>
        </ul>
      </section>

      {/* how */}
      <section className="nn-section nn-section--ink" aria-labelledby="nn-how-title">
        <div className="nn-container">
          <div className="nn-section__head"><h2 id="nn-how-title">How it works</h2></div>
          <ol className="nn-steps">
            {[
              ["Pick what you need", "Sleep, period comfort, bloating or stress. Or take the 30-second quiz."],
              ["Build your 3, or buy one", "Any three single formulas: the lowest-priced one is free. One formula on its own is fine too."],
              ["Give it a fair try", "Some formulas take a full cycle or more. If your first order isn't for you, we refund it."],
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
            <h2 id="nn-guarantee-title">Try it. If it&apos;s not for you, we refund it.</h2>
            <p>Your first order is covered for {b.guarantee_days} days after delivery. Email us and we&apos;ll refund the product cost. No need to send the bottle back.</p>
            <Link href="/refund-policy/">Read the refund policy</Link>
          </div>
        </div>
      </section>

      {/* journal */}
      <section className="nn-section nn-section--tint" aria-labelledby="nn-journal-title">
        <div className="nn-container">
          <div className="nn-section__head nn-section__head--row">
            <h2 id="nn-journal-title" style={{ marginBottom: 0 }}>The Journal</h2>
            <Link className="nn-btn nn-btn--secondary" href="/journal/">All articles</Link>
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

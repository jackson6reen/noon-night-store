import Link from "next/link";
import { getProducts } from "@/lib/woo";
import { NEEDS, findProduct, formatPrice, type Need } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductVisual } from "@/components/ProductVisual";
import { AddToCart } from "@/components/AddToCart";

export default async function Home() {
  const products = await getProducts();
  const reset = findProduct("the-24-hour-reset", products)!;
  const noon = products.filter((p) => p.line === "noon");
  const night = products.filter((p) => p.line === "night");

  return (
    <>
      {/* HERO: Instant Identifier + Question Loop */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FCE9C4] via-cream to-[#DCDDF2]" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="eyebrow">An important question for anyone who&apos;s bloated by 3 p.m. and wide awake at 2 a.m.</p>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] sm:text-6xl">
              What if your belly and your sleep were the <em className="text-sun-deep">same</em> problem?
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink/75">
              If you could flatten the afternoon bloat <b>and</b> sleep through the night, without another antacid,
              another 10&nbsp;mg melatonin, or another doctor shrugging &ldquo;it&apos;s just stress&rdquo;, would you finally feel like yourself again?
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/reset" className="btn btn-night">See the 24-Hour Reset</Link>
              <Link href="/shop" className="btn btn-ghost">Shop by need</Link>
            </div>
            <p className="mt-6 text-sm text-ink/60">Ships from the U.S. · Free shipping over $50 · 30-Night guarantee</p>
          </div>
          <div className="mx-auto w-full max-w-md">
            <ProductVisual product={reset} large />
          </div>
        </div>
      </section>

      {/* SHOP BY NEED */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="eyebrow">Shop by need</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">What&apos;s keeping you up?</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {(Object.keys(NEEDS) as Need[]).map((n) => (
            <Link
              key={n}
              href={`/shop?need=${n}`}
              className="rounded-3xl border border-ink/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="font-display text-xl">{NEEDS[n].label}</h3>
              <p className="mt-2 text-sm text-ink/60">{NEEDS[n].blurb}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-sun-deep">Shop →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* MOMENT OF HIGHEST TENSION + NEGATIVE HOOK */}
      <section className="bg-night text-cream">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2">
          <div>
            <p className="eyebrow !text-sun">Sound familiar?</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">You eat a normal salad at lunch. By 3 p.m. you&apos;re unbuttoning your jeans under the desk.</h2>
            <div className="prose-copy [&_p]:text-cream/75">
              <p>Then at night you&apos;re exhausted, but the second your head hits the pillow your brain starts replaying emails. You finally drift off around 1, wake at 3:40, and stare at the ceiling until the alarm.</p>
              <p>So you take a gas pill for the belly and a melatonin for the sleep, and treat them like two separate problems. That&apos;s exactly why nothing sticks.</p>
            </div>
          </div>
          <div className="rounded-3xl bg-night-soft p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-sun">The hidden cause</p>
            <h3 className="mt-3 font-display text-3xl">Gut-Clock Drift</h3>
            <p className="mt-4 leading-relaxed text-cream/80">
              Your gut runs on a clock, just like your sleep. Digestion is meant to peak around midday and power down at night,
              while your body does its repair work. Late meals, stress and short sleep pull the two clocks apart, and the drift feeds
              itself: a sluggish gut ferments food into afternoon gas, and an unsettled gut keeps your nervous system &ldquo;on&rdquo; at night.
              Poor sleep then makes tomorrow&apos;s digestion worse.
            </p>
            <p className="mt-4 leading-relaxed text-cream/80">
              <b className="text-cream">It&apos;s not your fault, and it&apos;s not &ldquo;just aging.&rdquo;</b> You&apos;ve been fixing one end of the clock at a time.
            </p>
          </div>
        </div>
      </section>

      {/* BLUE OCEAN BRIDGE: POSITIVE HOOK */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">The Noon Night method</p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl">Day-Night Sync</h2>
          <p className="mt-5 text-lg text-ink/75">
            Support digestion when your gut is meant to work, and help your body switch off when it&apos;s meant to rest.
            Two short routines, one at noon and one at night, that pull both clocks back in line.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-br from-[#FCE9C4] to-[#F8DDA6] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sun-deep">☀ Noon line</p>
            <h3 className="mt-2 font-display text-2xl">Help your gut do its day job.</h3>
            <p className="mt-3 text-ink/70">Enzymes with meals, a morning probiotic and an adaptogen for calm focus, so food moves along instead of sitting there.</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-[#3A3E86] to-[#1F2150] p-8 text-cream">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">☾ Night line</p>
            <h3 className="mt-2 font-display text-2xl">Help your body actually switch off.</h3>
            <p className="mt-3 text-cream/75">Gentle magnesium, low-dose sleep gummies and overnight gut support, so you fall asleep, stay asleep and wake up clear.</p>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">☀ The Noon line</h2>
          <Link href="/shop?line=noon" className="text-sm underline underline-offset-4">View all</Link>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {noon.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
        <div className="mt-20 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">☾ The Night line</h2>
          <Link href="/shop?line=night" className="text-sm underline underline-offset-4">View all</Link>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {night.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* PRODUCT REVEAL: BUNDLE */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-sand p-8 md:grid-cols-2 md:p-12">
          <ProductVisual product={reset} large />
          <div>
            <p className="eyebrow">Introducing</p>
            <h2 className="mt-3 font-display text-4xl">The 24-Hour Reset</h2>
            <p className="mt-4 text-lg text-ink/75">{reset.shortDescription}</p>
            <ul className="mt-6 space-y-2">
              {reset.benefits.map((b) => <li key={b} className="flex gap-2"><span className="text-sun-deep">✓</span>{b}</li>)}
            </ul>
            <p className="mt-6 text-2xl tabular-nums">
              {reset.compareAt && <s className="mr-3 text-lg text-ink/40">{formatPrice(reset.compareAt)}</s>}
              {formatPrice(reset.price)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <AddToCart product={reset} label="Add the Reset kit" />
              <Link href="/reset" className="btn btn-ghost">How it works</Link>
            </div>
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-sun-deep font-display text-2xl text-sun-deep">30</div>
        <h2 className="mt-6 font-display text-3xl sm:text-4xl">The 30-Night Rest-Easy Guarantee</h2>
        <p className="mt-4 text-lg text-ink/75">
          Take your Noon Night routine for 30 nights. If your afternoons don&apos;t feel lighter and your nights don&apos;t feel calmer,
          email us and we&apos;ll refund your first order. No forms, no return shipping, no hard feelings.
        </p>
      </section>
    </>
  );
}

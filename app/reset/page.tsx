import Link from "next/link";
import type { Metadata } from "next";
import { getProducts } from "@/lib/woo";
import { FDA_DISCLAIMER, findProduct, formatPrice } from "@/lib/products";
import { ProductVisual } from "@/components/ProductVisual";
import { AddToCart } from "@/components/AddToCart";

export const metadata: Metadata = {
  title: "The 24-Hour Reset",
  description: "A day-and-night supplement routine for occasional bloating and restless sleep.",
};

const REASONS = [
  {
    t: "You've been treating two clocks as two problems.",
    b: "A gas pill at 3 p.m. and a melatonin at 11 p.m. each fix one end. Gut-Clock Drift lives in the space between them.",
  },
  {
    t: "Your melatonin is probably dosed like a sledgehammer.",
    b: "A lot of store-shelf melatonin comes in 5–10 mg. More isn't better: it's a big reason people wake up groggy and quit.",
  },
  {
    t: "\"Just eat more fiber\" can make the bloat worse.",
    b: "If food isn't being broken down well to begin with, piling on fiber gives the gas-producing bacteria more to ferment.",
  },
  {
    t: "Your magnesium might be the wrong kind.",
    b: "Cheap magnesium oxide is famous for one thing, and it's a trip to the bathroom. Glycinate is the gentle, absorbable form.",
  },
];

const TOUR = [
  { slug: "noon-flora", when: "7 a.m.", h: "A calmer gut crew, every morning", b: "10 strains, 40 billion CFU, in a delayed-release capsule. It's the foundation: a more balanced gut makes everything else easier." },
  { slug: "noon-digest", when: "With lunch & dinner", h: "Lunch that doesn't come back to haunt you at 3 p.m.", b: "Take one with your first bite. Seven enzymes help break down protein, fat, carbs, dairy and fiber, so there's less left over to ferment into gas." },
  { slug: "night-calm", when: "9:30 p.m.", h: "Shoulders down, brain off", b: "Magnesium glycinate supports muscle relaxation and a calmer mood. It's the 'exhale' your nervous system has been waiting for all day." },
  { slug: "night-deep-rest", when: "10 p.m.", h: "Fall asleep and wake up clear", b: "Low-dose melatonin with L-theanine and chamomile. Built to help you drift off and stay down, without the 7 a.m. fog." },
];

const FAQ = [
  { q: "I've tried probiotics and melatonin before. Why would this be different?", a: "Because you tried them one at a time, on one end of the clock. The 24-Hour Reset is built around Gut-Clock Drift: daytime digestion and nighttime recovery, supported together, every day. Most people who \"tried everything\" never tried both ends at once." },
  { q: "What if I only have the bloating, or only the sleep problem?", a: "Great question, and it's often the sign they're linked. Many people notice the second issue only once the first one improves. If you really want just one end, the Noon and Night products are sold individually too." },
  { q: "Isn't bloating just something that comes with age?", a: "Getting older can change digestion, but feeling like a balloon every afternoon is not a life sentence. Supporting enzyme activity and gut balance is one of the simplest changes you can make." },
  { q: "How is this different from what's at the drugstore?", a: "Drugstore products tend to mask a symptom for a few hours. The Reset is a daily routine designed to support the underlying rhythm, with gentler forms (glycinate, low-dose melatonin) that you can stay on." },
  { q: "How long until I notice something?", a: "Many people notice digestion first, often within the first week or two. Sleep changes tend to build over 2–4 weeks as the routine settles in. That's why the guarantee is 30 nights, not 7." },
  { q: "I don't have time for a complicated routine.", a: "It's four moments: one capsule at breakfast, one with your two main meals, and three at bedtime. Keep the Noon bottles at your desk and the Night bottles on your nightstand." },
  { q: "Is it safe with my medications?", a: "Our supplements are made in FDA-registered, cGMP facilities, but you know your body and your prescriptions best. Please check with your doctor or pharmacist before starting, especially if you're pregnant, nursing or on medication." },
  { q: "What if it doesn't work for me?", a: "Then you shouldn't pay for it. Email us within 30 nights of delivery and we'll refund your first order. No forms, and you don't have to ship anything back." },
];

const PERFECT_IF = [
  "You're just starting to deal with afternoon bloating and want to get ahead of it the right way.",
  "You've been fighting gas and bad sleep for years and want to fix it once and for all.",
  "You've already tried a probiotic or melatonin on its own and felt it \"sort of\" helped.",
  "You're willing to take a few capsules a day for 30 days.",
  "You're already spending money on antacids, gas pills or sleep aids every month.",
  "You're worried about getting hooked on strong sleep meds.",
  "You want lighter afternoons and deeper nights, not just one or the other.",
  "You'd love to wake up one morning this month feeling rested, flat-bellied and clear.",
  "You're ready to try it risk-free for 30 nights.",
];

export default async function ResetPage() {
  const products = await getProducts();
  const reset = findProduct("the-24-hour-reset", products)!;

  const Offer = ({ dark = false }: { dark?: boolean }) => (
    <div className={`mx-auto max-w-md rounded-3xl p-6 text-center ${dark ? "bg-night-soft text-cream" : "bg-white shadow-sm ring-1 ring-ink/10"}`}>
      <p className="font-display text-2xl">The 24-Hour Reset · 30-day kit</p>
      <p className="mt-2 text-3xl tabular-nums">
        {reset.compareAt && <s className="mr-3 text-xl opacity-50">{formatPrice(reset.compareAt)}</s>}
        {formatPrice(reset.price)}
      </p>
      <p className={`mt-1 text-sm ${dark ? "text-cream/70" : "text-ink/60"}`}>4 products · free U.S. shipping · 30-Night guarantee</p>
      <AddToCart product={reset} label="Yes, start my Reset" className="mt-5" />
    </div>
  );

  return (
    <article>
      {/* 1–3: Instant identifier, question loop, lead */}
      <header className="bg-gradient-to-b from-[#FCE9C4] to-cream">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-16 text-center">
          <p className="eyebrow">Important question for anyone over 35 who&apos;s bloated by afternoon and restless by midnight</p>
          <h1 className="mt-5 font-display text-4xl leading-tight sm:text-6xl">
            What&apos;s the one difference between people who feel light all day and sleep all night, and the rest of us?
          </h1>
          <p className="mt-6 text-lg text-ink/75">
            If you guessed willpower, you&apos;d be wrong. If you guessed a stricter diet, wrong again. Same with &ldquo;just get more sleep.&rdquo;
            The real answer is less obvious, and once you see it you can&apos;t un-see it.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4">
        {/* 4: Moment of highest tension */}
        <section className="prose-copy py-12">
          <h2 className="font-display text-3xl">Let&apos;s be honest about what a normal day looks like right now</h2>
          <p>You wake up already tired. Coffee. A quick breakfast. By lunch you&apos;re fine, and by 3 p.m. you&apos;re quietly loosening your belt, hoping nobody in the meeting hears your stomach.</p>
          <p>You skip the dessert you wanted. You wear the stretchy pants &ldquo;just in case.&rdquo; You&apos;ve Googled &ldquo;why am I so bloated&rdquo; more times than you&apos;d admit.</p>
          <p>Then night comes. You&apos;re exhausted, but the second the lights go off your brain starts its second shift. You check the clock at 12:40. Then 3:15. Then the alarm.</p>
          <p>And the next day it starts again, a little worse, because a short night makes your gut sluggish and a sluggish gut makes the next night harder.</p>
        </section>

        {/* 5: Moment of highest pleasure */}
        <section className="prose-copy rounded-3xl bg-sand p-8">
          <h2 className="font-display text-3xl">You&apos;ve done the work. You <em>should</em> feel better than this.</h2>
          <p>You eat reasonably. You&apos;ve cut back on the late-night snacks. You bought the blackout curtains. Someone who&apos;s tried this hard should be able to eat lunch and forget about it, fall asleep within 20 minutes, and wake up before the alarm actually feeling rested.</p>
          <p>That&apos;s not a fantasy. That&apos;s how your body is designed to run when its two clocks are in sync.</p>
        </section>

        {/* 6: Why it's not your fault + belief installation */}
        <section className="py-14">
          <h2 className="font-display text-3xl">4 reasons you&apos;re still stuck (none of them are your fault)</h2>
          <div className="mt-8 space-y-6">
            {REASONS.map((r, i) => (
              <div key={r.t} className="flex gap-5">
                <span className="font-display text-4xl text-sun-deep">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{r.t}</h3>
                  <p className="mt-1 text-ink/75">{r.b}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-3xl bg-night p-8 text-cream">
            <p className="text-sm uppercase tracking-[0.2em] text-sun">The real culprit</p>
            <h3 className="mt-2 font-display text-3xl">Gut-Clock Drift</h3>
            <p className="mt-3 leading-relaxed text-cream/80">
              Your digestion and your sleep run on linked daily rhythms. When they drift apart, food sits and ferments by day,
              and an unsettled gut keeps your body on alert by night. Each side drags the other further out of sync.
              Fixing one side at a time is like pushing one pedal of a bike.
            </p>
          </div>
        </section>

        {/* 7: Blue ocean bridge */}
        <section className="prose-copy pb-14 text-center">
          <p className="eyebrow">The fix</p>
          <h2 className="mt-2 font-display text-4xl">Day-Night Sync</h2>
          <p>Support digestion during the day, when your gut is meant to work. Help your body power down at night, when it&apos;s meant to rest and repair. Do both every day, and the two clocks start pulling in the same direction again.</p>
          <p>Lighter afternoons. Easier evenings. Deeper nights. Clearer mornings. Better digestion the next day. And round it goes, the right way this time.</p>
        </section>
      </div>

      {/* 10: Product reveal */}
      <section className="bg-night text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
          <ProductVisual product={reset} large />
          <div>
            <p className="eyebrow !text-sun">Introducing</p>
            <h2 className="mt-3 font-display text-5xl">The 24-Hour Reset</h2>
            <p className="mt-5 text-lg text-cream/80">
              Four products, two routines, one goal: get your day clock and your night clock back in sync, so you can eat
              without bracing for the bloat and sleep without watching the clock.
            </p>
            <div className="mt-8"><Offer dark /></div>
          </div>
        </div>
      </section>

      {/* 11: Product tour */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="text-center font-display text-4xl">A day on the Reset</h2>
        <div className="mt-12 space-y-10">
          {TOUR.map((t) => {
            const p = findProduct(t.slug, products)!;
            return (
              <div key={t.slug} className="grid items-center gap-8 sm:grid-cols-[200px_1fr]">
                <ProductVisual product={p} />
                <div>
                  <p className="eyebrow">{t.when} · {p.name}</p>
                  <h3 className="mt-2 font-display text-2xl">{t.h}</h3>
                  <p className="mt-2 text-ink/75">{t.b}</p>
                  <Link href={`/products/${p.slug}`} className="mt-3 inline-block text-sm underline underline-offset-4">Ingredients &amp; details</Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 12: Guarantee */}
      <section className="bg-sand">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-sun-deep font-display text-3xl text-sun-deep">30</div>
          <h2 className="mt-6 font-display text-4xl">The 30-Night Rest-Easy Guarantee</h2>
          <p className="mt-5 text-lg text-ink/75">
            We&apos;re confident in Day-Night Sync, so here&apos;s the deal. Follow the Reset routine for 30 nights: morning probiotic, enzymes with meals, magnesium and gummies at bedtime.
            You should notice lighter afternoons and calmer, deeper nights. If you don&apos;t, email us within 30 days of delivery and we&apos;ll refund your first order in full.
            You don&apos;t need to fill in a form or ship anything back.
          </p>
        </div>
      </section>

      {/* 13: Upgraded FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="font-display text-4xl">Smart questions people ask right before they feel better</h2>
        <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {FAQ.map((f) => (
            <details key={f.q} className="py-5">
              <summary className="cursor-pointer list-none text-lg font-semibold">{f.q}</summary>
              <p className="mt-3 leading-relaxed text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 14: Perfect for you if */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="font-display text-4xl">You&apos;re ready for the Reset if…</h2>
        <ul className="mt-8 space-y-3">
          {PERFECT_IF.map((p) => (
            <li key={p} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink/10"><span className="text-sun-deep">✓</span>{p}</li>
          ))}
        </ul>
        <p className="mt-6 text-ink/70">If you said &ldquo;yes&rdquo; to at least six of those, you&apos;re exactly who we built this for.</p>
      </section>

      {/* 16: Risk mitigator + 15: Final confident appeal */}
      <section className="bg-night text-cream">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="font-display text-3xl sm:text-4xl">Most people reading this will close the tab and &ldquo;think about it.&rdquo;</h2>
          <p className="mt-5 text-cream/80">
            And next month looks the same: another $30 on antacids and sleep aids, another wedding where you can&apos;t enjoy dinner,
            another Monday on four and a half hours of sleep. The real risk isn&apos;t trying the Reset. It&apos;s another month of drift.
          </p>
          <p className="mt-8 font-display text-2xl">So here&apos;s the answer to the question at the top of this page.</p>
          <p className="mt-3 text-cream/80">
            The difference between people who feel light all day and sleep all night and everyone else isn&apos;t willpower or genetics.
            It&apos;s whether their day clock and night clock are in sync. That&apos;s what the 24-Hour Reset is for.
          </p>
          <ul className="mt-6 space-y-2 text-cream/85">
            <li>If you&apos;ve unbuttoned your pants after lunch this week, you need the Reset.</li>
            <li>If you&apos;ve woken up at 3 a.m. and couldn&apos;t get back to sleep, you need the Reset.</li>
            <li>If your nightstand looks like a pharmacy shelf, you need the Reset.</li>
            <li>If you just want to feel like yourself again, you need the Reset.</li>
          </ul>
          <div className="mt-12"><Offer dark /></div>
          <p className="mt-10 text-xs leading-relaxed text-cream/50">{FDA_DISCLAIMER} Individual results vary.</p>
        </div>
      </section>
    </article>
  );
}

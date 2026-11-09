"use client";

import Link from "next/link";
import { useState } from "react";

/** Same questions and scoring as template-parts/home/quiz.php + main.js. Nothing is stored or sent. */
const QUESTIONS: { q: string; a: [string, string][] }[] = [
  { q: "What bothers you most right now?", a: [
    ["I can't fall asleep, or I wake up at 3 a.m.", "sleep"],
    ["Cramps, PMS or my period wipes me out", "period-comfort"],
    ["I'm bloated or gassy most days", "bloating-gut"],
    ["I'm stressed and can't switch off", "stress-calm"],
  ] },
  { q: "When is it worst?", a: [
    ["At night", "sleep"],
    ["The week before or during my period", "period-comfort"],
    ["After meals", "bloating-gut"],
    ["All day, it builds up", "stress-calm"],
  ] },
  { q: "Does anything else tag along?", a: [
    ["Tired but wired at bedtime", "sleep"],
    ["Bloating around my period", "period-comfort"],
    ["Irregular or uncomfortable digestion", "bloating-gut"],
    ["More than one of these, honestly", "bundles"],
  ] },
];

export function Quiz({ links }: { links: Record<string, { url: string; name: string }> }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const step = answers.length;

  let result: { url: string; name: string } | null = null;
  if (step === QUESTIONS.length) {
    const score: Record<string, number> = {};
    answers.forEach((v, i) => (score[v] = (score[v] ?? 0) + (i === 0 ? 2 : 1)));
    let best = Object.keys(score).sort((a, b) => score[b] - score[a])[0];
    if ((Object.keys(score).length >= 3 && Math.max(...Object.values(score)) < 3) || best === "bundles") best = "bundles";
    result = links[best] ?? Object.values(links)[0];
  }

  return (
    <section className="nn-section nn-container" id="nn-quiz" aria-labelledby="nn-quiz-title">
      <div className="nn-quiz">
        <div className="nn-quiz__intro">
          <p className="nn-eyebrow">30-second match</p>
          <h2 id="nn-quiz-title">Not sure where to start?</h2>
          <p>Answer three quick questions and we&apos;ll point you to the routine that fits.</p>
        </div>
        <div className="nn-quiz__form">
          {result ? (
            <div className="nn-quiz__result" aria-live="polite">
              <p className="nn-eyebrow">Your best place to start</p>
              <p className="nn-quiz__result-name">{result.name}</p>
              <Link className="nn-btn nn-btn--lg" href={result.url}>See my routine</Link>
              <button type="button" className="nn-link-btn" onClick={() => setAnswers([])}>Start over</button>
            </div>
          ) : (
            <fieldset className="nn-quiz__step" key={step}>
              <legend><span className="nn-quiz__count">{step + 1} / {QUESTIONS.length}</span> {QUESTIONS[step].q}</legend>
              {QUESTIONS[step].a.map(([label, value]) => (
                <label className="nn-quiz__option" key={label}>
                  <input type="radio" name={`q${step}`} value={value} onChange={() => setTimeout(() => setAnswers((a) => [...a, value]), 150)} />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
          )}
        </div>
      </div>
    </section>
  );
}

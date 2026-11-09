/** Accessible <details> FAQ + FAQPage JSON-LD (same markup as nn_render_faq). */
export function Faq({ items, schema = true }: { items: [string, string][]; schema?: boolean }) {
  if (!items?.length) return null;
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <>
      <div className="nn-faq">
        {items.map(([q, a]) => (
          <details className="nn-faq__item" key={q}>
            <summary>{q}</summary>
            <div className="nn-faq__answer"><p>{a}</p></div>
          </details>
        ))}
      </div>
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      )}
    </>
  );
}

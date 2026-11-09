import { studioFaqs } from "@/data/faqs";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="section-pad border-t border-line scroll-mt-20"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">FAQ</p>
        <h2
          id="faq-heading"
          className="section-title mt-3"
        >
          Common questions
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Straight answers about how this studio works — same facts as the rest
          of the site.
        </p>
        <ul className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
          {studioFaqs.map((faq) => (
            <li key={faq.id} className="py-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {faq.answer}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

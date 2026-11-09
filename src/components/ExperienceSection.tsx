import { experience } from "@/data/experience";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="section-pad border-t border-line scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Experience</p>
        <h2 className="section-title mt-3">Jobs & worker history</h2>
        <p className="mt-4 max-w-2xl text-muted">
          Not a hiring board — roles from the resume. Mobile apps for startups,
          store CI/CD, cloud backends, and remote freelance for global clients.
          One builder, end to end.
        </p>
        <ol className="mt-12 space-y-0 border-l border-line pl-6 sm:pl-8">
          {experience.map((item) => (
            <li key={item.id} className="relative pb-10 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[1.9rem] top-1.5 h-2.5 w-2.5 rounded-full border border-accent bg-bg sm:-left-[2.4rem]"
              />
              <p className="text-xs uppercase tracking-[0.14em] text-accent">
                {item.period}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-ink/80">{item.org}</p>
              {item.highlights?.length ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {item.highlights.map((label) => (
                    <li
                      key={label}
                      className="border border-line bg-bg-elevated px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-2 max-w-2xl text-sm text-muted">{item.detail}</p>
              <ul className="mt-3 max-w-2xl space-y-2">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-muted">
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                    />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

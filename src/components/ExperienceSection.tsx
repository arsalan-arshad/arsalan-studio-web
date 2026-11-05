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
        <p className="mt-4 max-w-xl text-muted">
          Not a hiring board — roles from the resume. One builder, end to end.
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
              <p className="mt-2 max-w-2xl text-sm text-muted">{item.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

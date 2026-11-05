const steps = [
  {
    n: "01",
    title: "Browse offers & work",
    body: "Pick a package — or open a Salesforce interactive demo and see how packages feel in the browser.",
  },
  {
    n: "02",
    title: "Send a marketplace brief",
    body: "Public contact form for a fast start: project type, goals, constraints. No account required.",
  },
  {
    n: "03",
    title: "Daily chat on the mobile app",
    body: "Sign up for files, briefs, and status. Continue on Arsalan Studio — same person, progress every day until acceptance.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section-pad border-t border-line scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">How it works</p>
        <h2 className="section-title mt-3">Browse → inquire → daily chat</h2>
        <p className="mt-4 max-w-xl text-muted">
          Web for discovery and briefs. Mobile app for the ongoing thread —
          not a ticket portal staffed by strangers.
        </p>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="relative">
              <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-accent/30">
                {step.n}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

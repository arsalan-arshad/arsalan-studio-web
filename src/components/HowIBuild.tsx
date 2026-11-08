import { buildTools } from "@/data/studio";

/** Honest tooling strip — AI-powered orchestrator stack, not a gimmick. */
export function HowIBuild() {
  return (
    <section
      id="how-i-build"
      className="section-pad border-t border-line scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">How I build</p>
        <h2 className="section-title mt-3 max-w-2xl">
          AI-powered orchestrator — Cursor, Claude, Antigravity
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Delivery stays human-owned: acceptance tests, exclusions, and daily
          conversation with you. The orchestrator stack accelerates research,
          implementation, and review — it does not replace accountability.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {buildTools.map((tool) => (
            <li
              key={tool.id}
              className="panel-lume rounded-sm px-5 py-6"
            >
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-ink">
                {tool.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {tool.blurb}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

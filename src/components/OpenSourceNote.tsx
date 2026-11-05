export function OpenSourceNote() {
  return (
    <aside className="border-y border-line bg-bg-elevated">
      <div className="mx-auto max-w-6xl px-[clamp(1.25rem,4vw,3.5rem)] py-6 text-sm text-muted">
        <span className="font-semibold text-ink">Open source.</span> Shipped
        apps and packages on this site are MIT-licensed where noted — fork,
        audit, and{" "}
        <span className="text-ink">open pull requests</span>. Client work can
        leave reusable recipes behind with private details removed.
      </div>
    </aside>
  );
}

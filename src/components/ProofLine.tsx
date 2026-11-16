type ProofLineProps = {
  children: string;
  /** Tighter vertical padding when nested (e.g. inside Contact). */
  compact?: boolean;
};

/** Single small proof line with a left accent mark — not a heading or card. */
export function ProofLine({ children, compact = false }: ProofLineProps) {
  return (
    <div
      className={
        compact
          ? "max-w-xl"
          : "mx-auto max-w-6xl px-[clamp(1.25rem,4vw,3.5rem)] py-5"
      }
    >
      <p
        className="border-l-2 border-accent pl-3 text-sm leading-relaxed text-muted"
        role="note"
      >
        {children}
      </p>
    </div>
  );
}

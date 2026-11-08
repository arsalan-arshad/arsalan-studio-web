import Link from "next/link";

export function StickyCta() {
  return (
    <div className="sticky-cta flex items-center justify-between gap-3 md:justify-end">
      <p className="text-sm text-muted md:hidden">Ready when you are.</p>
      <Link href="/contact" className="btn-primary !px-4 !py-2.5 text-sm shrink-0">
        Start a conversation
      </Link>
    </div>
  );
}

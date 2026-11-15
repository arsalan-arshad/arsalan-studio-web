import { capacityStatusCopy } from "@/lib/brand";

/** One-line capacity signal above Offers — edit count via `brand.openProjectSlots`. */
export function CapacityStatus() {
  return (
    <section
      aria-label="Availability"
      className="border-b border-line bg-bg"
    >
      <div className="mx-auto max-w-6xl px-[clamp(1.25rem,4vw,3.5rem)] py-4">
        <p className="text-center text-sm font-medium text-accent sm:text-left">
          {capacityStatusCopy()}
        </p>
      </div>
    </section>
  );
}

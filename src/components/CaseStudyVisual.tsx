import type { CaseStudy } from "@/data/caseStudies";
import Image from "next/image";

function isSvg(src: string) {
  return src.toLowerCase().endsWith(".svg");
}

export function CaseStudyVisual({
  study,
  size = "md",
  banner = false,
  className = "",
}: {
  study: Pick<CaseStudy, "iconSrc" | "bannerSrc" | "category" | "title">;
  size?: "md" | "lg";
  banner?: boolean;
  className?: string;
}) {
  if (banner && study.bannerSrc) {
    if (isSvg(study.bannerSrc)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={study.bannerSrc}
          alt=""
          className={`object-cover object-center ${className}`}
        />
      );
    }
    return (
      <Image
        src={study.bannerSrc}
        alt=""
        fill
        className={`object-cover object-center ${className}`}
        sizes="(max-width: 768px) 100vw, 768px"
      />
    );
  }

  const dim = size === "lg" ? 72 : 56;
  if (study.iconSrc) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-md border border-line bg-bg-elevated ${className}`}
        style={{ width: dim, height: dim }}
      >
        {isSvg(study.iconSrc) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={study.iconSrc}
            alt=""
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <Image
            src={study.iconSrc}
            alt=""
            width={dim}
            height={dim}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-md border border-line bg-accent-wash text-[10px] font-semibold uppercase tracking-wide text-accent ${className}`}
      style={{ width: dim, height: dim }}
    >
      {study.category === "shopify"
        ? "SFY"
        : study.category === "salesforce"
          ? "SF"
          : "•"}
    </div>
  );
}

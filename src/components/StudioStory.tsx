import {
  pastServices,
  studioPrinciples,
  studioSkills,
} from "@/data/studio";
import { brand } from "@/lib/brand";
import Image from "next/image";

/** Digitize Turf = past company credibility; brand is Arsalan Arshad studio. */
export function StudioStory() {
  return (
    <section
      id="studio"
      className="border-y border-line bg-bg-elevated/90"
      aria-label="About the studio"
    >
      <div className="mx-auto max-w-6xl px-[clamp(1.25rem,4vw,3.5rem)] py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Studio</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {brand.name} — personal marketplace
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Independent, remote-friendly studio run by one builder —{" "}
              {brand.name}. Clients worldwide inquire here for Shopify,
              Salesforce, React Native mobile, web, and AI automation, then keep
              a daily thread until acceptance.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Previously founded and ran{" "}
              <a
                href={brand.pastCompany.clutch}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Digitize Turf
              </a>{" "}
              — mobile and web product work for clients worldwide (see Clutch
              for that chapter). Resume history also includes leading mobile
              apps for startups and education products (React Native, store
              CI/CD, Firebase). The craft carries forward; the brand today is
              fully under this studio at{" "}
              <span className="text-ink">{brand.domain}</span>.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Image
                src="/brands/digitize-turf/logo.png"
                alt="Digitize Turf (past company)"
                width={120}
                height={40}
                className="h-8 w-auto opacity-90 brightness-110"
              />
              <a
                href={brand.pastCompany.clutch}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Clutch profile →
              </a>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brands/digitize-turf/techbehemoths-trusted.svg"
                alt="As trusted on TechBehemoths"
                className="h-7 w-auto opacity-80 brightness-125"
              />
            </div>
          </div>

          <ul className="grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-sm lg:grid-cols-1">
            {pastServices.map((service) => (
              <li key={service.title} className="border-l border-accent/35 pl-4">
                <p className="text-sm font-semibold text-ink">{service.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {service.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {studioPrinciples.map((item) => (
            <li
              key={item.id}
              className="panel-lume flex items-center gap-2 rounded-sm px-3 py-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt={item.name} className="h-5 w-5 opacity-90 brightness-110" />
              <span className="text-xs font-medium text-ink">{item.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Skills carried from Digitize Turf into the studio
          </p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {studioSkills.map((skill) => (
              <li
                key={skill.id}
                className="panel-lume flex items-center gap-2 rounded-sm px-3 py-2"
                title={skill.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={skill.src}
                  alt={skill.name}
                  className="h-6 w-6 object-contain brightness-110"
                />
                <span className="text-xs text-muted">{skill.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

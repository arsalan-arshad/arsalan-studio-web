import {
  pastServices,
  studioPrinciples,
  studioSkills,
} from "@/data/studio";

/** Studio capabilities — services, value props, and skills. */
export function StudioStory() {
  return (
    <section
      id="studio"
      className="border-y border-line bg-bg-elevated/90"
      aria-label="About the studio"
    >
      <div className="mx-auto max-w-6xl px-[clamp(1.25rem,4vw,3.5rem)] py-12">
        <ul className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {pastServices.map((service) => (
            <li key={service.title} className="border-l border-accent/35 pl-4">
              <p className="text-sm font-semibold text-ink">{service.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
                {service.body}
              </p>
            </li>
          ))}
        </ul>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {studioPrinciples.map((item) => (
            <li
              key={item.id}
              className="panel-lume flex items-center gap-2 rounded-sm px-3 py-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt="" className="h-5 w-5 opacity-90 brightness-110" />
              <span className="text-xs font-medium text-ink">{item.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Skills carried into this studio
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
                  alt=""
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
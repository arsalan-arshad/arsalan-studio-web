import Image from "next/image";
import Link from "next/link";

const platforms = [
  {
    id: "ios",
    label: "iOS",
    icon: "/brands/app/apple.svg",
  },
  {
    id: "android",
    label: "Android",
    icon: "/brands/app/android-mark.svg",
  },
] as const;

export function AppLaunchSection() {
  return (
    <section
      id="app"
      aria-labelledby="app-launch-heading"
      className="section-pad relative overflow-hidden border-t border-line scroll-mt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
      >
        <div className="absolute -right-[12%] top-[-20%] h-[55vmin] w-[55vmin] rounded-full bg-[radial-gradient(circle,rgba(15,92,110,0.14),transparent_68%)]" />
        <div className="absolute -left-[8%] bottom-[-30%] h-[42vmin] w-[42vmin] rounded-full bg-[radial-gradient(circle,rgba(61,122,98,0.12),transparent_70%)]" />
      </div>

      <div className="relative z-[1] mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div>
          <p className="eyebrow">Studio app</p>
          <h2
            id="app-launch-heading"
            className="section-title mt-3 max-w-xl"
          >
            iOS &amp; Android are launching
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            The Arsalan Arshad companion app is coming to both stores — same
            marketplace thread as the site: inquire, chat daily, and follow
            your build with native Google sign-in.
          </p>

          <ul className="mt-7 flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <li
                key={platform.id}
                className="inline-flex items-center gap-2.5 border border-line bg-bg/80 px-3.5 py-2 text-sm font-medium text-ink backdrop-blur-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={platform.icon}
                  alt=""
                  width={18}
                  height={18}
                  className="opacity-90"
                />
                {platform.label}
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                  Launching
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">
              Create account
            </Link>
            <Link href="/contact" className="btn-ghost">
              Start on the web
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div
            aria-hidden
            className="motion-pulse absolute inset-[12%] -z-0 rounded-full bg-[radial-gradient(circle,rgba(15,92,110,0.18),transparent_70%)]"
          />
          <div className="relative overflow-hidden border border-line bg-gradient-to-br from-bg-elevated via-bg to-[#e8eef1] px-8 py-10 sm:px-10 sm:py-12">
            <div className="flex items-center justify-center gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.35rem] border border-line shadow-[0_18px_40px_-18px_rgba(15,92,110,0.45)] sm:h-36 sm:w-36 sm:rounded-[1.75rem]">
                <Image
                  src="/app-icon.png"
                  alt="Arsalan Arshad studio app icon"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                  priority={false}
                />
              </div>
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  Arsalan Arshad
                </p>
                <p className="mt-1 text-sm text-muted">
                  studio.arsalan.app
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {platforms.map((platform) => (
                    <span
                      key={platform.id}
                      className="inline-flex h-9 w-9 items-center justify-center border border-line bg-bg text-ink"
                      title={platform.label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={platform.icon}
                        alt={platform.label}
                        width={18}
                        height={18}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-8 border-t border-line pt-5 text-sm text-muted">
              Native Dev Client builds are live in testing. App Store and
              Google Play listings are next.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

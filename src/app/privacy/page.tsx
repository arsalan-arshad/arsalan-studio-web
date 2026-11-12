import { brand } from "@/lib/brand";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Arsalan Arshad Studio — website and iOS/Android companion app (studio.arsalan.app).",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    url: "/privacy",
    title: "Privacy Policy · Arsalan Arshad Studio",
    description:
      "How Arsalan Arshad Studio collects, uses, and shares information on the web and mobile apps.",
  },
};

const lastUpdated = "13 November 2026";

export default function PrivacyPage() {
  return (
    <article className="section-pad pt-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="section-title mt-3">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted">Last updated: {lastUpdated}</p>
        <p className="mt-6 text-muted">
          This Privacy Policy explains how{" "}
          <span className="text-ink">{brand.name}</span> (“I”, “me”, “the
          studio”) collects, uses, stores, and shares information when you use:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>
            the website at{" "}
            <a
              href={`https://${brand.domain}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              {brand.domain}
            </a>{" "}
            and related pages;
          </li>
          <li>
            the companion mobile apps for iOS and Android (bundle / package{" "}
            <span className="text-ink">{brand.packageId}</span>).
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          The studio is a sole-builder practice operated by Arsalan Arshad. By
          using the site or apps, you agree to this policy. If you do not agree,
          please do not use the services.
        </p>

        <Section title="1. Who is responsible">
          <p>
            Controller: <span className="text-ink">{brand.name}</span>
            <br />
            Email:{" "}
            <a
              href={`mailto:${brand.email}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              {brand.email}
            </a>
            <br />
            Web:{" "}
            <a
              href={`https://${brand.domain}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              https://{brand.domain}
            </a>
            <br />
            Support:{" "}
            <Link
              href="/contact"
              className="text-accent underline-offset-4 hover:underline"
            >
              https://{brand.domain}/contact
            </Link>
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p className="font-medium text-ink">Account information</p>
          <p className="mt-1">
            When you create an account or sign in, we may collect your name,
            email address, and a password hash (if you use email/password). If
            you use Google Sign-In, we receive identifiers and profile details
            Google shares with us (typically name, email, and a subject ID) so we
            can create or link your account. We do not receive your Google
            password.
          </p>

          <p className="mt-4 font-medium text-ink">Contact and inquiry data</p>
          <p className="mt-1">
            If you submit the contact form, we collect the details you provide
            (for example name, email, company, project needs, timeline, budget,
            and message).
          </p>

          <p className="mt-4 font-medium text-ink">Messages and attachments</p>
          <p className="mt-1">
            If you use chat / messaging after signing up, we store conversation
            content, notification metadata, and any files you upload. Message
            bodies may be encrypted at rest. Uploaded files are stored with a
            private object-storage provider so the studio can review briefs and
            continue the engagement.
          </p>

          <p className="mt-4 font-medium text-ink">
            Technical and session data
          </p>
          <p className="mt-1">
            We may process session cookies (web), device / app identifiers needed
            for signed-in sessions, refresh-token metadata for the mobile API
            (which can include approximate IP address and user-agent), and basic
            server logs for security and reliability.
          </p>

          <p className="mt-4 font-medium text-ink">Analytics</p>
          <p className="mt-1">
            The website may use Google Tag Manager / Google Analytics (or similar
            tags configured in GTM) to understand aggregate traffic and product
            usage. These tools can set cookies or similar technologies and
            collect device and usage data according to Google’s policies.
          </p>
        </Section>

        <Section title="3. How we use information">
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide, operate, and secure the website and mobile apps</li>
            <li>Respond to inquiries and deliver client work</li>
            <li>Authenticate users (email/password or Google)</li>
            <li>Send transactional email (verification, password reset)</li>
            <li>Improve the studio surfaces using aggregated analytics</li>
            <li>Comply with legal obligations and protect against abuse</li>
          </ul>
          <p className="mt-4">
            I do <span className="text-ink">not</span> sell your personal
            information, and I do not use your chat content to train public AI
            models.
          </p>
        </Section>

        <Section title="4. Legal bases (where applicable)">
          <p>
            Depending on where you live, processing may rely on: performance of
            a contract or pre-contract steps (inquiries and delivery); consent
            (for example certain analytics or optional cookies); legitimate
            interests (securing the service, preventing abuse, improving the
            product in ways that do not override your rights); and legal
            obligation when required.
          </p>
        </Section>

        <Section title="5. Sharing and processors">
          <p>
            I use service providers (“processors”) to run the studio. They only
            process data on my instructions for the purposes above. Categories
            include:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <span className="text-ink">Hosting / database</span> — currently
              Railway (application and Postgres)
            </li>
            <li>
              <span className="text-ink">File storage</span> — Cloudflare R2 (or
              compatible object storage) for chat attachments
            </li>
            <li>
              <span className="text-ink">Email delivery</span> — Resend (or
              similar) for verification and transactional mail
            </li>
            <li>
              <span className="text-ink">Authentication</span> — Google OAuth /
              Google Sign-In when you choose Google
            </li>
            <li>
              <span className="text-ink">Analytics / tags</span> — Google Tag
              Manager and Google Analytics when enabled
            </li>
            <li>
              <span className="text-ink">App distribution</span> — Apple App
              Store / Google Play and Expo / EAS build infrastructure when you
              install store or preview builds
            </li>
          </ul>
          <p className="mt-4">
            I may disclose information if required by law, to protect rights and
            safety, or in connection with a transfer of the studio’s operations
            (with notice where appropriate).
          </p>
        </Section>

        <Section title="6. International transfers">
          <p>
            Servers and processors may be located outside your country
            (including the United States and EU regions used by cloud
            providers). Where required, appropriate safeguards are applied by
            those providers’ terms and transfer mechanisms.
          </p>
        </Section>

        <Section title="7. Retention">
          <p>
            Account, inquiry, and message data are kept while your account is
            active and as needed to deliver or document the engagement, then for
            a reasonable period for security, dispute resolution, and legal
            compliance. You can request deletion (see below). Server logs and
            analytics data are retained according to each tool’s settings and
            operational needs.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            I use industry-standard measures appropriate to a small studio:
            HTTPS, hashed passwords, encrypted chat content where enabled,
            private object storage for attachments, and access limited to the
            sole operator (and any authorized sub-admin tools). No method of
            transmission or storage is 100% secure.
          </p>
        </Section>

        <Section title="9. Your choices and rights">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Access, correct, or update account details by contacting me
            </li>
            <li>
              Request export or deletion of your account and associated data
            </li>
            <li>
              Opt out of non-essential analytics cookies via your browser
              controls or Google’s tools where available
            </li>
            <li>
              Withdraw Google access in your Google Account permissions
            </li>
          </ul>
          <p className="mt-4">
            Depending on your location (for example EEA/UK or certain US
            states), you may have additional rights such as restriction,
            objection, or lodging a complaint with a supervisory authority.
          </p>
        </Section>

        <Section title="10. Account deletion (App Store requirement)">
          <p>
            If you created an account, you may request deletion at any time by
            emailing{" "}
            <a
              href={`mailto:${brand.email}?subject=Account%20deletion%20request`}
              className="text-accent underline-offset-4 hover:underline"
            >
              {brand.email}
            </a>{" "}
            from the address on the account, or via the{" "}
            <Link
              href="/contact"
              className="text-accent underline-offset-4 hover:underline"
            >
              contact form
            </Link>
            , with the subject “Account deletion request”.
          </p>
          <p className="mt-3">
            After verifying ownership, I will delete or anonymize account
            profile data, sessions/tokens, and associated chat content and
            attachments that are not required to keep for legal or security
            reasons. Some residual records (for example billing correspondence
            outside the app, or delayed analytics) may remain for a limited
            period as required by law or processor retention.
          </p>
        </Section>

        <Section title="11. Children">
          <p>
            The services are directed at adults and businesses. They are not
            intended for children under 13 (or the minimum age required in your
            country). I do not knowingly collect personal information from
            children. If you believe a child has provided data, contact me and I
            will delete it.
          </p>
        </Section>

        <Section title="12. Mobile permissions and data use">
          <p>
            The companion app may use network access to talk to{" "}
            {brand.domain}, and may use the system browser / Google Sign-In
            sheets for authentication. It does not require continuous background
            location. Push notifications, if added later, will be optional and
            described in an updated policy or in-app prompt.
          </p>
          <p className="mt-3">
            Apple App Privacy / Google Play Data safety labels should be read
            together with this policy. If a label and this page ever differ,
            contact me and I will correct the inconsistency.
          </p>
        </Section>

        <Section title="13. Third-party links and products">
          <p>
            Case studies and presence links may point to third-party sites (GitHub,
            npm, Shopify, Salesforce, social networks, or product demos). Their
            privacy practices are their own. Open-source packages published under
            my name may have separate READMEs; hosted demos under{" "}
            <span className="text-ink">*.{brand.domain}</span> are covered by
            this policy unless a product page states otherwise.
          </p>
        </Section>

        <Section title="14. Changes">
          <p>
            I may update this policy from time to time. The “Last updated” date
            at the top will change when material updates are published. Continued
            use after an update means you accept the revised policy.
          </p>
        </Section>

        <Section title="15. Contact">
          <p>
            Privacy and support requests:{" "}
            <a
              href={`mailto:${brand.email}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              {brand.email}
            </a>
            <br />
            Contact form:{" "}
            <Link
              href="/contact"
              className="text-accent underline-offset-4 hover:underline"
            >
              /contact
            </Link>
          </p>
          <p className="mt-4 text-sm text-muted">
            App Store Connect URLs for this studio:
            <br />
            Privacy Policy URL —{" "}
            <span className="text-ink">https://{brand.domain}/privacy</span>
            <br />
            Support URL —{" "}
            <span className="text-ink">https://{brand.domain}/contact</span>
            <br />
            Marketing URL —{" "}
            <span className="text-ink">https://{brand.domain}</span>
          </p>
        </Section>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

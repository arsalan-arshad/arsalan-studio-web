import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Salesforce interactive demos",
  description:
    "Try hosted interactive Salesforce package demos — Smart Record Cloner and the full suite.",
};

const demos = [
  {
    id: "suite",
    title: "Smart Record Cloner (suite entry)",
    href: "/demos/salesforce-interactive.html",
    note: "Primary demo from salesforce/interactive_demo.html",
  },
  {
    id: "01",
    title: "Smart Record Cloner",
    href: "/demos/salesforce/01-smart-record-cloner.html",
  },
  {
    id: "02",
    title: "Clean Flow Toast & Alerts",
    href: "/demos/salesforce/02-clean-flow-toast-alerts.html",
  },
  {
    id: "03",
    title: "Universal Quick File Viewer",
    href: "/demos/salesforce/03-universal-quick-file-viewer.html",
  },
  {
    id: "04",
    title: "Shopify ↔ Salesforce Connector",
    href: "/demos/salesforce/04-shopify-salesforce-connector.html",
  },
  {
    id: "05",
    title: "Shopify AI Forecast Bridge",
    href: "/demos/salesforce/05-shopify-ai-forecast-bridge.html",
  },
];

export default function SalesforceDemoPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Salesforce</p>
        <h1 className="section-title mt-3">Interactive demos</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Open a full interactive simulation in a new tab, or explore the
          embedded Smart Record Cloner demo below. These are the same HTML demos
          from the Salesforce portfolio — usable in-browser, no org install
          required.
        </p>

        <ul className="mt-8 flex flex-wrap gap-3">
          {demos.map((demo) => (
            <li key={demo.id}>
              <a
                href={demo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm"
              >
                {demo.title} →
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 overflow-hidden border border-line bg-bg-elevated">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="text-sm font-medium text-ink">
              Embedded: Smart Record Cloner
            </p>
            <a
              href="/demos/salesforce-interactive.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              Open fullscreen →
            </a>
          </div>
          <iframe
            title="Smart Record Cloner interactive Salesforce demo"
            src="/demos/salesforce-interactive.html"
            className="h-[min(80vh,920px)] w-full bg-white"
          />
        </div>

        <p className="mt-8 text-sm text-muted">
          Like what you see?{" "}
          <Link href="/contact?need=salesforce" className="text-accent hover:underline">
            Start a Salesforce conversation
          </Link>{" "}
          or{" "}
          <Link href="/work" className="text-accent hover:underline">
            browse all work
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

"use client";

import { projectNeeds } from "@/data/inquiryOptions";
import { trackEvent } from "@/lib/analytics";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function ContactForm() {
  const params = useSearchParams();
  const preselected = params.get("need") ?? params.get("offer") ?? "";
  const [needs, setNeeds] = useState<string[]>(() =>
    preselected ? [preselected] : [],
  );
  const [otherText, setOtherText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const showOther = useMemo(() => needs.includes("other"), [needs]);

  function toggleNeed(id: string) {
    setNeeds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          needs,
          otherNeed: otherText,
          timeline: form.get("timeline"),
          budget: form.get("budget"),
          message: form.get("message"),
        }),
      });
      if (!res.ok) throw new Error("failed");
      trackEvent("contact_submit");
      setStatus("sent");
      e.currentTarget.reset();
      setNeeds([]);
      setOtherText("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-muted">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="input-field"
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="mb-1.5 block text-sm text-muted">
          Company / project (optional)
        </label>
        <input
          id="company"
          name="company"
          className="input-field"
          placeholder="Brand, shop, or working title"
          autoComplete="organization"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm text-muted">
          What do you need? (select all that apply)
        </legend>
        <div className="flex flex-wrap gap-2">
          {projectNeeds.map((need) => (
            <button
              key={need.id}
              type="button"
              className="need-chip"
              data-on={needs.includes(need.id) ? "true" : "false"}
              onClick={() => toggleNeed(need.id)}
              aria-pressed={needs.includes(need.id)}
            >
              {need.label}
            </button>
          ))}
        </div>
        {showOther ? (
          <input
            className="input-field mt-3"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Describe the other need…"
            aria-label="Other need details"
          />
        ) : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="timeline" className="mb-1.5 block text-sm text-muted">
            Timeline
          </label>
          <select id="timeline" name="timeline" className="input-field" defaultValue="">
            <option value="">Flexible / not sure</option>
            <option value="asap">ASAP / this month</option>
            <option value="1-3m">1–3 months</option>
            <option value="explore">Exploring only</option>
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="mb-1.5 block text-sm text-muted">
            Budget band (optional)
          </label>
          <select id="budget" name="budget" className="input-field" defaultValue="">
            <option value="">Prefer to discuss</option>
            <option value="under-2k">Under $2k</option>
            <option value="2-8k">$2k–$8k</option>
            <option value="8k-plus">$8k+</option>
            <option value="retainer">Monthly retainer</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm text-muted">
          Brief
        </label>
        <textarea
          id="message"
          name="message"
          required
          className="input-field"
          placeholder="Goals, constraints, links, and what “done” looks like. Stack preferences welcome but not required."
        />
      </div>

      <button
        type="submit"
        className="btn-primary w-full sm:w-auto"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </button>
      {status === "sent" ? (
        <p className="text-sm text-sage">
          Received. I&apos;ll reply by email — sign up to continue in-app with
          files and status.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-danger">
          Something went wrong. Email me directly or try again.
        </p>
      ) : null}
    </form>
  );
}

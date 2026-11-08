"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { PASSWORD_RULES_HINT } from "@/lib/password";

export function SignupForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Could not register");
      return;
    }
    trackEvent("signup");
    const login = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setLoading(false);
    if (login?.error) {
      router.push("/login?verify=1");
      return;
    }
    router.push("/chat?verify=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      <p className="rounded-sm border border-line bg-bg-elevated px-3 py-2 text-sm text-muted">
        After signup we’ll email a verification link to unlock Messages.
      </p>
      {googleEnabled ? (
        <>
          <button
            type="button"
            className="btn-ghost w-full"
            disabled={loading}
            onClick={() => signIn("google", { callbackUrl: "/chat" })}
          >
            Continue with Google
          </button>
          <p className="text-center text-xs text-muted">or email</p>
        </>
      ) : null}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm text-muted">
          Name
        </label>
        <input id="name" name="name" required className="input-field" autoComplete="name" />
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
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          className="input-field"
          autoComplete="new-password"
        />
        <p className="mt-1.5 text-xs text-muted">{PASSWORD_RULES_HINT}</p>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

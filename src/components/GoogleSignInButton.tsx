"use client";

import { signIn } from "next-auth/react";
import { GoogleMark } from "@/components/GoogleMark";

export function GoogleSignInButton({
  callbackUrl = "/chat",
  disabled = false,
}: {
  callbackUrl?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn-ghost flex w-full items-center justify-center gap-2.5"
      disabled={disabled}
      onClick={() => signIn("google", { callbackUrl })}
    >
      <GoogleMark />
      <span>Continue with Google</span>
    </button>
  );
}

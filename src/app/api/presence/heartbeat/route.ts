import { getSessionUser, unauthorized } from "@/lib/auth-helpers";
import { touchLastSeen } from "@/lib/presence";
import { NextResponse } from "next/server";

/** Authenticated presence ping — updates User.lastSeenAt. */
export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const lastSeenAt = await touchLastSeen(user.id);
    return NextResponse.json({
      ok: true,
      lastSeenAt: lastSeenAt.toISOString(),
    });
  } catch (err) {
    console.error("[presence heartbeat]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

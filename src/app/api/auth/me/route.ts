import { getSessionUser, unauthorized } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  return NextResponse.json({ ok: true, user });
}

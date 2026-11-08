import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { canManageInquiries } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!canManageInquiries(user.role)) return forbidden();

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ ok: true, inquiries });
}

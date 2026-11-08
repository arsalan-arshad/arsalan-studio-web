import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";

export async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (!isStaff(session.user.role)) {
    redirect("/chat");
  }
  return children;
}

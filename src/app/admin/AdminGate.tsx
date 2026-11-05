import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/chat");
  }
  return children;
}

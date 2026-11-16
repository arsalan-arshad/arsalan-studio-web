import { PRESENCE_ONLINE_MS } from "@/lib/presence-constants";

export function isUserOnline(
  lastSeenAt: Date | string | null | undefined,
): boolean {
  if (!lastSeenAt) return false;
  const t =
    typeof lastSeenAt === "string"
      ? new Date(lastSeenAt).getTime()
      : lastSeenAt.getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < PRESENCE_ONLINE_MS;
}

export function formatLastSeen(
  lastSeenAt: Date | string | null | undefined,
): string {
  if (!lastSeenAt) return "Offline";
  if (isUserOnline(lastSeenAt)) return "Online";
  const d =
    typeof lastSeenAt === "string" ? new Date(lastSeenAt) : lastSeenAt;
  if (Number.isNaN(d.getTime())) return "Offline";
  const mins = Math.round((Date.now() - d.getTime()) / 60_000);
  if (mins < 60) return `Last seen ${mins <= 1 ? "a minute" : `${mins} min`} ago`;
  return `Last seen ${d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

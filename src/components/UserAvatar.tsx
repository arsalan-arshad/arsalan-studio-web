"use client";

import { formatLastSeen, isUserOnline } from "@/lib/format-presence";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

type Props = {
  name: string;
  image?: string | null;
  lastSeenAt?: string | null;
  showPresence?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function UserAvatar({
  name,
  image,
  lastSeenAt,
  showPresence = false,
  size = "sm",
  className = "",
}: Props) {
  const online = showPresence && isUserOnline(lastSeenAt);
  const dim = size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-[11px]";
  const title = showPresence ? `${name} · ${formatLastSeen(lastSeenAt)}` : name;

  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      title={title}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- Google OAuth avatar URLs
        <img
          src={image}
          alt=""
          className={`${dim} rounded-full object-cover border border-line bg-bg`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className={`${dim} inline-flex items-center justify-center rounded-full border border-line bg-bg-elevated font-semibold text-muted`}
          aria-hidden
        >
          {initials(name)}
        </span>
      )}
      {showPresence ? (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-elevated ${
            online ? "bg-[var(--sage)]" : "bg-muted/50"
          }`}
          aria-label={online ? "Online" : "Offline"}
        />
      ) : null}
    </span>
  );
}

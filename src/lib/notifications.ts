import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const NOTIFICATION_TYPES = {
  CHAT_MESSAGE: "CHAT_MESSAGE",
  CONTACT_INQUIRY: "CONTACT_INQUIRY",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export type NotificationInput = {
  type: NotificationType | string;
  title: string;
  body: string;
  href?: string | null;
};

function previewText(text: string, max = 140) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

/** Fan-out create; skips empty recipient lists. Failures are logged, not thrown. */
export async function createNotificationsForUsers(
  userIds: string[],
  input: NotificationInput,
) {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return;

  try {
    await prisma.notification.createMany({
      data: unique.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        body: input.body,
        href: input.href ?? null,
      })),
    });
  } catch (err) {
    console.error("[notifications] createMany failed", err);
  }
}

export async function notifyActiveUsersByRoles(
  roles: Role[],
  input: NotificationInput,
  excludeUserId?: string,
) {
  const users = await prisma.user.findMany({
    where: {
      role: { in: roles },
      active: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });
  await createNotificationsForUsers(
    users.map((u) => u.id),
    input,
  );
}

/** CLIENT message → active ADMIN; ADMIN message → thread client. Never SUB_ADMIN. */
export async function notifyChatMessage(opts: {
  threadId: string;
  clientId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  bodyPreview: string;
}) {
  const href = `/chat?thread=${opts.threadId}`;
  const body = previewText(
    `${opts.senderName}: ${opts.bodyPreview || "New message"}`,
  );

  if (opts.senderRole === "ADMIN") {
    if (opts.clientId === opts.senderId) return;
    await createNotificationsForUsers([opts.clientId], {
      type: NOTIFICATION_TYPES.CHAT_MESSAGE,
      title: "New studio message",
      body,
      href,
    });
    return;
  }

  if (opts.senderRole === "CLIENT") {
    await notifyActiveUsersByRoles(
      ["ADMIN"],
      {
        type: NOTIFICATION_TYPES.CHAT_MESSAGE,
        title: "New client message",
        body,
        href,
      },
      opts.senderId,
    );
  }
}

/** Contact form → all active ADMIN + SUB_ADMIN. */
export async function notifyContactInquiryStaff(opts: {
  inquiryId: string;
  name: string;
  message: string;
}) {
  await notifyActiveUsersByRoles(["ADMIN", "SUB_ADMIN"], {
    type: NOTIFICATION_TYPES.CONTACT_INQUIRY,
    title: "New contact inquiry",
    body: previewText(`${opts.name}: ${opts.message}`),
    href: "/admin",
  });
}

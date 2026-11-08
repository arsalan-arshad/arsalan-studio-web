/** App roles — mirrored from Prisma `Role` enum (keep in sync). */
export type AppRole = "CLIENT" | "ADMIN" | "SUB_ADMIN";

/** Full studio operator — chat, users (add+delete), inquiries, settings. */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "ADMIN";
}

/** Support desk — inquiries + invite CLIENT/SUB_ADMIN; no chat, no delete. */
export function isSubAdmin(role: string | null | undefined): boolean {
  return role === "SUB_ADMIN";
}

/** ADMIN or SUB_ADMIN — can enter /admin surfaces. */
export function isStaff(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "SUB_ADMIN";
}

/** Client chat threads/messages — CLIENT (own) or ADMIN (all). Never SUB_ADMIN. */
export function canAccessClientChat(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "CLIENT";
}

export function canManageInquiries(role: string | null | undefined): boolean {
  return isStaff(role);
}

export function canListUsers(role: string | null | undefined): boolean {
  return isStaff(role);
}

export function canDeleteUsers(role: string | null | undefined): boolean {
  return isAdmin(role);
}

/** ADMIN may activate/deactivate SUB_ADMIN and CLIENT (not other ADMIN). */
export function canToggleUserActive(role: string | null | undefined): boolean {
  return isAdmin(role);
}

export function canDeactivateTarget(targetRole: string): boolean {
  return targetRole === "SUB_ADMIN" || targetRole === "CLIENT";
}

/** Roles the actor may assign when inviting. */
export function inviteableRoles(actorRole: string): AppRole[] {
  if (actorRole === "ADMIN") return ["CLIENT", "SUB_ADMIN", "ADMIN"];
  if (actorRole === "SUB_ADMIN") return ["CLIENT", "SUB_ADMIN"];
  return [];
}

export function canInviteRole(actorRole: string, targetRole: string): boolean {
  return inviteableRoles(actorRole).includes(targetRole as AppRole);
}

export function roleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "SUB_ADMIN":
      return "Support";
    case "CLIENT":
      return "Client";
    default:
      return String(role);
  }
}

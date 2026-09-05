import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

const ROLE_RANK: Record<Role, number> = { EDITOR: 1, ADMIN: 2, SUPER_ADMIN: 3 };

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) throw new Error("UNAUTHENTICATED");
  return session.user;
}

export async function requireRole(minRole: Role) {
  const user = await requireUser();
  const role = user.role as Role;
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) throw new Error("FORBIDDEN");
  return user;
}

export function hasRole(role: Role | undefined, minimumRole: Role) {
  return !!role && ROLE_RANK[role] >= ROLE_RANK[minimumRole];
}

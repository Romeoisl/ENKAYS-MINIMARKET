import { auth } from "@/lib/auth";

const ROLE_RANK: Record<string, number> = {
  EDITOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/**
 * Server-side guard. Call this at the top of any Server Action or Route
 * Handler that mutates admin data. Throws if the session is missing,
 * the account is inactive, or the role doesn't meet the minimum.
 * Frontend role checks are UX only — this is the enforcement point.
 */
export async function requireRole(minRole: keyof typeof ROLE_RANK) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  const role = (session.user as { role?: string }).role ?? "EDITOR";
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

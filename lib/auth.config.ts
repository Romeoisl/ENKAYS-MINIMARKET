import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-safe Auth.js configuration used by middleware.
 *
 * The real credentials verification lives in lib/auth.ts, where Prisma and
 * bcryptjs are available in the Node.js runtime. This provider exists here
 * only because Auth.js requires providers to be present in NextAuthConfig.
 */
const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async () => null,
    }),
  ],
} satisfies NextAuthConfig;

export default authConfig;

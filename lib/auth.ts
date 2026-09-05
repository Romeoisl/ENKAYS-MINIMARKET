import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import authConfig from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const key = `login:${forwarded || "unknown"}:${email}`;
        const rate = checkRateLimit(key, 8, 15 * 60 * 1000);
        if (!rate.allowed) {
          logger.warn("Authentication rate limit reached", { email });
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.active) {
          logger.warn("Authentication rejected", { email });
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          logger.warn("Authentication rejected", { email });
          return null;
        }

        clearRateLimit(key);
        await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        logger.info("Admin authentication succeeded", { userId: user.id });

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const jwt = token as typeof token & { id?: string; role?: string };
      if (user) {
        jwt.role = (user as { role?: string }).role;
        jwt.id = user.id;
      }
      return jwt;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role as never;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

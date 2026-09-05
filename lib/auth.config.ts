import type { NextAuthConfig } from "next-auth";

const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/admin/login",
  },
} satisfies NextAuthConfig;

export default authConfig;

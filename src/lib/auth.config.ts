import type { NextAuthConfig } from "next-auth";
import { isAdminRole } from "@/lib/constants";
import type { Role } from "@prisma/client";

export const authConfig = {
  pages: {
    signIn: "/auth/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role as Role | undefined;

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && !!role && isAdminRole(role);
      }

      if (pathname.startsWith("/account")) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token.role as Role) ?? "USER";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

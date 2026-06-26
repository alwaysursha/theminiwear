import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import type { Provider } from "next-auth/providers";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/constants";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@prisma/client";
import { Role as RoleEnum } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user?.password) {
        return null;
      }

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password,
      );

      if (!isValid) {
        return null;
      }

      return user;
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token.role as Role) ?? RoleEnum.USER;
      }

      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
        }
      }

      return session;
    },
  },
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!isAdminRole(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireRoleAdmin() {
  const session = await requireAdmin();
  if (session.user.role !== RoleEnum.ADMIN) {
    throw new Error("Forbidden");
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!admin) {
    throw new Error("Session expired. Please sign in again.");
  }

  return { session, adminId: admin.id };
}

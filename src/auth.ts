import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email i haslo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Haslo", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

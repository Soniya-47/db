import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { User } from "./db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                let user: User | undefined = undefined;

                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const result = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                user = result[0];

                if (!user) {
                    throw new Error("User not found.");
                }

                const passwordsMatch = await compare(password, user.passwordHash);

                if (!passwordsMatch) {
                    throw new Error("Invalid password.");
                }

                return {
                    ...user,
                    id: user.id.toString(),
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const u = user as unknown as any;
                token.role = u.role;
                token.isApproved = u.isApproved;
                token.id = u.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as "admin" | "user";
                session.user.isApproved = token.isApproved as boolean;
                session.user.id = String(token.id);
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});

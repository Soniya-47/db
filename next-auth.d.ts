import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            role: "admin" | "user";
            isApproved: boolean;
            id: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: "admin" | "user";
        isApproved: boolean;
        // id is already in User as string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: "admin" | "user";
        isApproved: boolean;
        id: string;
    }
}

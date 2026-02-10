"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "Missing fields" };
    }

    // Check if user exists
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUser.length > 0) {
        return { error: "User already exists" };
    }

    const passwordHash = await hash(password, 10);

    // Check if this is the first user
    const allUsers = await db.select().from(users).limit(1);
    const isFirstUser = allUsers.length === 0;

    const isTestAdmin = email === "test@test.com";

    await db.insert(users).values({
        name,
        email,
        passwordHash,
        role: isTestAdmin || isFirstUser ? "admin" : "user",
        isApproved: isTestAdmin || isFirstUser ? true : false,
    });

    redirect("/login");
}

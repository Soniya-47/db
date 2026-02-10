"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: number) {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
        return { error: "Unauthorized" };
    }

    await db
        .update(users)
        .set({ isApproved: true })
        .where(eq(users.id, userId));

    revalidatePath("/dashboard");
    return { success: true };
}

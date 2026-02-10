import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { users } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import("@/lib/db");

    const userCountResult = await db.select({ count: count() }).from(users);
    const userCount = userCountResult[0].count;
    console.log(`User Count: ${userCount}`);

    const adminCountResult = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "admin"));
    const adminCount = adminCountResult[0].count;
    console.log(`Admin Count: ${adminCount}`);

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

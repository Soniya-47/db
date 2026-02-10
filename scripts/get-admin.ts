import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const { db } = await import("@/lib/db");

    const adminUsers = await db
        .select()
        .from(users)
        .where(eq(users.role, "admin"));

    if (adminUsers.length === 0) {
        console.log("No admin user found.");
    } else {
        adminUsers.forEach((u) => {
            console.log(`Admin Found: ID=${u.id}, Email=${u.email}, Name=${u.name}`);
        });
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sql } from "drizzle-orm";

async function main() {
    // Dynamic import
    const { db } = await import("@/lib/db");

    try {
        console.log("Dropping tables to reset schema for Workspaces...");
        await db.execute(sql`DROP TABLE IF EXISTS documents;`);
        await db.execute(sql`DROP TABLE IF EXISTS workspaces;`);
        console.log("Tables dropped. Now run 'npx drizzle-kit push' to recreate them.");
    } catch (error) {
        console.error("Failed to drop tables:", error);
    }
}

main();

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
export { };
import { sql } from "drizzle-orm";

async function main() {
    // Dynamic import
    const { db } = await import("@/lib/db");

    try {
        console.log("Dropping documents table to reset schema...");
        await db.execute(sql`DROP TABLE IF EXISTS documents;`);
        console.log("Table dropped. Now run 'npx drizzle-kit push' to recreate it.");
    } catch (error) {
        console.error("Failed to drop table:", error);
    }
}

main();

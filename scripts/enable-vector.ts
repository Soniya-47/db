import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sql } from "drizzle-orm";

async function main() {
    // Dynamic import to ensureenv vars are loaded first
    const { db } = await import("@/lib/db");

    try {
        console.log("Enabling vector extension...");
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
        console.log("Vector extension enabled!");
    } catch (error) {
        console.error("Failed to enable vector extension:", error);
    }
}

main();

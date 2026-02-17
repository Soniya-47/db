import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sql } from "drizzle-orm";

async function main() {
    const { db } = await import("@/lib/db");

    try {
        console.log("Initializing Database Manually...");

        // Enable vector extension
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);

        // Create Users Table
        console.log("Creating users table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                is_approved BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Create Workspaces Table
        console.log("Creating workspaces table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS workspaces (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                name TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Create Documents Table
        console.log("Creating documents table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                workspace_id INTEGER REFERENCES workspaces(id),
                file_name TEXT NOT NULL,
                content TEXT NOT NULL,
                embedding vector(384),
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Create Index
        console.log("Creating embedding index...");
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS "embeddingIndex" ON documents USING hnsw (embedding vector_cosine_ops);
         `);

        console.log("Database initialized successfully!");
    } catch (error) {
        console.error("Failed to initialize database:", error);
    }
}

main();

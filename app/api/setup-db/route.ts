import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Starting DB Setup...");

        // 1. Enable Vector Extension
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);

        // 2. Drop old documents table
        await db.execute(sql`DROP TABLE IF EXISTS documents CASCADE;`);

        // 3. Create Documents Table with 768 dimensions (Google Embeddings)
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                workspace_id INTEGER,
                file_name TEXT NOT NULL,
                content TEXT NOT NULL,
                embedding vector(3072),
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // 4. Create Index
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS "embeddingIndex" ON documents USING hnsw (embedding vector_cosine_ops);
        `);

        // 5. Create Workspaces Table (if not exists)
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS workspaces (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                name TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // 6. Create Users Table (if not exists)
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

        return NextResponse.json({ success: true, message: "Database initialized successfully with 768-dim vectors!" });
    } catch (error: any) {
        console.error("Setup Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

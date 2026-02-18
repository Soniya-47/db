import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

export async function chunkText(text: string, chunkSize: number = 1000, chunkOverlap: number = 200): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
    });
    const output = await splitter.createDocuments([text]);
    return output.map((doc: { pageContent: string }) => doc.pageContent);
}

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { cosineDistance, desc, sql, eq } from "drizzle-orm";

export async function searchDocuments(query: string, workspaceId: number, limit: number = 5) {
    const queryEmbedding = await generateEmbedding(query);

    // Calculate cosine similarity: 1 - cosineDistance
    const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, queryEmbedding)})`;

    const results = await db
        .select({
            content: documents.content,
            fileName: documents.fileName,
            similarity,
        })
        .from(documents)
        .where(eq(documents.workspaceId, workspaceId)) // Filter by workspace
        .orderBy(desc(similarity))
        .limit(limit);

    return results;
}

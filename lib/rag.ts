const { GoogleGenerativeAI } = require("@google/generative-ai");
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        return embedding.values;
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
import { cosineDistance, desc, gt, sql, eq, and } from "drizzle-orm";

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

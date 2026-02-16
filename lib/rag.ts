import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function generateEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
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
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

export async function searchDocuments(query: string, limit: number = 5) {
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
        // Filter out low relevance if needed, e.g. similarity > 0.5
        .orderBy(desc(similarity))
        .limit(limit);

    return results;
}

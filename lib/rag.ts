import { HfInference } from "@huggingface/inference";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: text,
        });

        // HfInference returns (number | number[])[] | number[] depending on inputs.
        // For a single string input, it returns number[].
        // We cast it to number[] as we expect a single embedding.
        return response as number[];
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

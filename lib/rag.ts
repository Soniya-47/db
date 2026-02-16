// @ts-ignore
import { pipeline } from "@xenova/transformers";

// Specific model for embeddings (small & fast)
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

type PipelineFunction = (text: string | string[], options?: any) => Promise<any>;

// Singleton to hold the pipeline
let extractor: PipelineFunction | null = null;

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!extractor) {
        // Load pipeline
        extractor = await pipeline("feature-extraction", MODEL_NAME);
    }

    // Generate embedding
    // pooling: 'mean' or 'cls' depending on model. all-MiniLM-L6-v2 uses mean pooling usually.
    const output = await extractor!(text, { pooling: "mean", normalize: true });

    // output.data is a Float32Array
    return Array.from(output.data);
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

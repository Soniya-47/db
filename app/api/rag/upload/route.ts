import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { generateEmbedding, chunkText } from "@/lib/rag";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

// Vercel Serverless Config
export const maxDuration = 60; // 60 seconds allowed
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log("[UPLOAD_API] Request received");

    try {
        // 1. Authentication
        const session = await auth();
        if (!session?.user?.id) {
            console.warn("[UPLOAD_API] Unauthorized request");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = parseInt(session.user.id);

        // 2. Environment Verification
        if (!process.env.OPENAI_API_KEY) {
            console.error("[UPLOAD_API] OPENAI_API_KEY missing");
            return NextResponse.json({ error: "Configuration Error: OPENAI_API_KEY is missing." }, { status: 500 });
        }
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error("[UPLOAD_API] BLOB_READ_WRITE_TOKEN missing");
            return NextResponse.json({ error: "Server Configuration Error: BLOB_READ_WRITE_TOKEN is missing. Please add it to Vercel Environment Variables." }, { status: 500 });
        }

        // 3. Parse Form Data
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const workspaceIdStr = formData.get("workspaceId") as string;

        if (!workspaceIdStr || !file) {
            return NextResponse.json({ error: "Missing workspaceId or file" }, { status: 400 });
        }

        const workspaceId = parseInt(workspaceIdStr);
        console.log(`[UPLOAD_API] Processing file: ${file.name} (${file.size} bytes) for workspace ${workspaceId}`);

        // 4. Validation
        const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File size exceeds 4.5MB limit." }, { status: 400 });
        }

        // 5. Upload to Vercel Blob
        let fileUrl = "";
        try {
            console.log("[UPLOAD_API] Uploading to Vercel Blob...");
            const blob = await put(file.name, file, { access: 'public' });
            fileUrl = blob.url;
            console.log(`[UPLOAD_API] Blob uploaded successfully: ${fileUrl}`);
        } catch (blobError) {
            console.error("[UPLOAD_API] Blob Upload Failed:", blobError);
            return NextResponse.json({ error: "Failed to upload file to storage.", details: blobError instanceof Error ? blobError.message : String(blobError) }, { status: 500 });
        }

        // 6. Read and Parse Validation
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let textContent = "";

        if (file.type === "application/pdf") {
            try {
                console.log("[UPLOAD_API] Parsing PDF...");
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const pdf = require("pdf-parse");
                const data = await pdf(buffer);
                textContent = data.text;
                console.log(`[UPLOAD_API] PDF Parsed. Length: ${textContent.length}`);
            } catch (pdfError) {
                console.error("[UPLOAD_API] PDF Parse Error:", pdfError);
                return NextResponse.json({ error: "Failed to parse PDF content.", details: pdfError instanceof Error ? pdfError.message : String(pdfError) }, { status: 500 });
            }
        } else if (file.type === "text/plain") {
            textContent = buffer.toString("utf-8");
        } else {
            return NextResponse.json({ error: "Unsupported file type. Use PDF or TXT." }, { status: 400 });
        }

        if (!textContent || textContent.trim().length === 0) {
            return NextResponse.json({ error: "Extracted no text from this file." }, { status: 400 });
        }

        // 7. Chunk and Embed
        console.log("[UPLOAD_API] Chunking text...");
        const chunks = await chunkText(textContent);
        console.log(`[UPLOAD_API] Created ${chunks.length} chunks. Generating embeddings...`);

        // Process chunks sequentially to avoid rate limits
        let processedCount = 0;
        for (const chunk of chunks) {
            try {
                const embedding = await generateEmbedding(chunk);
                await db.insert(documents).values({
                    userId,
                    workspaceId,
                    fileName: file.name,
                    fileUrl: fileUrl, // Guaranteed to exist now
                    content: chunk,
                    embedding,
                });
                processedCount++;
            } catch (embeddingError) {
                console.error(`[UPLOAD_API] Error processing chunk ${processedCount + 1}:`, embeddingError);
                // Continue with other chunks or fail? Standard RAG usually continues or fails hard.
                // Failing hard here to warn user.
                throw new Error(`Embedding failed at chunk ${processedCount + 1}: ${embeddingError instanceof Error ? embeddingError.message : "Unknown error"}`);
            }
        }

        console.log("[UPLOAD_API] Processing complete.");
        return NextResponse.json({
            success: true,
            message: "File uploaded and indexed successfully.",
            fileUrl: fileUrl,
            chunksProcessed: processedCount
        });

    } catch (globalError) {
        console.error("[UPLOAD_API] CRITICAL ERROR:", globalError);
        return NextResponse.json({
            error: "Internal Server Error",
            details: globalError instanceof Error ? globalError.message : "An unexpected error occurred."
        }, { status: 500 });
    }
}

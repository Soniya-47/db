import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { generateEmbedding, chunkText } from "@/lib/rag";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

// Increase timeout for model loading/processing (60s)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs'; // Removing 'nodejs' to allow Edge/Serverless flexibility if compatible, but pdf-parse needs node.
// Keeping default runtime (Node.js) is safer for pdf-parse.

// Helper to parse PDF using pdf-parse
async function parsePdf(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require("pdf-parse");
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to parse PDF content.");
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "Configuration Error: OPENAI_API_KEY is missing." }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const workspaceId = formData.get("workspaceId") as string;

        if (!workspaceId) {
            return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
        }

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 1. File Size Validation (Max 4.5MB for Vercel Serverless Function Payload/Execution safety)
        // Vercel Blob allows up to 500MB, but request body size is limited to 4.5MB in Serverless Functions.
        const MAX_SIZE = 4.5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File size exceeds the 4.5MB limit." }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let textContent = "";
        let fileUrl = "";

        // 2. Upload to Vercel Blob
        try {
            // Check if token exists only if we are actually trying to upload.
            // If not configured, we should fail as cloud storage is required.
            if (!process.env.BLOB_READ_WRITE_TOKEN) {
                console.error("BLOB_READ_WRITE_TOKEN is missing.");
                return NextResponse.json({ error: "Server Configuration Error: BLOB_READ_WRITE_TOKEN is missing. Please add it to Vercel Environment Variables." }, { status: 500 });
            } else {
                const blob = await put(file.name, file, {
                    access: 'public',
                });
                fileUrl = blob.url;
            }
        } catch (uploadError) {
            console.error("Vercel Blob Upload Failed:", uploadError);
            // Optionally, we could continue without the URL if blob fails, but user asked for "return file URL".
            // So we should verify token presence.
            if (process.env.BLOB_READ_WRITE_TOKEN) {
                return NextResponse.json({ error: "File storage failed. Please check configuration." }, { status: 500 });
            }
        }

        // 3. Parse Content
        if (file.type === "application/pdf") {
            try {
                textContent = await parsePdf(buffer);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : "Unknown error";
                return NextResponse.json({
                    error: "Failed to parse PDF",
                    details: errorMessage
                }, { status: 500 });
            }
        } else if (file.type === "text/plain") {
            textContent = buffer.toString("utf-8");
        } else {
            return NextResponse.json({ error: "Unsupported file type. Use PDF or TXT." }, { status: 400 });
        }

        if (!textContent || textContent.trim().length === 0) {
            return NextResponse.json({ error: "Extracted no text from this file." }, { status: 400 });
        }

        // 4. Chunk & Embed
        const chunks = await chunkText(textContent);

        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk);

            await db.insert(documents).values({
                userId: parseInt(session.user.id),
                workspaceId: parseInt(workspaceId),
                fileName: file.name,
                fileUrl: fileUrl || null, // Store URL if available
                content: chunk,
                embedding: embedding,
            });
        }

        return NextResponse.json({
            success: true,
            chunksProcessed: chunks.length,
            fileUrl: fileUrl,
            message: fileUrl ? "File uploaded and indexed." : "File indexed (storage not configured)."
        });

    } catch (error) {
        console.error("CRITICAL UPLOAD ERROR:", error);
        return NextResponse.json({
            error: "Upload Failed",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

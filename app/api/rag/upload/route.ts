import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { generateEmbedding, chunkText } from "@/lib/rag";
import { auth } from "@/lib/auth";

// Increase timeout for model loading/processing
// Increase timeout for model loading/processing (60s)
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
            return NextResponse.json({ error: "Configuration Error: OPENAI_API_KEY is missing on server." }, { status: 500 });
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

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let textContent = "";

        if (file.type === "application/pdf") {
            try {
                console.log(`Attempting to parse PDF: ${file.name}, Size: ${buffer.length} bytes`);
                textContent = await parsePdf(buffer);
                console.log(`PDF Parsed Successfully. Text Length: ${textContent.length}`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                console.error("PDF Parse Error Details:", {
                    message: e.message,
                    name: e.name,
                    stack: e.stack,
                    bufferSize: buffer.length
                });
                return NextResponse.json({
                    error: "Failed to parse PDF",
                    details: e.message,
                    tip: "Ensure the file is a valid PDF and not corrupted."
                }, { status: 500 });
            }
        } else if (file.type === "text/plain") {
            textContent = buffer.toString("utf-8");
        } else {
            return NextResponse.json({ error: "Unsupported file type. Use PDF or TXT." }, { status: 400 });
        }

        if (!textContent || textContent.trim().length === 0) {
            return NextResponse.json({ error: "Extensions extracted no text from this file." }, { status: 400 });
        }

        // Chunk the text
        const chunks = await chunkText(textContent);

        // Process chunks
        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk);

            await db.insert(documents).values({
                userId: parseInt(session.user.id),
                workspaceId: parseInt(workspaceId),
                fileName: file.name,
                content: chunk,
                embedding: embedding,
            });
        }

        return NextResponse.json({ success: true, chunksProcessed: chunks.length });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("CRITICAL UPLOAD ERROR:", error);

        // Check for specific error types
        if (error.message?.includes("embedding")) {
            console.error("Embedding Generation Failed. Check OpenAI API Key or Model Name.");
        }
        if (error.message?.includes("vector")) {
            console.error("Database Vector Error. Schema mismatch likely.");
        }

        return NextResponse.json({
            error: "Upload Failed",
            details: error.message || "Unknown error",
            stack: error.stack // BE CAREFUL: Only for debugging!
        }, { status: 500 });
    }
}

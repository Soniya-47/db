import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { generateEmbedding, chunkText } from "@/lib/rag";
import { auth } from "@/lib/auth";

// Increase timeout for model loading/processing
export const maxDuration = 60; // 60 seconds (Pro) or 10s (Hobby) - hope for the best
export const dynamic = 'force-dynamic';

// Helper to parse PDF using pdf2json
async function parsePdf(buffer: Buffer): Promise<string> {
    const PDFParser = require("pdf2json");
    const parser = new PDFParser(null, 1); // 1 = text only

    return new Promise((resolve, reject) => {
        parser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        parser.on("pdfParser_dataReady", (pdfData: any) => {
            // pdf2json returns URL encoded text sometimes, but usually raw text content is accessible via getRawTextContent()
            resolve(parser.getRawTextContent());
        });
        parser.parseBuffer(buffer);
    });
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: "Configuration Error: GOOGLE_API_KEY is missing on server." }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let textContent = "";

        if (file.type === "application/pdf") {
            try {
                textContent = await parsePdf(buffer);
            } catch (e: any) {
                console.error("PDF Parse Error:", e);
                return NextResponse.json({ error: "Failed to parse PDF", details: e.message }, { status: 500 });
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
                fileName: file.name,
                content: chunk,
                embedding: embedding,
            });
        }

        return NextResponse.json({ success: true, chunksProcessed: chunks.length });

    } catch (error: any) {
        console.error("Upload Error Stack:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message || "Unknown error",
            hint: "Check server logs."
        }, { status: 500 });
    }
}

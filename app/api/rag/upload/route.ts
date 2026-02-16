import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { generateEmbedding, chunkText } from "@/lib/rag";
import { auth } from "@/lib/auth";

// Helper to parse PDF using a more stable method or just accept text for now
async function parsePdf(buffer: Buffer): Promise<string> {
    // Placeholder: pdf-parse causes build issues in this environment.
    // For now, we will return a message or try a basic extraction if possible.
    // In a real prod env, we'd use pdfjs-dist or a dedicated service.
    return "PDF parsing is temporarily disabled due to build environment restrictions. Please upload .txt files.";
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

        // Debug Logging (Safe)
        console.log("Upload started for user:", session.user.id);
        console.log("DB URL Present:", !!process.env.DATABASE_URL);

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let textContent = "";

        if (file.type === "application/pdf") {
            // Using pdf2json as it is more robust for Next.js builds
            const PDFParser = require("pdf2json");
            const parser = new PDFParser(null, 1); // 1 = text only

            const text = await new Promise<string>((resolve, reject) => {
                parser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                parser.on("pdfParser_dataReady", (pdfData: any) => {
                    resolve(parser.getRawTextContent());
                });
                parser.parseBuffer(buffer);
            });

            textContent = text;
        } catch (e) {
            console.error("PDF Parse Error:", e);
            return NextResponse.json({ error: "Failed to parse PDF. Please try a .txt file." }, { status: 500 });
        }
    } else if (file.type === "text/plain") {
        textContent = buffer.toString("utf-8");
    } else {
        return NextResponse.json({ error: "Unsupported file type. Use PDF or TXT." }, { status: 400 });
    }

    // Chunk the text
    const chunks = await chunkText(textContent);

    // Process chunks (batching could be added for performance, but keeping it simple for now)
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
    console.error("Upload Error Message:", error.message);
    return NextResponse.json({
        error: "Internal Server Error",
        details: error.message || "Unknown error",
        hint: "Check server logs for 'Upload Error'"
    }, { status: 500 });
}
}

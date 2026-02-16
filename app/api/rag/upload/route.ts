import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { generateEmbedding, chunkText } from "@/lib/rag";
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse.js";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
            const data = await pdf(buffer);
            textContent = data.text;
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

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

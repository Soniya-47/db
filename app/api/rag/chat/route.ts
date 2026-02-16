import { NextRequest, NextResponse } from "next/server";
import { searchDocuments } from "@/lib/rag";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_key" });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages } = body;
        const lastMessage = messages[messages.length - 1];
        const query = lastMessage.content;

        if (!query) {
            return NextResponse.json({ error: "No query provided" }, { status: 400 });
        }

        // 1. Search for relevant context
        const docs = await searchDocuments(query);
        const context = docs.map(doc => `[Source: ${doc.fileName}]\n${doc.content}`).join("\n\n");

        if (docs.length === 0) {
            return NextResponse.json({
                role: "assistant",
                content: "I couldn't find any relevant documents to answer your question. Please upload some documents first."
            });
        }

        // 2. Construct System Prompt
        const systemPrompt = `
        You are a helpful assistant for a Question-Answering system.
        Use the following pieces of retrieved context to answer the user's question.
        If the answer is not in the context, say that you don't know.
        Keep the answer concise.
        
        Context:
        ${context}
        `;

        // 3. Call Groq API
        if (!process.env.GROQ_API_KEY) {
            // Fallback for demo if key is missing
            return NextResponse.json({
                role: "assistant",
                content: "**[System Notice]** Groq API Key is missing. Here is the context I found:\n\n" + context.substring(0, 500) + "..."
            });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: "llama3-8b-8192",
        });

        const answer = completion.choices[0]?.message?.content || "Sorry, I couldn't generate an answer.";

        return NextResponse.json({ role: "assistant", content: answer });

    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

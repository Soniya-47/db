import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testEmbedding() {
    console.log("Testing OpenAI Embeddings...");
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
        console.error("Error: OPENAI_API_KEY not found in .env.local");
        return;
    }

    try {
        const openai = new OpenAI({ apiKey: key });
        const text = "Hello world";

        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });

        const embedding = response.data[0].embedding;

        console.log("Success! Embedding generated.");
        console.log("Dimensions:", embedding.length);
        console.log("Sample:", embedding.slice(0, 5));
    } catch (error) {
        console.error("Embedding Failed:", error);
    }
}

testEmbedding();

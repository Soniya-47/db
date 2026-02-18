const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

export { }; // Make this a module

async function testEmbedding() {
    console.log("Testing Google Embeddings...");
    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
        console.error("Error: GOOGLE_API_KEY not found in .env.local");
        return;
    }
    console.log("API Key found (length):", key.length);

    try {
        const genAI = new GoogleGenerativeAI(key);
        // Using the model we switched to
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

        const text = "Hello world";
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        console.log("Success! Embedding generated.");
        console.log("Dimensions:", embedding.length);
        console.log("Sample:", embedding.slice(0, 5));
    } catch (error: any) {
        console.error("Embedding Failed:", error);
    }
}

testEmbedding();

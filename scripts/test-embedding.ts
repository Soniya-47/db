import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testEmbedding() {
    console.log("Testing Hugging Face Embeddings...");
    const key = process.env.HUGGINGFACE_API_KEY;
    if (!key) {
        console.error("Error: HUGGINGFACE_API_KEY not found in .env.local");
        return;
    }

    try {
        const hf = new HfInference(key);
        const text = "Hello world";

        const response = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: text,
        });

        // Ensure it's an array
        const embedding = response as number[];

        console.log("Success! Embedding generated.");
        console.log("Dimensions:", embedding.length);
        console.log("Sample:", embedding.slice(0, 5));
    } catch (error) {
        console.error("Embedding Failed:", error);
    }
}

testEmbedding();

import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testTextGeneration() {
    console.log("Testing Hugging Face Text Generation...");
    const key = process.env.HUGGINGFACE_API_KEY;
    if (!key) {
        console.error("Error: HUGGINGFACE_API_KEY not found in .env.local");
        return;
    }
    console.log("API Key found (length):", key.length);

    try {
        const hf = new HfInference(key);

        // Falling back to a very basic model to test connectivity
        const response = await hf.textGeneration({
            model: "gpt2",
            inputs: "Hello world, tell me a joke.",
            parameters: {
                max_new_tokens: 50,
            }
        });

        console.log("Success! Response generated.");
        console.log("Response:", response.generated_text);
    } catch (error) {
        console.error("Text Generation Failed:", error);
    }
}

testTextGeneration();

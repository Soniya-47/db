import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testTextGeneration() {
    console.log("Testing OpenAI Text Generation...");
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
        console.error("Error: OPENAI_API_KEY not found in .env.local");
        return;
    }

    try {
        const openai = new OpenAI({ apiKey: key });

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: "Hello world, tell me a joke." }
            ],
            max_tokens: 100,
        });

        console.log("Success! Response generated.");
        console.log("Response:", response.choices[0].message.content);
    } catch (error) {
        console.error("Text Generation Failed:", error);
    }
}

testTextGeneration();

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

export { }; // Make this a module


async function listModels() {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) return console.error("No API Key");

    const genAI = new GoogleGenerativeAI(key);

    // We need to use the model manager if available, or just try to get a model
    // The SDK doesn't have a direct 'listModels' on the instance in 0.24.1?
    // Let's try to verify if we can list them.
    // Actually, looking at docs, it's usually via API.

    // Let's try a direct fetch to the API to be sure, avoiding SDK quirks.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach((m: any) => {
                if (m.name.includes("embed") || m.supportedGenerationMethods?.includes("embedContent")) {
                    console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();

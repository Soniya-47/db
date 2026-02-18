const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

export { };

// We need to use the REST API manually to list models if the SDK doesn't expose it easily?
// Actually, let's just try to infer from the error message.
// But wait, the error message clearly says `models/embedding-001` or `models/text-embedding-004` not found. 

// Let's try to query the `models` endpoint using fetch directly.
async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();

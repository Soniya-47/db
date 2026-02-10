"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function generateStudyNotes(videoUrl: string) {
    if (!process.env.GOOGLE_API_KEY) {
        return { error: "Google API Key is not configured." };
    }

    try {
        const videoIdMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
            return { error: "Invalid YouTube URL." };
        }

        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

        if (!transcriptItems || transcriptItems.length === 0) {
            return { error: "No transcript available for this video." };
        }

        const transcriptText = transcriptItems.map((item) => item.text).join(" ");

        // Truncate if too long (Gemini Pro has a large context window but good to be safe/efficient)
        const truncatedTranscript = transcriptText.slice(0, 30000);

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
      You are an expert AI study assistant. 
      Read the following YouTube video transcript and generate comprehensive study notes.
      
      Return the output strictly as a JSON object with the following keys:
      {
        "summary": "A concise paragraph summarizing the video.",
        "keyTakeaways": ["List of 3-5 key bullet points"],
        "studyNotes": "Detailed notes in Markdown format, using headers and bullet points."
      }

      Do not wrap the JSON in code blocks (lik \`\`\`json). Return raw JSON only.
      
      Transcript:
      ${truncatedTranscript}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up if the model wraps in code blocks despite instructions
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const data = JSON.parse(text);

        return {
            summary: data.summary,
            keyTakeaways: data.keyTakeaways,
            studyNotes: data.studyNotes
        };

    } catch (error) {
        console.error("AI Generation Error:", error);
        return { error: "Failed to generate notes. The video might not have captions or the API limit was reached." };
    }
}

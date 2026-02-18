import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface StudyNotesResponse {
    summary?: string;
    keyTakeaways?: string[];
    studyNotes?: string;
    error?: string;
}

export async function generateStudyNotesLogic(videoUrl: string): Promise<StudyNotesResponse> {
    if (!process.env.OPENAI_API_KEY) {
        return { error: "OpenAI API Key is not configured." };
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
        // OpenAI context window is large, but let's keep it reasonable.
        const truncatedTranscript = transcriptText.slice(0, 50000);

        const prompt = `
      You are an expert AI study assistant. 
      Read the following YouTube video transcript and generate comprehensive study notes.
      
      Return the output strictly as a JSON object with the following keys:
      {
        "summary": "A concise paragraph summarizing the video.",
        "keyTakeaways": ["List of 3-5 key bullet points"],
        "studyNotes": "Detailed notes in Markdown format, using headers and bullet points."
      }

      Do not wrap the JSON in code blocks (like \`\`\`json). Return raw JSON only.
      
      Transcript:
      ${truncatedTranscript}
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }, // Ensure JSON mode
            temperature: 0.7,
        });

        const text = response.choices[0].message.content || "";

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Failed to parse JSON from AI:", text);
            return { error: "AI response was not valid JSON. Please try again." };
        }

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

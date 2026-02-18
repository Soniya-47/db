import { YoutubeTranscript } from "youtube-transcript";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export interface StudyNotesResponse {
    summary?: string;
    keyTakeaways?: string[];
    studyNotes?: string;
    error?: string;
}

export async function generateStudyNotesLogic(videoUrl: string): Promise<StudyNotesResponse> {
    if (!process.env.HUGGINGFACE_API_KEY) {
        return { error: "Hugging Face API Key is not configured." };
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
        // Hugging Face models have context limits, but Mixtral is generous. Still good to be safe.
        const truncatedTranscript = transcriptText.slice(0, 30000);

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

        const response = await hf.chatCompletion({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [
                { role: "user", content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.7,
        });

        let text = response.choices[0].message.content || "";

        // Clean up if the model wraps in code blocks despite instructions
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
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

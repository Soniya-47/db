"use server";

import { generateStudyNotesLogic } from "@/lib/ai-service";

export async function generateStudyNotes(videoUrl: string) {
    return await generateStudyNotesLogic(videoUrl);
}

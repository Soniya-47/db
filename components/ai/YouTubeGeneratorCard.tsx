"use client";

import { useState } from "react";
import { generateStudyNotes } from "@/actions/ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Youtube } from "lucide-react";

export default function YouTubeGeneratorCard() {
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setNotes(null);

        try {
            const result = await generateStudyNotes(url);

            if (result.error) {
                setError(result.error);
            } else {
                setNotes(result.notes as string);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    YouTube Video Notes Generator
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Paste a YouTube video URL to generate comprehensive study notes.
                </p>
            </div>

            <div className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="url"
                            required
                            className="block w-full rounded-md border-0 py-2.5 pl-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-none rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            "Generate Notes"
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-4 rounded-md bg-red-50 text-red-700 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {notes && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="prose prose-indigo max-w-none text-sm sm:text-base">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

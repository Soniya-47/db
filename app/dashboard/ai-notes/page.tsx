"use client";

import { useState } from "react";
import { generateStudyNotes } from "@/actions/ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Sparkles, Youtube } from "lucide-react";

export default function AiNotesPage() {
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
            // We need to call the server action here. 
            // Note: Server actions can be imported and called directly in client components.
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
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center justify-center gap-2">
                        <Sparkles className="h-8 w-8 text-indigo-600" />
                        AI Study Notes
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Paste a YouTube video link below to generate comprehensive study notes instantly.
                    </p>
                    <div className="mt-4">
                        <a href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            &larr; Back to Dashboard
                        </a>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-900/5">
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <div className="relative flex-grow">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Youtube className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="url"
                                required
                                className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-none rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating...
                                </div>
                            ) : (
                                "Generate Notes"
                            )}
                        </button>
                    </form>
                    {error && (
                        <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
                    )}
                </div>

                {notes && (
                    <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5 prose prose-indigo max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}

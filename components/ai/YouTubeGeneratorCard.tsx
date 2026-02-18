"use client";

import { useState } from "react";
import { generateStudyNotes } from "@/actions/ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Youtube, BookOpen, ListChecks, FileText, AlertCircle } from "lucide-react";

interface AiResponse {
    summary?: string;
    keyTakeaways?: string[];
    studyNotes?: string;
    error?: string;
}

export default function YouTubeGeneratorCard() {
    const [url, setUrl] = useState("");
    const [data, setData] = useState<AiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValidYoutubeUrl = (url: string) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return regex.test(url);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!url) {
            setError("Please enter a YouTube URL.");
            return;
        }

        if (!isValidYoutubeUrl(url)) {
            setError("Please enter a valid YouTube video URL.");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await generateStudyNotes(url);

            if (result.error) {
                setError(result.error);
            } else {
                setData(result);
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Input Card */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-600" />
                        YouTube Video Notes Generator <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">v2.0</span>
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Paste a YouTube video URL to generate a summary, key takeaways, and detailed study notes.
                    </p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <input
                                type="url"
                                className={`block w-full rounded-md border-0 py-3 pl-4 text-gray-900 ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${error ? 'ring-red-300 focus:ring-red-600' : 'ring-gray-300 focus:ring-indigo-600'
                                    }`}
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    if (error) setError(null);
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !url}
                            className="flex-none rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px] transition-all"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing...
                                </div>
                            ) : (
                                "Generate Notes"
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Summary Card */}
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden md:col-span-2">
                        <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">Video Summary</h3>
                        </div>
                        <div className="p-6 text-gray-700 leading-relaxed">
                            {data.summary}
                        </div>
                    </div>

                    {/* Key Takeaways Card */}
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden h-fit">
                        <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/50 flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-amber-600" />
                            <h3 className="font-semibold text-gray-900">Key Takeaways</h3>
                        </div>
                        <div className="p-6 bg-amber-50/10">
                            <ul className="space-y-3">
                                {data.keyTakeaways?.map((point, i) => (
                                    <li key={i} className="flex gap-3 text-gray-700">
                                        <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Detailed Notes Card */}
                    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden md:col-span-2">
                        <div className="px-6 py-4 border-b border-gray-100 bg-emerald-50/50 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-semibold text-gray-900">Detailed Study Notes</h3>
                        </div>
                        <div className="p-8 prose prose-indigo max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {data.studyNotes || ""}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

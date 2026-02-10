import YouTubeGeneratorCard from "@/components/ai/YouTubeGeneratorCard";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AiToolsPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-5xl space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                            <Sparkles className="h-8 w-8 text-indigo-600" />
                            AI Tools
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Boost your productivity with our suite of AI-powered tools.
                        </p>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 gap-6">
                    <YouTubeGeneratorCard />

                    {/* Future tools can be added here */}
                    {/* <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 border-l-4 border-gray-200">
                <h3 className="font-semibold text-gray-400">More tools coming soon...</h3>
            </div> */}
                </div>

            </div>
        </div>
    );
}

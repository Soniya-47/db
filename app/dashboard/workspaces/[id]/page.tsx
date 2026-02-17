"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Upload, FileText, Send, Loader2, Trash2, Menu, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Document {
    id: number;
    fileName: string;
    createdAt: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function WorkspaceDetailPage() {
    const params = useParams();
    const workspaceId = params.id as string;

    // State
    const [documents, setDocuments] = useState<Document[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Fetch
    useEffect(() => {
        if (workspaceId) {
            fetchDocuments();
        }
    }, [workspaceId]);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/rag/documents?workspaceId=${workspaceId}`);
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (error) {
            console.error("Failed to fetch documents", error);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsUploading(true);
        setUploadStatus("Uploading & Processing...");
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        formData.append("workspaceId", workspaceId);

        try {
            const res = await fetch("/api/rag/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setUploadStatus("Success!");
                fetchDocuments(); // Refresh list
                setTimeout(() => setUploadStatus(""), 2000);
            } else {
                setUploadStatus(`Error: ${data.error}`);
            }
        } catch (error) {
            setUploadStatus("Upload failed.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/rag/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    workspaceId
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Failed to send message." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-gray-950 border border-gray-800 rounded-xl overflow-hidden relative">

            {/* Sidebar (Documents) */}
            <div className={`
                absolute md:relative z-20 w-72 bg-gray-900 border-r border-gray-800 h-full flex flex-col transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm">
                    <h2 className="font-semibold text-white">Documents</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {documents.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No documents yet.</p>
                    ) : (
                        documents.map(doc => (
                            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-indigo-500/30 transition-colors">
                                <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-200 truncate">{doc.fileName}</p>
                                    <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.txt"
                        onChange={handleUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? "Uploading..." : "Upload Document"}
                    </button>
                    {uploadStatus && (
                        <p className={`text-xs mt-2 text-center ${uploadStatus.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                            {uploadStatus}
                        </p>
                    )}
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="absolute inset-0 bg-black/50 z-10 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center gap-3 sticky top-0 z-10">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="font-semibold text-lg text-white">Workspace Chat</h1>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-indigo-500/50" />
                            </div>
                            <p>Upload a document to start chatting!</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`
                                    max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                                    ${msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"}
                                `}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 rounded-2xl rounded-bl-none p-4 border border-gray-700">
                                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about your documents..."
                            className="flex-1 bg-gray-950 border border-gray-800 text-white rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent placeholder:text-gray-600"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

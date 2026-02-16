"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, FileText, Send, Bot, User, Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function DocumentsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);

    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/rag/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                console.error("Upload failed response:", data);
                alert(`Upload failed: ${data.error}\n${data.details || ""}\n${data.hint || ""}`);
            } else {
                alert("File uploaded and processed successfully!");
                setFile(null);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setChatLoading(true);
        setTimeout(scrollToBottom, 100);

        try {
            const res = await fetch("/api/rag/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            const data = await res.json();

            if (data.error) {
                setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
            } else {
                setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { role: "assistant", content: "Failed to send message." }]);
        } finally {
            setChatLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col md:flex-row gap-6">

            {/* Left Panel: Upload */}
            <div className="w-full md:w-1/3 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Upload className="h-5 w-5 text-indigo-600" />
                        Upload Documents
                    </h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept=".pdf,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <Paperclip className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    {file ? file.name : "Click to select PDF or Text file"}
                                </span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Upload & Process"
                            )}
                        </button>
                    </form>
                    <p className="mt-4 text-xs text-gray-500">
                        Supported formats: .pdf, .txt. Files are automatically chunked and indexed for search.
                    </p>
                </div>

                {/* Document List Placeholder (Could be fetched from API) */}
                <div className="bg-white rounded-xl shadow-sm p-6 opacity-70">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                    <div className="text-sm text-gray-500 italic">
                        (List functionality coming soon)
                    </div>
                </div>
            </div>

            {/* Right Panel: Chat */}
            <div className="w-full md:w-2/3 flex flex-col h-[600px] md:h-auto bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-indigo-600" />
                    <h2 className="font-semibold text-gray-900">Document Q&A Assistant</h2>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            <p>Upload a document and start asking questions!</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user"
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                                }`}>
                                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                                    {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                                    <span className="capitalize">{msg.role}</span>
                                </div>
                                <div className={`prose ${msg.role === "user" ? "prose-invert" : ""} max-w-none text-sm`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about your documents..."
                            className="flex-1 rounded-md border-0 py-2.5 pl-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || chatLoading}
                            className="rounded-md bg-indigo-600 p-2.5 text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

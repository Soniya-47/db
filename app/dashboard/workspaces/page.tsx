"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Folder, ArrowRight, Loader2 } from "lucide-react";

interface Workspace {
    id: number;
    name: string;
    createdAt: string;
}

export default function WorkspacesPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const res = await fetch("/api/workspaces");
            if (res.ok) {
                const data = await res.json();
                setWorkspaces(data);
            }
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch("/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newWorkspaceName }),
            });

            if (res.ok) {
                const workspace = await res.json();
                setWorkspaces([workspace, ...workspaces]);
                setNewWorkspaceName("");
                router.push(`/dashboard/workspaces/${workspace.id}`);
            }
        } catch (error) {
            console.error("Failed to create workspace", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Workspaces
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your document collections</p>
                </div>
            </div>

            {/* Create New Workspace */}
            <div className="mb-10 bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-4">Create New Workspace</h2>
                <form onSubmit={handleCreate} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="e.g., Q1 Financial Reports, Biology Research..."
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        className="flex-1 bg-gray-950 border border-gray-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-600"
                        disabled={isCreating}
                    />
                    <button
                        type="submit"
                        disabled={isCreating || !newWorkspaceName.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Create
                    </button>
                </form>
            </div>

            {/* List Workspaces */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : workspaces.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No workspaces yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((workspace) => (
                        <Link
                            key={workspace.id}
                            href={`/dashboard/workspaces/${workspace.id}`}
                            className="group bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                    <Folder className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                {workspace.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-auto">
                                Created {new Date(workspace.createdAt).toLocaleDateString()}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

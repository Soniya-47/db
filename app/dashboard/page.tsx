import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import Link from "next/link";
import { approveUser } from "@/actions/admin";
import { CheckCircle, LogOut, Sparkles, Folder } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const isAdmin = session.user.role === "admin";

    if (isAdmin) {
        const allUsers = await db.select().from(users).orderBy(users.createdAt);
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <LogoutButton />
                    </div>
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:px-6">
                            <h2 className="text-base font-semibold leading-7 text-gray-900">Users</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-500">
                                Manage user access approvals.
                            </p>
                        </div>
                        <div className="border-t border-gray-100">
                            <ul role="list" className="divide-y divide-gray-100">
                                {allUsers.map((user) => (
                                    <li key={user.id} className="flex items-center justify-between gap-x-6 py-5 px-6">
                                        <div className="min-w-0">
                                            <div className="flex items-start gap-x-3">
                                                <p className="text-sm font-semibold leading-6 text-gray-900">{user.name}</p>
                                                <p
                                                    className={`rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${user.isApproved
                                                        ? "text-green-700 bg-green-50 ring-green-600/20"
                                                        : "text-amber-700 bg-amber-50 ring-amber-600/20"
                                                        }`}
                                                >
                                                    {user.isApproved ? "Approved" : "Pending"}
                                                </p>
                                                <p
                                                    className={`rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${user.role === 'admin'
                                                        ? "text-purple-700 bg-purple-50 ring-purple-600/20"
                                                        : "text-gray-600 bg-gray-50 ring-gray-500/10"
                                                        }`}
                                                >
                                                    {user.role}
                                                </p>
                                            </div>
                                            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                                <p className="truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-none items-center gap-x-4">
                                            {!user.isApproved && (
                                                <form
                                                    action={async () => {
                                                        "use server";
                                                        await approveUser(user.id);
                                                    }}
                                                >
                                                    <button
                                                        type="submit"
                                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                    >
                                                        Approve
                                                    </button>
                                                </form>
                                            )}
                                            {user.isApproved && (
                                                <CheckCircle className="h-6 w-6 text-green-500" aria-hidden="true" />
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <LogoutButton />
                </div>
                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="p-8">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Welcome back, {session.user.name}!</h2>
                                <p className="text-gray-500">You are logged in and approved.</p>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-medium text-gray-900">Account Status</h3>
                            <dl className="mt-2 divide-y divide-gray-100">
                                <div className="flex justify-between py-3 text-sm">
                                    <dt className="text-gray-500">Email</dt>
                                    <dd className="text-gray-900">{session.user.email}</dd>
                                </div>
                                <div className="flex justify-between py-3 text-sm">
                                    <dt className="text-gray-500">Role</dt>
                                    <dd className="text-gray-900 capitalize">{session.user.role}</dd>
                                </div>
                                <div className="flex justify-between py-3 text-sm">
                                    <dt className="text-gray-500">Status</dt>
                                    <dd className="text-green-600 font-medium">Active</dd>
                                </div>
                            </dl>
                        </div>
                        <div className="mt-6">
                            <Link href="/dashboard/ai-tools" className="flex items-center justify-center gap-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                <Sparkles className="h-4 w-4" />
                                Open AI Tools
                            </Link>
                        </div>
                        <div className="mt-4">
                            <Link href="/dashboard/workspaces" className="flex items-center justify-center gap-2 w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50">
                                <Folder className="h-4 w-4" />
                                Workspaces (Multi-Doc RAG)
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogoutButton() {
    return (
        <form
            action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
            }}
        >
            <button
                type="submit"
                className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
                <LogOut className="h-4 w-4" />
                Sign out
            </button>
        </form>
    );
}

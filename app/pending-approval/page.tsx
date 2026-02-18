import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function PendingApproval() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                    <ShieldAlert className="h-10 w-10 text-yellow-600" />
                </div>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                    Account Pending Approval
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Your account has been created but requires administrator approval before you can access the dashboard.
                </p>

                <div className="mt-6 border-t border-gray-100 pt-6">
                    <p className="text-xs text-gray-500 mb-4">
                        Please check back later or contact support if this persists.
                    </p>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

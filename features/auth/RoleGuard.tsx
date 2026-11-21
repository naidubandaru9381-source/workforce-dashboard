"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { user, isHydrated } = useSelector((state: RootState) => state.auth);

    if (!isHydrated) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">Restoring session...</p>
            </main>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-6xl font-bold">403</p>

                    <h1 className="mt-4 text-2xl font-semibold">
                        Access Forbidden
                    </h1>

                    <p className="mt-2 text-gray-600">
                        You do not have permission to access this page.
                    </p>

                    <a
                        href="/dashboard"
                        className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </main>
        );
    }

    return <>{children}</>;
}

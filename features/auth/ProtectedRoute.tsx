"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSelector } from "react-redux";

import type { RootState } from "@/store";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();

    const { isAuthenticated, isHydrated } = useSelector(
        (state: RootState) => state.auth,
    );

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        if (!isAuthenticated) {
            const redirectTo = encodeURIComponent(pathname);

            router.replace(`/login?redirect=${redirectTo}`);
        }
    }, [isAuthenticated, isHydrated, pathname, router]);

    if (!isHydrated) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">Restoring session...</p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">Redirecting to login...</p>
            </main>
        );
    }

    return <>{children}</>;
}

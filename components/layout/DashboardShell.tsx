"use client";

import type { ReactNode } from "react";

import ProtectedRoute from "@/features/auth/ProtectedRoute";
import Sidebar from "./Sidebar";

interface DashboardShellProps {
    children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Sidebar />

                <main className="ml-0 min-h-screen bg-white text-gray-900 md:ml-64 dark:bg-gray-950 dark:text-white">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}

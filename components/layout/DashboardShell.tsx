"use client";

import type { ReactNode } from "react";

import ProtectedRoute from "@/features/auth/ProtectedRoute";
import Sidebar from "./Sidebar";

interface DashboardShellProps {
    children: ReactNode;
}

export default function DashboardShell({
    children,
}: DashboardShellProps) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Sidebar />

                <main className="ml-0 min-h-screen md:ml-64">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
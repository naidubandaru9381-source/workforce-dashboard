"use client";

import { useEffect, useState } from "react";

interface MSWProviderProps {
    children: React.ReactNode;
}

let workerStartPromise: Promise<void> | null = null;

function startMSW() {
    if (!workerStartPromise) {
        workerStartPromise = import("@/mocks/browser")
            .then(async ({ worker }) => {
                await worker.start();
            })
            .catch((error) => {
                workerStartPromise = null;
                console.error("Failed to start MSW:", error);
                throw error;
            });
    }

    return workerStartPromise;
}

export default function MSWProvider({ children }: MSWProviderProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        startMSW()
            .then(() => {
                setReady(true);
            })
            .catch(() => {
                setReady(false);
            });
    }, []);

    if (!ready) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">Starting application...</p>
            </main>
        );
    }

    return <>{children}</>;
}

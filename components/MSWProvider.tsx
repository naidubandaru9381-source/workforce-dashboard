"use client";

import { useEffect } from "react";

interface MSWProviderProps {
    children: React.ReactNode;
}

let workerStartPromise: Promise<void> | null = null;

export default function MSWProvider({ children }: MSWProviderProps) {
    useEffect(() => {
        if (!workerStartPromise) {
            workerStartPromise = import("@/mocks/browser")
                .then(async ({ worker }) => {
                    await worker.start();
                })
                .catch((error) => {
                    workerStartPromise = null;

                    console.error("Failed to start MSW:", error);
                });
        }
    }, []);

    return <>{children}</>;
}

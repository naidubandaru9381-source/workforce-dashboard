"use client";

import { useEffect, useState } from "react";

interface MSWProviderProps {
  children: React.ReactNode;
}

let workerStartPromise: Promise<void> | null = null;

export default function MSWProvider({
  children,
}: MSWProviderProps) {
  const [ready, setReady] = useState(
    process.env.NODE_ENV !== "development",
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (!workerStartPromise) {
      workerStartPromise = import("@/mocks/browser")
        .then(async ({ worker }) => {
          await worker.start({
            onUnhandledRequest(request) {
              if (
                request.url.pathname.startsWith(
                  "/api/",
                )
              ) {
                console.warn(
                  `[MSW] Unhandled API request: ${request.method} ${request.url.pathname}`,
                );
              }
            },
          });
        })
        .catch((error) => {
          workerStartPromise = null;

          console.error(
            "Failed to start MSW:",
            error,
          );

          throw error;
        });
    }

    workerStartPromise
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
        <p className="text-gray-600">
          Starting mock API...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
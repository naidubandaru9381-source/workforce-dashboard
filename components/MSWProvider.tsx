"use client";

import { useEffect } from "react";

let workerStarted = false;

export default function MSWProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (workerStarted) {
      return;
    }

    workerStarted = true;

    const startWorker = async () => {
      const { worker } = await import("@/mocks/browser");

      await worker.start({
        onUnhandledRequest: "bypass",
      });
    };

    startWorker().catch((error) => {
      workerStarted = false;
      console.error("Failed to start MSW:", error);
    });
  }, []);

  return null;
}
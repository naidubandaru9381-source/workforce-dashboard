"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener(
      "online",
      updateOnlineStatus,
    );

    window.addEventListener(
      "offline",
      updateOnlineStatus,
    );

    return () => {
      window.removeEventListener(
        "online",
        updateOnlineStatus,
      );

      window.removeEventListener(
        "offline",
        updateOnlineStatus,
      );
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[100] border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800 shadow-sm dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      You are currently offline. Some features may not
      be available until your connection is restored.
    </div>
  );
}
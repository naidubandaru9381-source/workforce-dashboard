"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastStyles(type: ToastType) {
    switch (type) {
        case "success":
            return "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100";

        case "error":
            return "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100";

        case "warning":
            return "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100";

        case "info":
        default:
            return "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100";
    }
}

function getToastLabel(type: ToastType) {
    switch (type) {
        case "success":
            return "Success";

        case "error":
            return "Error";

        case "warning":
            return "Warning";

        case "info":
        default:
            return "Information";
    }
}

export default function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = "info") => {
            const id = `${Date.now()}-${Math.random()}`;

            setToasts((current) => [
                ...current,
                {
                    id,
                    message,
                    type,
                },
            ]);

            window.setTimeout(() => {
                removeToast(id);
            }, 5000);
        },
        [removeToast],
    );

    const value = useMemo(
        () => ({
            showToast,
            removeToast,
        }),
        [showToast, removeToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div
                className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3"
                aria-live="polite"
                aria-atomic="false"
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role={toast.type === "error" ? "alert" : "status"}
                        className={`pointer-events-auto rounded-lg border-l-4 p-4 shadow-lg transition ${getToastStyles(
                            toast.type,
                        )}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">
                                    {getToastLabel(toast.type)}
                                </p>

                                <p className="mt-1 break-words text-sm">
                                    {toast.message}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                aria-label="Close notification"
                                className="shrink-0 rounded p-1 text-lg leading-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }

    return context;
}

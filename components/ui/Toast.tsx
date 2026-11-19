"use client";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  onClose,
}: ToastProps) {
  const typeStyles = {
    success:
      "border-green-200 bg-green-50 text-green-800",
    error:
      "border-red-200 bg-red-50 text-red-800",
    info:
      "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-4 rounded-lg border px-4 py-3 shadow-lg ${typeStyles[type]}`}
    >
      <p className="text-sm font-medium">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-lg font-semibold opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
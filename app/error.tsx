"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div
        className="w-full max-w-md rounded-lg border p-6 text-center shadow-sm"
        role="alert"
      >
        <h1 className="text-xl font-semibold text-red-600">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
We couldn&apos;t load this page. Please try again.        </p>

        {process.env.NODE_ENV === "development" && (
          <p className="mt-3 break-words text-xs text-gray-500">
            {error.message}
          </p>
        )}

        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
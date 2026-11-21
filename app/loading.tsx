export default function Loading() {
    return (
        <main
            className="flex min-h-[60vh] items-center justify-center"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="flex flex-col items-center gap-3">
                <div
                    className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
                    aria-hidden="true"
                />

                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Loading...
                </p>
            </div>
        </main>
    );
}

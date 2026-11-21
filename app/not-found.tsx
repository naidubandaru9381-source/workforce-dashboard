import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="w-full max-w-md text-center">
                <p className="text-6xl font-bold text-gray-300">404</p>

                <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    The page you are looking for does not exist.
                </p>

                <Link
                    href="/dashboard"
                    className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Go to Dashboard
                </Link>
            </div>
        </main>
    );
}

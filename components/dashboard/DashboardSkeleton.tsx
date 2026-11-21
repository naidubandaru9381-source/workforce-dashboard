export function MetricSkeleton() {
    return (
        <div
            className="animate-pulse rounded-xl border bg-white p-5 shadow-sm"
            aria-hidden="true"
        >
            <div className="h-4 w-28 rounded bg-gray-200" />

            <div className="mt-3 h-9 w-20 rounded bg-gray-200" />

            <div className="mt-2 h-4 w-40 rounded bg-gray-200" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <section
            className="rounded-xl border bg-white p-5 shadow-sm"
            aria-hidden="true"
        >
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />

            <div className="mt-6 space-y-5">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index}>
                        <div className="flex justify-between">
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

                            <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
                        </div>

                        <div className="mt-2 h-3 animate-pulse rounded-full bg-gray-200" />
                    </div>
                ))}
            </div>
        </section>
    );
}

export function LeaveSkeleton() {
    return (
        <section
            className="rounded-xl border bg-white p-5 shadow-sm"
            aria-hidden="true"
        >
            <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />

            <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-20 animate-pulse rounded-lg bg-gray-200"
                    />
                ))}
            </div>
        </section>
    );
}

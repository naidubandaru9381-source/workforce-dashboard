import type { DashboardSummary } from "@/types/dashboard";

interface HeadcountWidgetProps {
    data: DashboardSummary["headcountByDepartment"];
}

export default function HeadcountWidget({ data }: HeadcountWidgetProps) {
    const maxCount = Math.max(...data.map((item) => item.count), 0);

    return (
        <section
            className="rounded-xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            aria-labelledby="headcount-heading"
        >
            <h2
                id="headcount-heading"
                className="text-lg font-semibold text-gray-900 dark:text-white"
            >
                Headcount by department
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Active employees grouped by department.
            </p>

            <div
                className="mt-5 space-y-4"
                role="img"
                aria-label="Bar chart showing active employee headcount by department"
            >
                {data.map((item) => {
                    const width =
                        maxCount === 0 ? 0 : (item.count / maxCount) * 100;

                    return (
                        <div key={item.department}>
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span>{item.department}</span>

                                <span className="font-medium text-gray-900 dark:text-white">
                                    {item.count}
                                </span>
                            </div>

                            <div className="mt-1 h-3 rounded-full bg-gray-100 dark:bg-gray-700">
                                <div
                                    className="h-3 rounded-full bg-blue-600"
                                    style={{
                                        width: `${width}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="sr-only">
                <h3>Headcount data table</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Employees</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item) => (
                            <tr key={item.department}>
                                <td>{item.department}</td>
                                <td>{item.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

"use client";

import { useGetEmployeesQuery } from "@/features/employees/employeeApi";

export default function EmployeesPage() {
  const { data, isLoading, isError, error } =
    useGetEmployeesQuery({
      page: 1,
      pageSize: 10,
    });

  return (
    
      <main className="min-h-screen p-8">
        <h1 className="text-3xl font-bold">
          Employees
        </h1>

        {isLoading && (
          <p className="mt-4 text-gray-600">
            Loading employees...
          </p>
        )}

        {isError && (
          <pre className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}

        {data && (
          <div className="mt-6">
            <p className="mb-4">
              Total employees: <strong>{data.total}</strong>
            </p>

            <div className="space-y-2">
              {data.data.map((employee) => (
                <div
                  key={employee.id}
                  className="rounded-lg border p-4"
                >
                  <p className="font-medium">
                    {employee.firstName}{" "}
                    {employee.lastName}
                  </p>

                  <p className="text-sm text-gray-600">
                    {employee.email}
                  </p>

                  <p className="text-sm text-gray-600">
                    {employee.department}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

  );
}
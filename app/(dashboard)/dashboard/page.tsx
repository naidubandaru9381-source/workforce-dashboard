import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome to the Workforce Dashboard.
      </p>

      <Link
        href="/employees"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        View Employees
      </Link>
    </main>
  );
}

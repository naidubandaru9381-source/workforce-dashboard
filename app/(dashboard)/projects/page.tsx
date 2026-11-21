"use client";

import { useGetProjectsQuery } from "@/features/projects/projectApi";
import Link from "next/link";
export default function ProjectsPage() {
    const { data, isLoading, isError } = useGetProjectsQuery();

    if (isLoading) {
        return (
            <div className="p-6">
                <p>Loading projects...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6">
                <p className="text-red-600">Failed to load projects.</p>
            </div>
        );
    }

    return (
        <main className="p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage workforce projects and tasks.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data?.data.map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <h2 className="font-semibold">{project.name}</h2>

                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs capitalize">
                                {project.status}
                            </span>
                        </div>

                        <p className="mb-4 text-sm text-gray-600">
                            {project.description}
                        </p>

                        <div className="text-xs text-gray-500">
                            Manager: {project.managerId}
                        </div>
                    </Link>
                ))}
            </div>

            <p className="mt-6 text-sm text-gray-500">
                Total projects: {data?.total ?? 0}
            </p>
        </main>
    );
}

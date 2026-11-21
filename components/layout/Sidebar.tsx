"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import type { RootState } from "@/store";
import type { UserRole } from "@/types/auth";

interface NavItem {
    label: string;
    href: string;
    roles: UserRole[];
}

const navigationItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        roles: ["admin", "manager", "employee"],
    },
    {
        label: "Employees",
        href: "/employees",
        roles: ["admin", "manager"],
    },
    {
        label: "Projects",
        href: "/projects",
        roles: ["admin", "manager", "employee"],
    },
    {
        label: "Leave",
        href: "/leave",
        roles: ["admin", "manager", "employee"],
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    const user = useSelector((state: RootState) => state.auth.user);

    if (!user) {
        return null;
    }

    const visibleItems = navigationItems.filter((item) =>
        item.roles.includes(user.role),
    );

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-20 flex-col border-r bg-white md:w-64">
            {/* Header */}
            <div className="border-b px-2 py-5 md:px-6">
                <h1 className="hidden text-xl font-bold md:block">Workforce</h1>

                <p className="hidden mt-1 text-sm capitalize text-gray-500 md:block">
                    {user.role}
                </p>

                {/* Mobile logo */}
                <p className="text-center text-xl font-bold md:hidden">W</p>
            </div>

            {/* Navigation */}
            <nav
                aria-label="Main navigation"
                className="flex-1 space-y-1 p-2 md:p-4"
            >
                {visibleItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.label}
                            className={`block rounded-lg px-2 py-3 text-center text-sm font-medium transition md:px-4 md:text-left ${
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {/* Mobile */}
                            <span className="md:hidden">
                                {item.label.charAt(0)}
                            </span>

                            {/* Desktop */}
                            <span className="hidden md:inline">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="border-t p-2 md:p-4">
                {/* Mobile */}
                <p className="text-center text-sm font-bold md:hidden">
                    {user.name.charAt(0).toUpperCase()}
                </p>

                {/* Desktop */}
                <p className="hidden truncate text-sm font-medium md:block">
                    {user.name}
                </p>

                <p className="hidden truncate text-xs text-gray-500 md:block">
                    {user.email}
                </p>
            </div>
        </aside>
    );
}

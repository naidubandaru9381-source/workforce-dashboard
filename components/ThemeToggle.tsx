"use client";

import { useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "workforce-theme";

function getInitialTheme(): Theme {
    if (typeof window === "undefined") {
        return "light";
    }

    const savedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";

        document.documentElement.classList.toggle("dark", nextTheme === "dark");

        document.documentElement.style.colorScheme = nextTheme;

        window.localStorage.setItem(STORAGE_KEY, nextTheme);

        setTheme(nextTheme);
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                theme === "light"
                    ? "Switch to dark theme"
                    : "Switch to light theme"
            }
            title={
                theme === "light"
                    ? "Switch to dark theme"
                    : "Switch to light theme"
            }
            className="fixed right-5 top-5 z-[90] flex h-10 w-10 items-center justify-center rounded-full border bg-white text-lg shadow-md transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
            <span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>
        </button>
    );
}

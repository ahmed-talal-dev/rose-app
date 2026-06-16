"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setMounted(true);
        });

        return () => window.cancelAnimationFrame(frame);
    }, []);

    if (!mounted) {
        return (
            <button
                className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center bg-transparent"
                disabled
            />
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
            {theme === "dark" ? (
                <Sun className="size-5 text-amber-500" />
            ) : (
                <Moon className="size-5 text-zinc-700" />
            )}
        </button>
    );
}
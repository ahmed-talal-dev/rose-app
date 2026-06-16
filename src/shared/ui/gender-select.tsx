"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface GenderSelectProps {
    value?: "MALE" | "FEMALE";
    onChange: (val: "MALE" | "FEMALE") => void;
    placeholder: string;
    maleLabel: string;
    femaleLabel: string;
    hasError?: boolean;
}

export function GenderSelect({
    value, onChange, placeholder, maleLabel, femaleLabel, hasError,
}: GenderSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close the dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const options = [
        { value: "MALE" as const, label: maleLabel, icon: "♂" },
        { value: "FEMALE" as const, label: femaleLabel, icon: "♀" },
    ];
    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative w-full" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
                    w-full h-10 lg:h-12.25 flex items-center justify-between
                    rounded-[10px] border px-4 text-sm font-inter transition-colors outline-none
                    ${open ? "border-primary-700 dark:border-rose-300 ring-2 ring-primary-700/20 dark:ring-rose-300/20 bg-white dark:bg-[#3A3B3F]" : hasError ? "border-red-500 bg-white dark:bg-[#3A3B3F]" : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#3A3B3F]"}
                    ${selected ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}
                `}
            >
                <span className="flex items-center gap-2">
                    {selected ? (
                        <><span className="text-base leading-none text-primary-700 dark:text-rose-300">{selected.icon}</span>{selected.label}</>
                    ) : placeholder}
                </span>
                <ChevronDown className={`size-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute top-full inset-s-0 mt-1.5 w-full bg-white dark:bg-[#3A3B3F] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-[200] p-1 text-start">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`
                                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-inter transition-colors text-start
                                ${value === opt.value ? "bg-primary-50 dark:bg-zinc-800 text-primary-700 dark:text-rose-300 font-medium" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}
                            `}
                        >
                            <span className="text-base leading-none text-primary-700 dark:text-rose-300">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
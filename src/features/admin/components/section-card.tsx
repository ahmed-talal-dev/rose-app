import { ReactNode } from "react";

interface SectionCardProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export function SectionCard({ title, children, className = "" }: SectionCardProps) {
    return (
        <div className={`bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 md:p-6 flex flex-col gap-4 shadow-sm ${className}`}>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{title}</h2>
            {children}
        </div>
    );
}

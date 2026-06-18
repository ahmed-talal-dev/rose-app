import { RevenueFilter } from "../types/dashboard";

interface RevenueFilterToggleProps {
    filter: RevenueFilter;
    onChange: (f: RevenueFilter) => void;
}

export function RevenueFilterToggle({ filter, onChange }: RevenueFilterToggleProps) {
    return (
        <div className="flex items-center gap-2 text-sm shrink-0 font-sans">
            <button
                type="button"
                onClick={() => onChange("monthly")}
                className={`transition-colors cursor-pointer border-none bg-transparent outline-none p-0 h-4.25 leading-4.25 ${filter === "monthly"
                        ? "text-primary-600 font-semibold"
                        : "text-zinc-400 font-normal hover:text-zinc-500"
                    }`}
            >
                Monthly
            </button>
            <button
                type="button"
                onClick={() => onChange("weekly")}
                className={`transition-colors cursor-pointer border-none bg-transparent outline-none p-0 h-4.25 leading-4.25 ${filter === "weekly"
                        ? "text-primary-600 font-semibold"
                        : "text-zinc-400 font-normal hover:text-zinc-500"
                    }`}
            >
                Last Week
            </button>
        </div>
    );
}

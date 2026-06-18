import { ProductItem } from "../types/dashboard";

const getRankStyle = (rank: number) => {
    switch (rank) {
        case 1:
            return {
                bg: "bg-gradient-to-r from-[rgba(250,199,117,0.25)] to-[rgba(250,199,117,0.06)]",
                weight: "font-bold",
            };
        case 2:
            return {
                bg: "bg-gradient-to-r from-[rgba(180,178,169,0.25)] to-[rgba(180,178,169,0.06)]",
                weight: "font-semibold",
            };
        case 3:
            return {
                bg: "bg-gradient-to-r from-[rgba(239,159,39,0.25)] to-[rgba(239,159,39,0.06)]",
                weight: "font-semibold",
            };
        default:
            return {
                bg: "bg-transparent",
                weight: "font-normal",
            };
    }
};

export function TopProductRow({ name, price, sales, rank }: ProductItem) {
    const { bg, weight } = getRankStyle(rank);

    return (
        <div className={`flex justify-between items-center px-2.5 py-1.5 rounded h-8 shrink-0 ${bg}`}>
            <div className="flex items-center gap-1 min-w-0 flex-1 mr-4">
                <span className={`text-xs text-zinc-800 dark:text-zinc-200 truncate ${weight}`}>
                    {name}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap shrink-0 font-normal">
                    ({price})
                </span>
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap shrink-0 text-right">
                {sales.toLocaleString()} Sales
            </span>
        </div>
    );
}

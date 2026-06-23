import { useTranslations } from "next-intl";
import { StockItem } from "../types/dashboard";

export function StockRow({ name, stock }: StockItem) {
    const t = useTranslations("admin.overview");
    const isLowStock = stock <= 4;
    const textColorClass = isLowStock
        ? "text-red-600 font-bold"
        : "text-zinc-800 dark:text-zinc-200";

    return (
        <div className="flex justify-between items-center h-7 border-b border-black/8 dark:border-white/8 last:border-b-0">
            <span className="text-base font-normal text-zinc-800 dark:text-zinc-300 truncate flex-1 mr-4">
                {name}
            </span>
            <span className={`text-sm font-medium whitespace-nowrap ${textColorClass}`}>
                {t("productsCount", { count: stock })}
            </span>
        </div>
    );
}

import { useTranslations } from "next-intl";

interface CategoryRowProps {
    name: string;
    count: number;
}

export function CategoryRow({ name, count }: CategoryRowProps) {
    const t = useTranslations("admin.overview");

    return (
        <div className="flex justify-between items-center h-8.75 border-b border-black/8 dark:border-white/8 last:border-b-0">
            <span className="text-base font-normal text-zinc-800 dark:text-zinc-200">{name}</span>
            <span className="bg-black/5 dark:bg-white/10 rounded-md px-2 py-1 text-sm font-medium text-zinc-800 dark:text-zinc-300">
                {t("productsCount", { count })}
            </span>
        </div>
    );
}

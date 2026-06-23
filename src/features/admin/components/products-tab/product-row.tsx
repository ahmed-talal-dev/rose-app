import { Edit, Trash2, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { Product } from "@/features/products/types";
import { formatStock } from "./types";

interface ProductRowProps {
    product: Product;
    isHighlighted: boolean;
    onEdit: (p: Product) => void;
    onDelete: (p: Product) => void;
    activeRowMenuId: string | null;
    setActiveRowMenuId: (id: string | null) => void;
}

export function ProductRow({
    product: prod,
    isHighlighted,
    onEdit,
    onDelete,
    activeRowMenuId,
    setActiveRowMenuId,
}: ProductRowProps) {
    const t = useTranslations("admin.products");
    const tCommon = useTranslations("common");
    const isLowStock = prod.stock <= 10;
    const menuOpen = activeRowMenuId === prod.id;

    return (
        <tr
            className={`${isHighlighted
                    ? "bg-primary-50 dark:bg-primary-950/20"
                    : "bg-white dark:bg-zinc-900 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20"
                } transition-colors h-14`}
        >
            <td className="px-4 md:px-6 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-200 font-sans truncate max-w-32 md:max-w-56">
                {prod.title}
            </td>
            <td className="px-4 md:px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 font-sans whitespace-nowrap">
                {prod.price} {tCommon("currency")}
            </td>
            <td className={`px-4 md:px-6 py-3 text-sm font-sans whitespace-nowrap ${isLowStock ? "text-red-600 font-bold" : "text-zinc-500 dark:text-zinc-400 font-medium"
                }`}>
                {formatStock(prod.stock)}
            </td>
            <td className="hidden md:table-cell px-4 md:px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 font-sans whitespace-nowrap">
                {formatStock(prod.sold ?? 0)}
            </td>
            <td className="hidden md:table-cell px-4 md:px-6 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sans whitespace-nowrap">
                <span className="font-bold">{prod.rating}/5</span>{" "}
                <span className="text-zinc-400 font-normal">({prod.ratings})</span>
            </td>
            <td className="px-4 md:px-6 py-3 text-sm text-right relative">
                {/* Desktop */}
                <div className="hidden md:flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => onEdit(prod)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer font-sans bg-blue-50 text-blue-500 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
                    >
                        <Edit size={14} /> {t("actions.edit")}
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(prod)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer font-sans bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                        <Trash2 size={14} /> {t("actions.delete")}
                    </button>
                </div>

                {/* Mobile */}
                <div className="flex md:hidden justify-end">
                    <button
                        type="button"
                        onClick={() => setActiveRowMenuId(menuOpen ? null : prod.id)}
                        className="p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer border-none bg-transparent"
                    >
                        <MoreVertical size={18} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-4 top-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-1 w-24 z-20 flex flex-col gap-0.5 animate-fade-in">
                            <button
                                type="button"
                                onClick={() => { setActiveRowMenuId(null); onEdit(prod); }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-left rounded-md text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer text-blue-500"
                            >
                                <Edit size={12} /> {t("actions.edit")}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveRowMenuId(null); onDelete(prod); }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-left rounded-md text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer text-red-600"
                            >
                                <Trash2 size={12} /> {t("actions.delete")}
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}

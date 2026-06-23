import { Plus, Search, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Product } from "@/features/products/types";
import { ProductRow } from "./product-row";
import { Pagination } from "@/features/admin/components/pagination";

interface ProductListProps {
    products: Product[];
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    currentPage: number;
    totalPages: number;
    onOpenAdd: () => void;
    onOpenEdit: (p: Product) => void;
    onDelete: (p: Product) => void;
    isLoading: boolean;
    activeRowMenuId: string | null;
    setActiveRowMenuId: (id: string | null) => void;
    handlePageChange: (page: number) => void;
}

export function ProductList({
    products,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    onOpenAdd,
    onOpenEdit,
    onDelete,
    isLoading,
    activeRowMenuId,
    setActiveRowMenuId,
    handlePageChange,
}: ProductListProps) {
    const t = useTranslations("admin.products");
    const MAX_VISIBLE_PAGES = 3;
    const pages = Array.from(
        { length: Math.min(totalPages, MAX_VISIBLE_PAGES) },
        (_, i) => i + 1
    );

    return (
        <div className="animate-fade-in w-full">
            <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col w-full">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 h-10 gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-200 font-sans">
                        {t("allProducts")}
                    </h1>
                    <button
                        type="button"
                        onClick={onOpenAdd}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer shadow-sm font-sans shrink-0"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">{t("addNewProductBtn")}</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all font-sans"
                    />
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary-600" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-xl">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 h-11">
                                        {[t("tableName"), t("tablePrice"), t("tableStock"), t("tableSales"), t("tableRatings"), ""].map((h, i) => (
                                            <th
                                                key={i}
                                                className={`px-4 md:px-6 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-300 font-sans ${i >= 3 && i <= 4 ? "hidden md:table-cell" : ""
                                                    }`}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {products.map((prod, index) => (
                                        <ProductRow
                                            key={prod.id}
                                            product={prod}
                                            isHighlighted={index === 1}
                                            onEdit={onOpenEdit}
                                            onDelete={onDelete}
                                            activeRowMenuId={activeRowMenuId}
                                            setActiveRowMenuId={setActiveRowMenuId}
                                        />
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-400 font-sans">
                                                {t("noSearchProducts")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

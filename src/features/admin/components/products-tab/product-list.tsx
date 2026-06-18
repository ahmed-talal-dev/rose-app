import {
    Plus, Search, Loader2, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Product } from "@/features/products/types";
import { ProductRow } from "./product-row";

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
                        All Products
                    </h1>
                    <button
                        type="button"
                        onClick={onOpenAdd}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer shadow-sm font-sans shrink-0"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Add a new product</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search..."
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
                                        {["Name", "Price", "Stock", "Sales", "Ratings", ""].map((h, i) => (
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
                                                No products match your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-2">
                                <div className="flex items-center gap-1.5 font-sans">
                                    <PaginationButton onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                                        <ChevronsLeft size={14} />
                                    </PaginationButton>
                                    <PaginationButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                        <ChevronLeft size={14} />
                                    </PaginationButton>

                                    {pages.map((p) => (
                                        <PaginationButton
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            active={currentPage === p}
                                        >
                                            {p}
                                        </PaginationButton>
                                    ))}

                                    {totalPages > MAX_VISIBLE_PAGES && (
                                        <>
                                            <span className="text-zinc-400 px-1 select-none">...</span>
                                            <PaginationButton
                                                onClick={() => handlePageChange(totalPages)}
                                                active={currentPage === totalPages}
                                            >
                                                {totalPages}
                                            </PaginationButton>
                                        </>
                                    )}

                                    <PaginationButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                        <ChevronRight size={14} />
                                    </PaginationButton>
                                    <PaginationButton onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                                        <ChevronsRight size={14} />
                                    </PaginationButton>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

interface PaginationButtonProps {
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    children: React.ReactNode;
}

function PaginationButton({ onClick, disabled, active, children }: PaginationButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`w-8 h-8 rounded text-sm font-semibold flex items-center justify-center cursor-pointer transition-colors border ${active
                    ? "bg-primary-50 text-primary-600 border-primary-600/30"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
}

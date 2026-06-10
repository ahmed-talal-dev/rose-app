"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useLocale } from "next-intl";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const locale = useLocale();
    const isRtl = locale === "ar";

    if (totalPages <= 1) return null;

    // Build the page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const range = 1; // Number of pages to show on each side of active page

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - range && i <= currentPage + range)
            ) {
                pages.push(i);
            } else if (
                (i === currentPage - range - 1 && i > 1) ||
                (i === currentPage + range + 1 && i < totalPages)
            ) {
                pages.push("..");
            }
        }

        // Remove duplicates and filter
        return pages.filter((item, index) => pages.indexOf(item) === index);
    };

    const pages = getPageNumbers();

    // Arrows handling with RTL respect
    // Prev / Next icons flip direction based on RTL
    const LeftIcon = isRtl ? ChevronRight : ChevronLeft;
    const RightIcon = isRtl ? ChevronLeft : ChevronRight;
    const DoubleLeftIcon = isRtl ? ChevronsRight : ChevronsLeft;
    const DoubleRightIcon = isRtl ? ChevronsLeft : ChevronsRight;

    return (
        <div className="flex justify-center items-center gap-1.5 py-8 select-none">
            
            {/* First Page button */}
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="size-8 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="First page"
            >
                <DoubleLeftIcon className="size-4" />
            </button>

            {/* Prev Page button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="size-8 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
            >
                <LeftIcon className="size-4" />
            </button>

            {/* Page number buttons */}
            {pages.map((page, index) => {
                if (page === "..") {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="size-8 flex items-center justify-center text-zinc-400 font-sarabun text-sm"
                        >
                            ..
                        </span>
                    );
                }

                const isActive = page === currentPage;
                return (
                    <button
                        key={`page-${page}`}
                        onClick={() => onPageChange(Number(page))}
                        className={`size-8 flex items-center justify-center border text-sm font-semibold rounded-md font-sarabun transition-all cursor-pointer ${
                            isActive
                                ? "bg-[#A6252A] border-[#A6252A] text-white"
                                : "border-zinc-200 dark:border-zinc-700 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Next Page button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="size-8 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
            >
                <RightIcon className="size-4" />
            </button>

            {/* Last Page button */}
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="size-8 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Last page"
            >
                <DoubleRightIcon className="size-4" />
            </button>
        </div>
    );
}

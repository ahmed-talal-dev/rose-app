"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/features/products/hooks";
import { useCategories } from "@/features/categories/hooks";
import { useOccasions } from "@/features/occasions/hooks";
import { ProductCard } from "@/features/products/components/product-card";
import { SidebarFilters } from "@/features/products/components/sidebar-filters";
import { Pagination } from "@/features/products/components/pagination";
import { ProductCardSkeleton } from "@/features/home/components/product-card-skeleton";
import { Filter, SlidersHorizontal, ChevronDown, RefreshCw, X } from "lucide-react";
import { useState, useTransition } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/shared/ui/dropdown-menu";

export default function ProductsPage() {
    const t = useTranslations("products");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Parse params from URL
    const activeCategoryId = searchParams.get("category") || null;
    const activeOccasionId = searchParams.get("occasion") || null;
    const activeRating = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;
    const activeMinPrice = searchParams.get("minPrice") || "";
    const activeMaxPrice = searchParams.get("maxPrice") || "";
    const activeSearch = searchParams.get("search") || "";
    const activeSortBy = (searchParams.get("sortBy") as "price" | "rating" | "createdAt") || "createdAt";
    const activeSortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const activePage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

    const limit = 9; // Grid of 3x3

    // Fetch filters options
    const { data: categoriesData } = useCategories({ limit: 100 });
    const { data: occasionsData } = useOccasions({ limit: 100 });

    // Fetch products list dynamically from backend
    // When searching, fetch all products for client-side filtering (API doesn't support search param)
    const { data: productsData, isLoading: isProductsLoading } = useProducts({
        categoryId: activeCategoryId || undefined,
        occasionId: activeOccasionId || undefined,
        minPrice: activeMinPrice ? Number(activeMinPrice) : undefined,
        maxPrice: activeMaxPrice ? Number(activeMaxPrice) : undefined,
        sortBy: activeSortBy,
        sortOrder: activeSortOrder,
        page: activeSearch ? undefined : activePage,
        limit: activeSearch ? 200 : limit,
    });

    const categories = categoriesData?.data || [];
    const occasions = occasionsData?.data || [];
    const allProducts = productsData?.data || [];
    const meta = productsData?.metadata;

    // Client-side search filter (API doesn't support search param)
    const searchFiltered = activeSearch
        ? allProducts.filter((p) =>
            p.title.toLowerCase().includes(activeSearch.toLowerCase())
        )
        : allProducts;

    // Filter products client-side for rating filter
    const displayedProducts = activeRating
        ? searchFiltered.filter((p) => Math.round(Number(p.rating)) >= activeRating)
        : searchFiltered;

    // For search, we handle pagination client-side
    const paginatedProducts = activeSearch
        ? displayedProducts.slice((activePage - 1) * limit, activePage * limit)
        : displayedProducts;

    const totalPages = activeSearch
        ? Math.ceil(displayedProducts.length / limit) || 1
        : meta?.totalPages || 1;

    // Update query parameters in the URL
    const updateParams = (newParams: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        // Reset page to 1 on filter changes (except when specifically changing the page)
        if (!newParams.hasOwnProperty("page")) {
            params.set("page", "1");
        }

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    // Filter Handlers
    const handleCategoryChange = (id: string | null) => {
        updateParams({ category: id });
    };

    const handleOccasionChange = (id: string | null) => {
        updateParams({ occasion: id });
    };

    const handleRatingChange = (rating: number | null) => {
        updateParams({ rating: rating });
    };

    const handlePriceChange = (min: string, max: string) => {
        updateParams({ minPrice: min || null, maxPrice: max || null });
    };

    const handlePageChange = (page: number) => {
        updateParams({ page });
    };

    const handleSortChange = (sortBy: string, sortOrder: string) => {
        updateParams({ sortBy, sortOrder });
    };

    const handleResetAll = () => {
        startTransition(() => {
            router.push(pathname);
        });
    };

    const sortOptions = [
        { label: t("sortNewest"), sortBy: "createdAt", sortOrder: "desc" },
        { label: t("sortPriceAsc"), sortBy: "price", sortOrder: "asc" },
        { label: t("sortPriceDesc"), sortBy: "price", sortOrder: "desc" },
        { label: t("sortRating"), sortBy: "rating", sortOrder: "desc" },
    ];

    const currentSortOption = sortOptions.find(
        (o) => o.sortBy === activeSortBy && o.sortOrder === activeSortOrder
    ) || sortOptions[0];

    return (
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            
            {/* Mobile-only Filter & Sort Toolbar */}
            <div className="flex lg:hidden justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-6 w-full">
                <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-750 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                    <Filter className="size-3.5" />
                    <span>{t("filters")}</span>
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-750 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                            <SlidersHorizontal className="size-3.5" />
                            <span>{currentSortOption.label}</span>
                            <ChevronDown className="size-3 text-zinc-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[180px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-1 z-50">
                        {sortOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.label}
                                onClick={() => handleSortChange(option.sortBy, option.sortOrder)}
                                className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer text-start"
                            >
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* ── Desktop Sidebar Filters ── */}
                <div className="hidden lg:block shrink-0">
                    <SidebarFilters
                        categories={categories}
                        occasions={occasions}
                        activeCategoryId={activeCategoryId}
                        activeOccasionId={activeOccasionId}
                        activeRating={activeRating}
                        activeMinPrice={activeMinPrice}
                        activeMaxPrice={activeMaxPrice}
                        onCategoryChange={handleCategoryChange}
                        onOccasionChange={handleOccasionChange}
                        onRatingChange={handleRatingChange}
                        onPriceChange={handlePriceChange}
                        onResetAll={handleResetAll}
                    />
                </div>

                {/* ── Mobile Sidebar Filters drawer/modal ── */}
                {mobileFiltersOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setMobileFiltersOpen(false)}
                        />
                        {/* Drawer body */}
                        <div className="relative w-[320px] max-w-full h-full bg-white dark:bg-zinc-900 shadow-2xl p-6 overflow-y-auto z-10 flex flex-col gap-4">
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="font-sarabun font-bold text-lg text-zinc-800 dark:text-zinc-100">
                                    {t("filters")}
                                </span>
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer border-none bg-transparent"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                            <SidebarFilters
                                categories={categories}
                                occasions={occasions}
                                activeCategoryId={activeCategoryId}
                                activeOccasionId={activeOccasionId}
                                activeRating={activeRating}
                                activeMinPrice={activeMinPrice}
                                activeMaxPrice={activeMaxPrice}
                                onCategoryChange={(id) => {
                                    handleCategoryChange(id);
                                    setMobileFiltersOpen(false);
                                }}
                                onOccasionChange={(id) => {
                                    handleOccasionChange(id);
                                    setMobileFiltersOpen(false);
                                }}
                                onRatingChange={(rating) => {
                                    handleRatingChange(rating);
                                    setMobileFiltersOpen(false);
                                }}
                                onPriceChange={(min, max) => {
                                    handlePriceChange(min, max);
                                    setMobileFiltersOpen(false);
                                }}
                                onResetAll={() => {
                                    handleResetAll();
                                    setMobileFiltersOpen(false);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Content Grid Area ── */}
                <div className="flex-1 w-full">
                    {isProductsLoading || isPending ? (
                        /* Loading state: skeleton grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-full flex justify-center">
                                    <ProductCardSkeleton />
                                </div>
                            ))}
                        </div>
                    ) : paginatedProducts.length === 0 ? (
                        /* Empty state: No products found */
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <SlidersHorizontal className="size-16 text-zinc-300 dark:text-zinc-700 mb-4 stroke-[1.25]" />
                            <h3 className="font-sarabun font-bold text-xl text-zinc-800 dark:text-zinc-200">
                                {t("noProductsTitle")}
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 font-sarabun max-w-sm mt-2">
                                {t("noProductsSubtitle")}
                            </p>
                            <button
                                onClick={handleResetAll}
                                className="mt-6 px-5 py-2.5 bg-[#A6252A] hover:bg-[#741C21] text-white text-sm font-semibold rounded-xl font-sarabun transition-colors border-none cursor-pointer"
                            >
                                {t("resetAllFilters")}
                            </button>
                        </div>
                    ) : (
                        /* Products Grid */
                        <div className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
                                {paginatedProducts.map((product) => (
                                    <div key={product.id} className="w-full flex justify-center">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination component */}
                            <Pagination
                                currentPage={activePage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useRef, useEffect, useState } from "react";
import { Menu, User, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "next-auth/react";

// Constants & Types
import { STATS, CATEGORIES, TOP_PRODUCTS, LOW_STOCK } from "@/features/admin/constants/dashboard";
import { RevenueFilter } from "@/features/admin/types/dashboard";

// API Hooks
import { useProfile } from "@/features/auth/hooks";

// Local Hooks & Components
import { useTabState } from "@/features/admin/hooks/use-tab-state";
import { DashboardBreadcrumb } from "@/features/admin/components/dashboard-breadcrumb";

// Feature Components
import { Sidebar } from "@/features/admin/components/sidebar";
import { BottomNav } from "@/features/admin/components/bottom-nav";
import { CategoryRow } from "@/features/admin/components/category-row";
import { RevenueChart } from "@/features/admin/components/revenue-chart";
import { RevenueFilterToggle } from "@/features/admin/components/revenue-filter-toggle";
import { TopProductRow } from "@/features/admin/components/top-product-row";
import { StockRow } from "@/features/admin/components/stock-row";
import { DonutChart } from "@/features/admin/components/donut-chart";
import { StatCard } from "@/features/admin/components/stat-card";
import { CategoriesTab } from "@/features/admin/components/categories-tab";
import { OccasionsTab } from "@/features/admin/components/occasions-tab";
import { ProductsTab } from "@/features/admin/components/products-tab";

// ─── Utility ──────────────────────────────────────────────────────────────────

function resolveImageUrl(url?: string): string {
    if (!url) return "/images/jake-miller.png";
    if (url.startsWith("http")) return url;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "https://flower.elevateegy.com";
    return `${base}${url}`;
}

// ─── Overview Tab Content ─────────────────────────────────────────────────────

function OverviewContent({
    revenueFilter,
    setRevenueFilter,
}: {
    revenueFilter: RevenueFilter;
    setRevenueFilter: (f: RevenueFilter) => void;
}) {
    return (
        <div className="animate-fade-in flex flex-col gap-6 w-full">
            {/* Stats + Categories row */}
            <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
                <div className="w-full lg:flex-1 h-auto lg:h-81.5 bg-white dark:bg-zinc-900 rounded-2xl p-6 grid grid-cols-2 gap-4 shadow-sm border border-black/5 dark:border-white/5">
                    {STATS.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>
                <div className="w-full lg:flex-[1.2] h-81.5 bg-white dark:bg-zinc-900 rounded-2xl p-6 flex flex-col gap-4 border border-black/5 dark:border-white/5 shadow-sm">
                    <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 h-7.25 leading-7.25">
                        All Categories
                    </h2>
                    <div className="flex flex-col gap-2.5 h-58.25 overflow-y-auto pr-1">
                        {CATEGORIES.map((cat) => (
                            <CategoryRow key={cat.name} {...cat} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts row */}
            <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
                <div className="w-full lg:w-72 lg:min-w-72 h-95.25 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 relative shadow-sm overflow-hidden">
                    <h2 className="font-semibold text-2xl leading-7 text-zinc-800 dark:text-zinc-200 absolute top-6 left-0 right-0 text-center z-10">
                        Orders Status
                    </h2>
                    <DonutChart />
                </div>
                <div className="w-full lg:flex-1 h-95.25 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between mb-4 gap-4 h-7.25">
                        <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 leading-7.25">
                            Revenue
                        </h2>
                        <RevenueFilterToggle filter={revenueFilter} onChange={setRevenueFilter} />
                    </div>
                    <div className="flex-1 w-full h-74.25">
                        <RevenueChart filter={revenueFilter} />
                    </div>
                </div>
            </div>

            {/* Top Selling + Low Stock row */}
            <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
                <div className="w-full lg:flex-1 h-110.75 bg-white dark:bg-zinc-900 rounded-2xl p-6 flex flex-col gap-6 border border-black/5 dark:border-white/5 shadow-sm">
                    <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 h-7.25 leading-7.25">
                        Top Selling Products
                    </h2>
                    <div className="flex flex-col gap-2.5 h-85.5 overflow-y-auto pr-1">
                        {TOP_PRODUCTS.map((p) => (
                            <TopProductRow key={`${p.rank}-${p.name}`} {...p} />
                        ))}
                    </div>
                </div>
                <div className="w-full lg:flex-1 h-110.75 bg-white dark:bg-zinc-900 rounded-2xl p-6 flex flex-col gap-6 border border-black/5 dark:border-white/5 shadow-sm">
                    <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 h-7.25 leading-7.25">
                        Low Stock Products
                    </h2>
                    <div className="flex flex-col gap-2.5 h-85.5 overflow-y-auto pr-1">
                        {LOW_STOCK.map((p) => (
                            <StockRow key={p.name + p.stock} {...p} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
    const router = useRouter();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const {
        activeTab,
        revenueFilter,
        categories,
        occasions,
        products,
        setRevenueFilter,
        handleTabChange,
        handleCategoriesViewChange,
        handleOccasionsViewChange,
        handleProductsViewChange,
    } = useTabState();

    const { data: profileData } = useProfile();

    // Mount guard — prevents localStorage hydration flash
    useEffect(() => {
        const handle = requestAnimationFrame(() => setIsMounted(true));
        return () => cancelAnimationFrame(handle);
    }, []);

    // Close mobile menu on outside click
    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const handler = (e: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isMobileMenuOpen]);

    const handleLogout = () => signOut({ callbackUrl: "/login" });

    // ── Shared breadcrumb props ────────────────────────────────────────────────
    const breadcrumbProps = {
        activeTab,
        categoriesView: categories.view,
        occasionsView: occasions.view,
        productsView: products.view,
        editingCategory: categories.editing,
        editingOccasion: occasions.editing,
        editingProduct: products.editing,
        onTabChange: handleTabChange,
    };

    // ── Tab content ───────────────────────────────────────────────────────────
    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <OverviewContent
                        revenueFilter={revenueFilter}
                        setRevenueFilter={setRevenueFilter}
                    />
                );
            case "categories":
                return (
                    <CategoriesTab
                        view={categories.view}
                        setView={(view) => handleCategoriesViewChange(view)}
                        editingCategory={categories.editing}
                        setEditingCategory={(item) =>
                            handleCategoriesViewChange(item ? "edit" : "list", item)
                        }
                    />
                );
            case "occasions":
                return (
                    <OccasionsTab
                        view={occasions.view}
                        setView={(view) => handleOccasionsViewChange(view)}
                        editingOccasion={occasions.editing}
                        setEditingOccasion={(item) =>
                            handleOccasionsViewChange(item ? "edit" : "list", item)
                        }
                    />
                );
            case "products":
                return (
                    <ProductsTab
                        view={products.view}
                        setView={(view) => handleProductsViewChange(view)}
                        editingProduct={products.editing}
                        setEditingProduct={(item) =>
                            handleProductsViewChange(item ? "edit" : "list", item)
                        }
                    />
                );
            default:
                return null;
        }
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (!isMounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                    <span className="text-sm text-zinc-500 font-sans">Loading panel...</span>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300">

            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    onLogout={handleLogout}
                    onPreview={() => router.push("/")}
                    user={profileData}
                />
            </div>

            {/* Mobile Top Header */}
            <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-black/8 dark:border-white/8 sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/images/logo.svg"
                        alt="Rose App Logo"
                        width={52}
                        height={49}
                        className="object-contain shrink-0"
                    />
                    <DashboardBreadcrumb {...breadcrumbProps} variant="header" />
                </div>

                <div className="flex items-center gap-3 relative" ref={mobileMenuRef}>
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 relative bg-zinc-100 border border-zinc-200/60">
                        <Image
                            src={resolveImageUrl(profileData?.photo)}
                            alt="User Avatar"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 border-none bg-transparent cursor-pointer text-zinc-800 dark:text-zinc-200"
                        aria-label="Open menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <Menu size={24} />
                    </button>

                    {isMobileMenuOpen && (
                        <div className="absolute top-10 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 flex flex-col gap-1 w-36 z-30 animate-fade-in">
                            <button
                                type="button"
                                className="flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer font-medium"
                                onClick={() => { setIsMobileMenuOpen(false); router.push("/profile"); }}
                            >
                                <User size={15} className="text-zinc-500" />
                                Account
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm text-primary-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer font-medium"
                                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                            >
                                <LogOut size={15} />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
                {/* Desktop inner breadcrumb bar */}
                <div className="hidden md:flex items-center px-6 py-5.5 border-b border-zinc-200 dark:border-zinc-800 -mx-6 -mt-6 mb-6 bg-white dark:bg-zinc-900">
                    <DashboardBreadcrumb {...breadcrumbProps} variant="subheader" />
                </div>

                {renderTabContent()}
            </main>

            {/* Mobile Bottom Nav */}
            <BottomNav
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                onPreview={() => router.push("/")}
            />
        </div>
    );
}